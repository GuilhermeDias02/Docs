"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
class DocumentService {
    constructor(db) {
        this.db = db;
        this.cursorsPos = new Map();
        this.db.connect().runMigrations();
    }
    getAll() {
        try {
            const allDocs = this.db.getAll();
            return allDocs.filter((document) => {
                return { id: document.id, name: document.name };
            });
        }
        catch (error) {
            throw new Error(`Erreur lors du traitement de la liste des Documents:\n\t${error}`);
        }
    }
    getById(id) {
        try {
            const doc = this.db.get(id);
            if (!doc) {
                throw new Error(`Il n'existe aucun document avec l'id ${id}`);
            }
            return doc;
        }
        catch (error) {
            throw new Error(`Erreur lors du traitement du Document à l'id ${id}:\n\t${error}`);
        }
    }
    updateContent(id, newContent) {
        try {
            let doc = this.db.get(id);
            if (!doc) {
                throw new Error(`Il n'existe aucun document avec l'id ${id}`);
            }
            doc.content = newContent;
            return this.db.update(doc);
        }
        catch (error) {
            throw new Error(`Erreur lors du traitement du Document à l'id ${id}:\n\t${error}`);
        }
    }
    setCursorPos(docId, socketId, cursorPos) {
        // Get existing cursor positions for this document, or initialize a new array
        let docCursorPositions = this.cursorsPos.get(docId);
        if (!docCursorPositions) {
            docCursorPositions = [];
            this.cursorsPos.set(docId, docCursorPositions);
        }
        // Ensure uniqueness per socketId: update if exists, otherwise push a new entry
        const existing = docCursorPositions.find((pos) => pos.socketId === socketId);
        if (existing) {
            existing.cursorPos = cursorPos;
        }
        else {
            docCursorPositions.push({ socketId, cursorPos });
        }
        return docCursorPositions;
    }
    deleteCurorPos(docId, socketId) {
        const docCursorPositions = this.cursorsPos.get(docId);
        if (!docCursorPositions) {
            return [];
        }
        const index = docCursorPositions.findIndex((pos) => pos.socketId === socketId);
        if (index !== -1) {
            docCursorPositions.splice(index, 1);
        }
        // If no more cursors for this doc, optionally remove the map entry
        if (docCursorPositions.length === 0) {
            this.cursorsPos.delete(docId);
            return [];
        }
        return docCursorPositions;
    }
    getCursorPos(docId) {
        var _a;
        return (_a = this.cursorsPos.get(docId)) !== null && _a !== void 0 ? _a : [];
    }
}
exports.DocumentService = DocumentService;
