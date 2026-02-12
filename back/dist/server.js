"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const document_service_1 = require("./services/document.service");
const sqliteDatabase_1 = require("./db/sqliteDatabase");
const messageBroker_service_1 = require("./services/messageBroker.service");
const app = (0, express_1.default)();
const httpServer = http_1.default.createServer(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
    },
});
const messageBrokerService = new messageBroker_service_1.MessageBroker(io, new document_service_1.DocumentService(new sqliteDatabase_1.SqliteDatabase("documents.db")));
io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    messageBrokerService.sendDocumentList(socket);
    socket.on("message", (msg) => {
        messageBrokerService.messageManager(socket, msg);
    });
    socket.on("disconnecting", () => {
        messageBrokerService.disconnect(socket);
    });
});
try {
    const PORT = Number(process.env.PORT) || 3000;
    httpServer.listen(PORT, () => {
        console.log(`Socket.IO server running on http://localhost:${PORT}`);
    });
}
catch (error) {
    console.error(`Erreur lors du démarrage du serveur:\n${error}`);
}
