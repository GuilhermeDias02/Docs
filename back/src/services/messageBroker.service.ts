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

    public messageManager(socket: Socket, messsage: string): void {
        switch (typeof JSON.parse(messsage).data) {
            case 'number':
                this.sendDoc(socket, JSON.parse(messsage).data);
                break;
            case 'object':

                break
        }
    }

    public sendDoc(socket: Socket, id: number): void {

    }
}