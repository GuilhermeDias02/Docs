import { WebSocketProvider } from "./context/wsprovider";
import { Document } from "./document";

export function Home() {
    return (
        <WebSocketProvider>
            <Document/>
        </WebSocketProvider>
    );
}