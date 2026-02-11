"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const db_1 = require("./db/db");
const document_service_1 = require("./services/document.service");
const app = (0, express_1.default)();
const httpServer = http_1.default.createServer(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
    },
});
io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    socket.on("chat message", (msg) => {
        console.log("Message received:", msg);
        io.emit("chat message", msg);
    });
    socket.on("doc", async (docId) => {
        console.log("Document requested:", docId);
        try {
            const document = await document_service_1.DocumentService.getOrCreateById(docId);
            socket.emit("docComplet", {
                id: document.id,
                name: document.name,
                text: document.content,
            });
        }
        catch (error) {
            console.error("Unable to fetch document:", error);
            socket.emit("docError", { message: "Unable to fetch document" });
        }
    });
    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});
async function startServer() {
    try {
        await (0, db_1.initializeDatabase)();
        const PORT = Number(process.env.PORT) || 3000;
        httpServer.listen(PORT, () => {
            console.log(`Socket.IO server running on http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error(`Erreur lors du démarrage du serveur:\n${error}`);
        process.exit(1);
    }
}
void startServer();
