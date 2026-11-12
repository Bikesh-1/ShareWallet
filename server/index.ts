import "dotenv/config";
import express from "express";
import http from "http";
import { initSocket } from "./socket";
import { registerSocketHandlers } from "./socketHandler";

const app = express();
const server = http.createServer(app);

app.get("/", (_req, res) => {
    res.status(200).send("ShareWallet Socket.IO server is running");
});

const io = initSocket(server);
registerSocketHandlers(io);

const PORT = Number(process.env.PORT) || 3001;

server.listen(PORT, () => {
    console.log(`Socket.IO server running on port ${PORT}`);
});
