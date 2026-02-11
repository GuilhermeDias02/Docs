import { Server, Socket } from 'socket.io';
import { DocumentService } from "./document.service";

export class MessageBroker {
    constructor(
        private readonly server: Server,
        private readonly documentService: DocumentService
    ) { }

    public sendDocumentList(socket: Socket): void {
        try {
            socket.emit("message", {
                type: "liste",
                data: {
                    docs: this.documentService.getAll()
                }
            });
        } catch (error) {
            socket.emit(JSON.stringify({ type: "error", error: "Les documents n'ont pas pu être récupérés" }));
        }
    }

    // public messageManager(socket: Socket, messsage: ?): void {

    // }
}