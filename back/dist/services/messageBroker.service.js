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
                    docs: this.documentService.getAll(),
                },
            });
        }
        catch (error) {
            socket.emit(JSON.stringify({
                type: "error",
                error: "Les documents n'ont pas pu être récupérés",
            }));
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
                    additionText: (_e = message.data.additionText) !== null && _e !== void 0 ? _e : "",
                });
                break;
            case "cursor":
                const cursorPos = message.data.cursorPos;
                if (cursorPos) {
                    this.sendCursors(socket, cursorPos);
                }
                else {
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
    enterDoc(socket, docId) {
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
        }
        catch (error) {
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
    sendTextAfterAddition(socket, textToAdd) {
        try {
            const room = this.getSocketRoom(socket);
            const docId = this.getDocIdByRoom(room);
            const newContent = this.addText(docId, textToAdd);
            this.server
                .to(room)
                .emit("message", { type: "addText", data: newContent });
        }
        catch (error) {
            socket.emit("message", {
                type: "error",
                error: `Le document n'a pas pu être modifié:\n\t${error}`,
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
                        wordText: "ghjokp",
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
            throw error;
        }
    }
    sendCursors(socket, cursorPos) {
        try {
            const room = this.getSocketRoom(socket);
            const docId = this.getDocIdByRoom(room);
            const cursors = this.documentService.setCursorPos(docId, socket.id, cursorPos);
            this.server.to(room).emit("message", {
                type: "cursor",
                data: {
                    cursors,
                },
            });
        }
        catch (error) {
            socket.emit("message", {
                type: "error",
                error: `La position des curseurs n'a pas pu être mise à jour:\n\t${error}`,
            });
        }
    }
    getSocketRoom(socket) {
        // The socket.rooms is a Set containing all joined rooms, including the socket id.
        // We want the first custom room (whose name starts with 'doc_').
        for (const room of socket.rooms) {
            if (room.startsWith("doc_")) {
                return room;
            }
        }
        throw new Error("Le socket n'est dans aucun document");
    }
    getSocketDocRoomOrNull(socket) {
        for (const room of socket.rooms) {
            if (room.startsWith("doc_")) {
                return room;
            }
        }
        return null;
    }
    getDocIdByRoom(roomName) {
        const match = /^doc_(\d+)$/.exec(roomName);
        if (!match) {
            throw new Error("Nom de salle invalide.");
        }
        return Number(match[1]);
    }
    disconnect(socket) {
        const room = this.getSocketDocRoomOrNull(socket);
        if (room) {
            this.server.to(room).emit("message", {
                type: "cursor",
                data: {
                    cursors: this.documentService.deleteCurorPos(this.getDocIdByRoom(room), socket.id),
                },
            });
        }
        console.log("Client déconnecté:", socket.id);
    }
}
exports.MessageBroker = MessageBroker;
