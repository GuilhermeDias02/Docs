"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageBroker = void 0;
class MessageBroker {
    constructor(server, documentService) {
        this.server = server;
        this.documentService = documentService;
        this.isDocBeingModified = new Map(null);
    }
    sendDocumentList(socket) {
        try {
            socket.emit("message", {
                type: "liste",
                data: {
                    docs: this.documentService.getAll()
                }
            });
        }
        catch (error) {
            socket.emit(JSON.stringify({ type: "error", error: "Les documents n'ont pas pu être récupérés" }));
        }
    }
    messageManager(socket, message) {
        var _a, _b, _c, _d, _e;
        switch (message.type) {
            case "doc":
                this.enterDoc(socket, (_a = message.data.docID) !== null && _a !== void 0 ? _a : 0);
                break;
            case "addText":
                this.sendTextAfterAddition(socket, {
                    wordPos: (_b = message.data.wordPos) !== null && _b !== void 0 ? _b : 0,
                    wordText: (_c = message.data.wordText) !== null && _c !== void 0 ? _c : "",
                    additionPos: (_d = message.data.additionPos) !== null && _d !== void 0 ? _d : 0,
                    additionText: (_e = message.data.additionText) !== null && _e !== void 0 ? _e : ""
                });
                break;
            default:
                socket.emit("message", {
                    type: "error",
                    error: "Type de message inconnu."
                });
                break;
        }
    }
    enterDoc(socket, docId) {
        try {
            if (docId <= 0) {
                throw new Error("Le numéro doit être supérieur ou égal à 0.");
            }
            socket.join(`doc_${docId}`);
            socket.emit("message", {
                type: "docComplet",
                data: this.documentService.getById(docId)
            });
        }
        catch (error) {
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
    sendTextAfterAddition(socket, textToAdd) {
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
        }
        catch (error) {
            socket.emit("message", {
                type: "error",
                error: `Le document n'a pas pu être modifié:\n\t${error}`
            });
        }
    }
    addText(docId, textToAdd) {
        var _a;
        try {
            let doc = this.documentService.getById(docId);
            const currentContent = (_a = doc.content) !== null && _a !== void 0 ? _a : "";
            let newWord;
            let newContent = "";
            if (currentContent.length == 0) {
                newWord = {
                    wordPos: 0,
                    wordText: textToAdd.additionText,
                };
                newContent = textToAdd.additionText;
            }
            else {
                if (textToAdd.wordPos < currentContent.length) {
                    const wordInContent = currentContent.slice(textToAdd.wordPos, textToAdd.wordPos + textToAdd.wordText.length);
                    if (wordInContent != textToAdd.wordText) {
                        throw new Error("#123 | Le document modifié n'est pas le même que celui présent en base de donées");
                    }
                    //traitement du nouveau contenu
                    newWord = {
                        wordPos: 1,
                        wordText: "ghjokp"
                    };
                }
                else {
                    throw new Error("#123 | Le document modifié n'est pas le même que celui présent en base de donées");
                }
            }
            this.documentService.updateContent(doc.id, newContent);
            return newWord;
        }
        catch (error) {
            throw new Error(`${error}`);
        }
    }
}
exports.MessageBroker = MessageBroker;
