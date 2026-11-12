import { Server, Socket } from "socket.io";
import { decode } from "next-auth/jwt";
import prisma from "@/lib/prisma";

interface GroupPayload { groupCode: string }
interface MessagePayload { message: string }

const onlineUsers = new Map<string, Map<string, number>>();

export function registerSocketHandlers(io: Server) {
  // Render is a separate domain, so it cannot receive the browser's Vercel
  // NextAuth cookie. Authenticate with a short-lived token issued by the app.
  io.use(async (socket, next) => {
    try {
      const secret = process.env.NEXTAUTH_SECRET;
      const authToken = socket.handshake.auth?.token;

      if (!secret || typeof authToken !== "string") {
        return next(new Error("Unauthorized"));
      }

      const token = await decode({ token: authToken, secret });
      const userId = token?.id ?? token?.sub;

      if (!userId || typeof userId !== "string") {
        return next(new Error("Unauthorized"));
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, userdetails: { select: { name: true, profilephoto: true } } },
      });
      if (!user) return next(new Error("Unauthorized"));

      socket.data.userId = user.id;
      socket.data.userName = user.userdetails?.name ?? "ShareWallet member";
      socket.data.profilePhoto = user.userdetails?.profilephoto ?? null;
      next();
    } catch (error) {
      console.error("SOCKET AUTH ERROR:", error);
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket: Socket) => {
    socket.on("join-group", async (data: GroupPayload) => {
      try {
        const groupCode = typeof data?.groupCode === "string" ? data.groupCode : "";
        if (!groupCode) return socket.emit("group-error", { message: "Invalid group." });

        const group = await prisma.group.findFirst({
          where: {
            groupCode,
            OR: [
              { createdId: socket.data.userId },
              { groupmember: { some: { userId: socket.data.userId } } },
            ],
          },
          select: { id: true, groupCode: true },
        });
        if (!group) return socket.emit("group-error", { message: "You are not a member of this group." });

        const previousGroup = socket.data.groupCode as string | undefined;
        if (previousGroup && previousGroup !== group.groupCode) {
          socket.leave(previousGroup);
          const previousUsers = onlineUsers.get(previousGroup);
          if (previousUsers) {
            const count = (previousUsers.get(socket.data.userId) ?? 1) - 1;
            if (count <= 0) previousUsers.delete(socket.data.userId);
            else previousUsers.set(socket.data.userId, count);
            io.to(previousGroup).emit("online-users", previousUsers.size);
          }
        }

        socket.join(group.groupCode);
        socket.data.groupCode = group.groupCode;
        socket.data.groupId = group.id;
        if (!onlineUsers.has(group.groupCode)) onlineUsers.set(group.groupCode, new Map());
        const users = onlineUsers.get(group.groupCode)!;
        users.set(socket.data.userId, (users.get(socket.data.userId) ?? 0) + 1);
        io.to(group.groupCode).emit("online-users", users.size);
      } catch (error) {
        console.error("SOCKET JOIN GROUP ERROR:", error);
        socket.emit("group-error", { message: "Unable to join this group." });
      }
    });

    socket.on("leave-group", () => {
      const groupCode = socket.data.groupCode as string | undefined;
      if (!groupCode) return;
      socket.leave(groupCode);
      const users = onlineUsers.get(groupCode);
      if (users) {
        const count = (users.get(socket.data.userId) ?? 1) - 1;
        if (count <= 0) users.delete(socket.data.userId);
        else users.set(socket.data.userId, count);
        io.to(groupCode).emit("online-users", users.size);
      }
      socket.data.groupCode = undefined;
      socket.data.groupId = undefined;
    });

    socket.on("typing", () => {
      const groupCode = socket.data.groupCode as string | undefined;
      if (!groupCode) return;
      socket.to(groupCode).emit("typing", {
        userId: socket.data.userId,
        userName: socket.data.userName,
      });
    });

    socket.on("stop-typing", () => {
      const groupCode = socket.data.groupCode as string | undefined;
      if (!groupCode) return;
      socket.to(groupCode).emit("stop-typing", { userId: socket.data.userId });
    });

    socket.on("send-message", async (data: MessagePayload) => {
      const groupCode = socket.data.groupCode as string | undefined;
      const groupId = socket.data.groupId as string | undefined;
      const message = typeof data?.message === "string" ? data.message.trim() : "";
      if (!groupCode || !groupId) return socket.emit("message-error", { message: "Join a group before sending messages." });
      if (!message || message.length > 4000) return socket.emit("message-error", { message: "Message must contain 1–4000 characters." });

      try {
        const saved = await prisma.message.create({
          data: { groupId, userId: socket.data.userId, message },
          include: { user: { include: { userdetails: true } } },
        });
        io.to(groupCode).emit("receive-message", saved);
      } catch (error) {
        console.error("SOCKET SEND MESSAGE ERROR:", error);
        socket.emit("message-error", { message: "Failed to send message. Please try again." });
      }
    });

    socket.on("disconnect", () => {
      const groupCode = socket.data.groupCode as string | undefined;
      const userId = socket.data.userId as string | undefined;
      if (!groupCode || !userId) return;
      const users = onlineUsers.get(groupCode);
      if (!users) return;
      const count = (users.get(userId) ?? 1) - 1;
      if (count <= 0) users.delete(userId);
      else users.set(userId, count);
      io.to(groupCode).emit("online-users", users.size);
    });
  });
}
