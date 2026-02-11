import { Server, Socket } from 'socket.io';
import { DocumentService } from "./document.service";
import { Message } from '../models/message.model';
import { TextAdded, TextToAdd } from '../models/addText.model';

export class MessageBroker {
    private isDocBeingModified: Map<number, boolean> = new Map<number, boolean>(null);

    constructor(
        private readonly server: Server,
        private readonly documentService: DocumentService,
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
            case "doc":
                this.enterDoc(socket, message.data.docID ?? 0);
                break;
            case "addText":
                this.sendTextAfterAddition(
                    socket,
                    {
                        wordPos: message.data.wordPos ?? 0,
                        wordText: message.data.wordText ?? "",
                        additionPos: message.data.additionPos ?? 0,
                        additionText: message.data.additionText ?? ""
                    } as TextToAdd
                );
                break;
            default:
                socket.emit("message", {
                    type: "error",
                    error: "Type de message inconnu."
                });
                break
        }
    }

    public enterDoc(socket: Socket, docId: number): void {
        try {
            if (docId <= 0) {
                throw new Error("Le numéro doit être supérieur ou égal à 0.");
            }

            socket.join(`doc_${docId}`);
            socket.emit("message", {
                type: "docComplet",
                data: this.documentService.getById(docId)
            });
        } catch (error) {
            const roomName = `doc_${docId}`;
            if (socket.rooms.has(roomName)) {
                socket.leave(roomName);
            }

            socket.emit("message", {
                type: "error",
                error: `Le document à l'id ${docId} n'a pas pu être récupéré: ${error}`
            });
        }
    }

    public sendTextAfterAddition(socket: Socket, textToAdd: TextToAdd): void {
        try {
            const firstRoom = socket.rooms.values().next().value;
            if (!firstRoom) {
                throw new Error("Le socket n'est dans aucun document");
            }

            const match = /^doc_(\d+)$/.exec(firstRoom);
            if (!match) {
                throw new Error("Nom de salle invalide.");
            }
            const id = Number(match[1]);
            const newContent = this.addText(id, textToAdd);

            this.server.to(firstRoom).emit("message", { type: "addText", data: newContent });
        } catch (error) {
            socket.emit("message", {
                type: "error",
                error: `Le document n'a pas pu être modifié:\n\t${error}`
            });
        }
    }

    private addText(docId: number, textToAdd: TextToAdd): TextAdded {
        try {
            let doc = this.documentService.getById(docId);
            const currentContent = doc.content ?? "";
            let newWord: TextAdded;
            let newContent: string = "";

            if (currentContent.length == 0) {
                newWord = {
                    wordPos: 0,
                    wordText: textToAdd.additionText,
                };
                newContent = textToAdd.additionText;
            } else {
                if (textToAdd.wordPos < currentContent.length) {
                    const wordInContent = currentContent.slice(textToAdd.wordPos, textToAdd.wordPos + textToAdd.wordText.length);
                    if (wordInContent != textToAdd.wordText) {
                        throw new Error("#123 | Le document modifié n'est pas le même que celui présent en base de donées");
                    }

                    //traitement du nouveau contenu
                    newWord = {
                        wordPos: 1,
                        wordText: "ghjokp"
                    }
                } else {
                    throw new Error("#123 | Le document modifié n'est pas le même que celui présent en base de donées");
                }
            }

            this.documentService.updateContent(doc.id, newContent);
            return newWord;
        } catch (error) {
            throw new Error(`${error}`);
        }
    }
}