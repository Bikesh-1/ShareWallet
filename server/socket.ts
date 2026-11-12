import { Server } from "socket.io";

let io: Server;

export const initSocket = (httpServer: any) => {
    const allowedOrigins = [
        "http://localhost:3000",
        process.env.APP_URL,
    ].filter((origin): origin is string => Boolean(origin));

    io = new Server(httpServer, {
        cors: {
            origin: allowedOrigins,
            methods: ["GET", "POST"],
        },
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
};
