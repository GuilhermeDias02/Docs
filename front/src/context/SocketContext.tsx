import { createContext, useContext } from "react";
import { io, Socket } from "socket.io-client";

// Grâce au proxy Vite, "/" pointe vers le back (via /socket.io)
export const socket: Socket = io("/", {
  transports: ["websocket"],
});

export const SocketContext = createContext<Socket>(socket);

export function useSocket() {
  return useContext(SocketContext);
}
