"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { Message } from "@/types/message";

interface UseSocketProps {
    groupCode: string;
    groupId: string;
    userId: string;
    userName: string;
}

export function useSocket({
    groupCode,
    groupId,
    userId,
    userName,
}: UseSocketProps) {
    const socketRef = useRef<Socket | null>(null);
    const queryClient = useQueryClient();
    const [onlineUsers, setOnlineUsers] = useState(0);
    const [typingUser, setTypingUser] = useState("");
    const typingTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!groupCode || !groupId || !userId) return;

        let cancelled = false;
        let socket: Socket | null = null;

        const connectSocket = async () => {
            try {
                // The Socket.IO server is hosted on Render (a different domain),
                // so the browser cannot send the Vercel NextAuth cookie to it.
                // Request a short-lived socket token from the authenticated app.
                const tokenResponse = await fetch("/api/socket-token", {
                    method: "GET",
                    cache: "no-store",
                });

                if (!tokenResponse.ok) {
                    throw new Error("Unable to authenticate chat connection. Please sign in again.");
                }

                const { token } = await tokenResponse.json();
                if (cancelled) return;
                if (!token) throw new Error("Chat authorization token was not returned.");

                const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
                if (!socketUrl) throw new Error("Socket server URL is not configured.");

                socket = io(socketUrl, {
                    auth: { token },
                    reconnection: true,
                });
                socketRef.current = socket;

                socket.on("connect", () => {
                    socket?.emit("join-group", { groupCode, groupId, userId, userName });
                });

                socket.on("connect_error", (error) => {
                    console.error("SOCKET CONNECTION ERROR:", error.message);
                });

                socket.on("group-error", (error: { message?: string }) => {
                    console.error("SOCKET GROUP ERROR:", error?.message);
                });

                socket.on("message-error", (error: { message?: string }) => {
                    console.error("SOCKET MESSAGE ERROR:", error?.message);
                });

                socket.on("receive-message", (message: Message) => {
                    queryClient.setQueryData<Message[]>(
                        ["messages", groupCode],
                        (old = []) => old.some((item) => item.id === message.id)
                            ? old
                            : [...old, message]
                    );
                });

                socket.on("online-users", (count: number) => {
                    setOnlineUsers(count);
                });

                socket.on("typing", ({ userName }: { userName: string }) => {
                    setTypingUser(userName);
                });

                socket.on("stop-typing", () => {
                    setTypingUser("");
                });
            } catch (error) {
                if (!cancelled) {
                    console.error("SOCKET INITIALIZATION ERROR:", error);
                }
            }
        };

        connectSocket();

        return () => {
            cancelled = true;
            if (socket) {
                socket.emit("leave-group", { groupCode });
                socket.disconnect();
            }
            if (socketRef.current === socket) socketRef.current = null;
            if (typingTimeout.current) clearTimeout(typingTimeout.current);
            setOnlineUsers(0);
            setTypingUser("");
        };
    }, [groupCode, groupId, userId, userName, queryClient]);

    const sendMessage = (message: string) => {
        if (!message.trim()) return;
        socketRef.current?.emit("send-message", { groupCode, message });
    };

    const typing = () => {
        socketRef.current?.emit("typing", { groupCode });
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => {
            socketRef.current?.emit("stop-typing", { groupCode });
        }, 1000);
    };

    return {
        socket: socketRef,
        sendMessage,
        typing,
        onlineUsers,
        typingUser,
    };
}
