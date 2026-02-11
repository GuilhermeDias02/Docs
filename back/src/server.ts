import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { DocumentService } from './services/document.service';
import { SqliteDatabase } from './db/sqliteDatabase';
import { MessageBroker } from './services/messageBroker.service';
import { Message } from './models/message.model';

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: '*',
    },
});

const messageBrokerService = new MessageBroker(
    io,
    new DocumentService(new SqliteDatabase("documents.db"))
);

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    messageBrokerService.sendDocumentList(socket);

    socket.on('message', (msg: Message) => {
        messageBrokerService.messageManager(socket, msg);
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