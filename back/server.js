import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5174, http://localhost:5174"],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("client connecté", socket.id);

  socket.emit("message", {
    type: "liste",
    data: {
      docs: [
        { id: 1, nom: "Cours Java" },
        { id: 2, nom: "Mémoire EFREI" },
      ],
    },
  });
});

httpServer.listen(3000, () => console.log("Back on 3000"));
 