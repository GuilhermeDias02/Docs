"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
const db_1 = require("../db/db");
class DocumentService {
    static async getOrCreateById(id) {
        const existingDocument = await (0, db_1.get)("SELECT id, name, content FROM documents WHERE id = $id", { id });
        if (existingDocument) {
            return existingDocument;
        }
        const newDocument = {
            id,
            name: `Document ${id}`,
            content: "",
        };
        await (0, db_1.run)("INSERT INTO documents (id, name, content) VALUES ($id, $name, $content)", {
            id: newDocument.id,
            name: newDocument.name,
            content: newDocument.content,
        });
        return newDocument;
    }
}
exports.DocumentService = DocumentService;
