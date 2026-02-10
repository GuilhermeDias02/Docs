"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const httpServer = http_1.default.createServer(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: '*',
    },
});
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('chat message', (msg) => {
        console.log('Message received:', msg);
        io.emit('chat message', msg);
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
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
