"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
class DocumentService {
    constructor(db) {
        this.db = db;
        this.db.connect()
            .runMigrations();
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
}
exports.DocumentService = DocumentService;
