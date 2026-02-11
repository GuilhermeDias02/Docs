import { Server, Socket } from 'socket.io';
import { DocumentService } from "./document.service";
import { Message } from '../models/message.model';

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

    public messageManager(socket: Socket, message: Message): void {
        switch (message.type) {
            case 'doc':
                this.sendDoc(socket, message.data.docID ?? 0);
                break;
            default:

                break
        }
    }

    public sendDoc(socket: Socket, id: number): void {
        try {
            if (id <= 0) {
                throw new Error("Le numéro doit être supérieur ou égal à 0.");
            }
            socket.emit("message", {
                type: "docComplet",
                data: this.documentService.getById(id)
            });
        } catch (error) {
            socket.emit("message", {
                type: "error",
                error: `Le document à l'id ${id} n'a pas pu être récupéré: ${error}`
            });
        }
    }
}