import { Server } from "socket.io";

let io: Server;

export const initSocket = (httpServer: any) => {
    // Keep the Socket.IO CORS allowlist aligned with the deployed Next.js app.
    // CLIENT_URLS supports multiple comma-separated production/preview origins.
    const configuredOrigins = [
        process.env.APP_URL,
        process.env.NEXT_PUBLIC_APP_URL,
        ...(process.env.CLIENT_URLS || "").split(","),
    ]
        .map((origin) => origin?.trim().replace(/\/$/, ""))
        .filter((origin): origin is string => Boolean(origin));

    const allowedOrigins = new Set([
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        ...configuredOrigins,
    ]);

    io = new Server(httpServer, {
        cors: {
            origin: (origin, callback) => {
                // Requests without an Origin header are server-to-server/health checks.
                if (!origin || allowedOrigins.has(origin.replace(/\/$/, ""))) {
                    callback(null, true);
                    return;
                }

                console.warn("SOCKET CORS BLOCKED ORIGIN:", origin);
                callback(new Error("Origin is not allowed by the Socket.IO server."), false);
            },
            methods: ["GET", "POST"],
        },
        // Render supports WebSockets; polling remains enabled as a fallback.
        transports: ["websocket", "polling"],
    });

    console.log("Socket.IO allowed frontend origins:", [...allowedOrigins]);

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
};
