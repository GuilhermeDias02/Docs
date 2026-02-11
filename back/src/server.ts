import http from "http";
import express from "express";
import { Server } from "socket.io";
import { initializeDatabase } from "./db/db";
import { DocumentService } from "./services/document.service";

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("chat message", (msg: string) => {
    console.log("Message received:", msg);
    io.emit("chat message", msg);
  });
  socket.on("doc", async (docId: number) => {
    console.log("Document requested:", docId);
    try {
      const document = await DocumentService.getOrCreateById(docId);
      socket.emit("docComplet", {
        id: document.id,
        name: document.name,
        content: document.content,
      });
    } catch (error) {
      console.error("Unable to fetch document:", error);
      socket.emit("docComplet", {
        id: docId,
        name: `Document ${docId}`,
        content: "",
      });
      socket.emit("docError", { message: "Unable to fetch document" });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

async function startServer(): Promise<void> {
  try {
    await initializeDatabase();
    const PORT = Number(process.env.PORT) || 3000;
    httpServer.listen(PORT, () => {
      console.log(`Socket.IO server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`Erreur lors du démarrage du serveur:\n${error}`);
    process.exit(1);
  }
}

void startServer();
