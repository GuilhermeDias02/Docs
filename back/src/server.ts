import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { DocumentService } from './services/document.service';
import { SqliteDatabase } from './db/sqliteDatabase';

const app = express();
const httpServer = http.createServer(app);
const database = new SqliteDatabase("documents.sql");
const documentService = new DocumentService(database);

const io = new Server(httpServer, {
    cors: {
        origin: '*',
    },
});

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('chat message', (msg: string) => {
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
} catch (error) {
    console.error(`Erreur lors du démarrage du serveur:\n${error}`);
}