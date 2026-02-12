"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqliteDatabase = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
class SqliteDatabase {
    constructor(dbPath) {
        this.db = null;
        this.dbPath = dbPath;
    }
    connect() {
        try {
            console.log("Connexion à la base de données...");
            this.db = new better_sqlite3_1.default(this.dbPath);
            console.log("Connecté à la base de données.");
            return this;
        }
        catch (error) {
            throw new Error(`Erreur lors de la connection à la base de données:\n\t${error}`);
        }
    }
    getConnection() {
        if (!this.db) {
            throw new Error('Aucune connexion à la base de données. Appellez connect() avant.');
        }
        return this.db;
    }
    runMigrations() {
        try {
            console.log("Mise à jour de la structure de la db.");
            const db = this.getConnection();
            db.exec(`
                CREATE TABLE IF NOT EXISTS document (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    content TEXT
                );
            `);
            console.log("Migration effectuée.");
        }
        catch (error) {
            throw new Error(`Erreur lors de la migration:\n\t${error}`);
        }
    }
    close() {
        try {
            if (this.db) {
                this.db.close();
                this.db = null;
            }
        }
        catch (error) {
            throw new Error(`Erreur lors de la fermeture de la connexion à la base de données:\n\t${error}`);
        }
    }
    getAll() {
        try {
            const db = this.getConnection();
            return db.prepare(`SELECT * FROM document`).all();
        }
        catch (error) {
            throw new Error(`Erreur lors de la récupération de tous les documents:\n\t${error}`);
        }
    }
    get(id) {
        try {
            const db = this.getConnection();
            const row = db.prepare(`SELECT * FROM document WHERE id = ?`).get(id);
            return row !== null && row !== void 0 ? row : null;
        }
        catch (error) {
            throw new Error(`Erreur dans la récupération du document à l'identifiant ${id}:\n\t${error}}`);
        }
    }
    post(newDocument) {
        var _a;
        try {
            const db = this.getConnection();
            const preparedRequest = db.prepare(`INSERT INTO document (name, content) VALUES (?, ?)`);
            const result = preparedRequest.run(newDocument.name, (_a = newDocument.content) !== null && _a !== void 0 ? _a : null);
            return {
                id: result.lastInsertRowid,
                name: newDocument.name,
                content: newDocument.content
            };
        }
        catch (error) {
            throw new Error(`Erreur lors de l'ajout d'un document:\n\t${error}}`);
        }
    }
    update(updatedDocument) {
        var _a;
        try {
            const db = this.getConnection();
            const preparedRequest = db.prepare(`UPDATE document SET name=?, content=? WHERE id=?`);
            preparedRequest.run(updatedDocument.name, (_a = updatedDocument.content) !== null && _a !== void 0 ? _a : null, updatedDocument.id);
            const documentInDb = this.get(updatedDocument.id);
            if (!documentInDb) {
                throw new Error(`Le Document avec l'id ${updatedDocument.id} n'existe plus`);
            }
            return documentInDb;
        }
        catch (error) {
            throw new Error(`Erreur dans la modification du document à l'identifiant ${updatedDocument.id}:\n\t${error}}`);
        }
    }
    delete(id) {
        try {
            if (!this.get(id)) {
                return false;
            }
            const db = this.getConnection();
            db.prepare(`DELETE FROM document WHERE id = ?`).run(id);
            if (!this.get(id)) {
                return true;
            }
            return false;
        }
        catch (error) {
            throw new Error(`Erreur dans la suppression du document à l'identifiant ${id}:\n\t${error}}`);
        }
    }
}
exports.SqliteDatabase = SqliteDatabase;
