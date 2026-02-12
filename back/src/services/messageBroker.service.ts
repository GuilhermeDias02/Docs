import { Server, Socket } from "socket.io";
import { DocumentService } from "./document.service";
import { Message } from "../models/message.model";
import { TextAdded, TextToAdd } from "../models/addText.model";

export class MessageBroker {
  private isDocBeingModified: Map<number, boolean> = new Map<number, boolean>(
    null,
  );

  constructor(
    private readonly server: Server,
    private readonly documentService: DocumentService,
  ) {}

  public sendDocumentList(socket: Socket): void {
    try {
      socket.emit("message", {
        type: "liste",
        data: {
          docs: this.documentService.getAll(),
        },
      });
    } catch (error) {
      socket.emit(
        JSON.stringify({
          type: "error",
          error: "Les documents n'ont pas pu être récupérés",
        }),
      );
    }
  }

  public messageManager(socket: Socket, message: Message): void {
    switch (message.type) {
      case "doc":
        this.enterDoc(socket, message.data.docID ?? 0);
        break;
      case "createDoc":
        this.createDoc(socket, message.data.docName ?? "Sans titre");
        break;
      case "addText":
        this.sendTextAfterAddition(socket, {
          wordPos: message.data.wordPos ?? 0,
          wordText: message.data.wordText ?? "",
          additionPos: message.data.additionPos ?? 0,
          additionText: message.data.additionText ?? "",
        } as TextToAdd);
            break;
        case "addChar":
            this.addChar(socket, message.data.char ?? "", message.data.pos ?? 0);
            break;
        case "rmChar":
            this.delChar(socket, message.data.pos ?? 0);
            break;
      case "cursor":
        const cursorPos = message.data.cursorPos;
        if (cursorPos) {
          this.sendCursors(socket, cursorPos);
        } else {
          socket.emit("message", {
            type: "error",
            error: "Please send a valid cursor position value",
          });
        }
        break;
      default:
        socket.emit("message", {
          type: "error",
          error: "Type de message inconnu.",
        });
        break;
    }
  }

  private enterDoc(socket: Socket, docId: number): void {
    try {
      if (docId <= 0) {
        throw new Error("Le numéro doit être supérieur ou égal à 0.");
      }

      socket.join(`doc_${docId}`);
      socket.emit("message", {
        type: "docComplet",
        data: this.documentService.getById(docId),
      });
      const cursorPos = this.documentService.getCursorPos(docId);
      const room = this.getSocketRoom(socket);
      this.server.to(room).emit("message", {
        type: "cursor",
        data: {
          cursors: cursorPos,
        },
      });
    } catch (error) {
      const roomName = `doc_${docId}`;
      if (socket.rooms.has(roomName)) {
        socket.leave(roomName);
      }

      socket.emit("message", {
        type: "error",
        error: `Le document à l'id ${docId} n'a pas pu être récupéré: ${error}`,
      });
    }
  }

  private createDoc(socket: Socket, docName: string): void {
    try {
      this.documentService.createDoc(docName);
      // Broadcast updated document list to all connected clients
      this.server.emit("message", {
        type: "liste",
        data: {
          docs: this.documentService.getAll(),
        },
      });
    } catch (error) {
      socket.emit("message", {
        type: "error",
        error: `Le document n'a pas pu être créé: ${error}`,
      });
    }
  }

  private sendTextAfterAddition(socket: Socket, textToAdd: TextToAdd): void {
    try {
      const room = this.getSocketRoom(socket);
      const docId = this.getDocIdByRoom(room);
      const newContent = this.addText(docId, textToAdd);

      this.server
        .to(room)
        .emit("message", { type: "addText", data: newContent });
    } catch (error) {
      socket.emit("message", {
        type: "error",
        error: `Le document n'a pas pu être modifié:\n\t${error}`,
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
          const wordInContent = currentContent.slice(
            textToAdd.wordPos,
            textToAdd.wordPos + textToAdd.wordText.length,
          );
          if (wordInContent != textToAdd.wordText) {
            throw new Error(
              "#123 | Le document modifié n'est pas le même que celui présent en base de donées",
            );
          }

          //traitement du nouveau contenu
          newWord = {
            wordPos: 1,
            wordText: "ghjokp",
          };
        } else {
          throw new Error(
            "#123 | Le document modifié n'est pas le même que celui présent en base de donées",
          );
        }
      }

      this.documentService.updateContent(doc.id, newContent);
      return newWord;
    } catch (error) {
      throw error;
    }
  }

  private sendCursors(socket: Socket, cursorPos: number): void {
    try {
      const room = this.getSocketRoom(socket);
      const docId = this.getDocIdByRoom(room);

      const cursors = this.documentService.setCursorPos(
        docId,
        socket.id,
        cursorPos,
      );

      this.server.to(room).emit("message", {
        type: "cursor",
        data: {
          cursors,
        },
      });
    } catch (error) {
      socket.emit("message", {
        type: "error",
        error: `La position des curseurs n'a pas pu être mise à jour:\n\t${error}`,
      });
    }
  }

  private getSocketRoom(socket: Socket): string {
    // The socket.rooms is a Set containing all joined rooms, including the socket id.
    // We want the first custom room (whose name starts with 'doc_').
    for (const room of socket.rooms) {
      if (room.startsWith("doc_")) {
        return room;
      }
    }
    throw new Error("Le socket n'est dans aucun document");
  }

  private getSocketDocRoomOrNull(socket: Socket): string | null {
    for (const room of socket.rooms) {
      if (room.startsWith("doc_")) {
        return room;
      }
    }
    return null;
  }

  private getDocIdByRoom(roomName: string): number {
    const match = /^doc_(\d+)$/.exec(roomName);
    if (!match) {
      throw new Error("Nom de salle invalide.");
    }
    return Number(match[1]);
  }

  public disconnect(socket: Socket): void {
    const room = this.getSocketDocRoomOrNull(socket);
    if (room) {
      this.server.to(room).emit("message", {
        type: "cursor",
        data: {
          cursors: this.documentService.deleteCurorPos(
            this.getDocIdByRoom(room),
            socket.id,
          ),
        },
      });
    }

    console.log("Client déconnecté:", socket.id);
  }

    public addChar(socket: Socket, char: string, pos: number): void {
        try {
            if (!char || char.length !== 1) {
                throw new Error("Le param char doit être un seul caractère et non vide.");
            }

            const room = this.getSocketRoom(socket);
            const newChar = this.documentService.addChar(char, pos, this.getDocIdByRoom(room));
            socket.to(room).emit("message", {
                type: "addChar",
                data: {
                    char: newChar.char,
                    pos: newChar.pos
                }
            });
        } catch (error) {
            socket.emit("message", {
                type: "error",
                error: `Erreur lors de l'ajout d'un nouveau charactère {char:${char}, pos:${pos}}:\n\t${error}`,
            });
        }
    }

    public delChar(socket: Socket, pos: number): void {
        try {
            const room = this.getSocketRoom(socket);
            const deletedPos = this.documentService.delChar(pos, this.getDocIdByRoom(room));
            socket.to(room).emit("message", {
                type: "addChar",
                data: {
                    pos: deletedPos
                }
            });
        } catch (error) {
            socket.emit("message", {
                type: "error",
                error: `Erreur lors de la suppression d'un charactère {pos: ${pos}}: \n\t${error}`,
            });
        }
    }
}
