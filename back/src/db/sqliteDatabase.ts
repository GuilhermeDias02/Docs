import Database from 'better-sqlite3';
import { DatabaseInterface } from './database';
import { Document } from '../models/document.model';

export class SqliteDatabase implements DatabaseInterface {
    private db: Database.Database | null = null;
    private readonly dbPath: string;

    constructor(dbPath: string) {
        this.dbPath = dbPath;
    }

    public connect(): this {
        try {
            console.log("Connexion à la base de données...");
            this.db = new Database(this.dbPath);
            console.log("Connecté à la base de données.");
            return this;
        } catch (error) {
            throw new Error(`Erreur lors de la connection à la base de données:\n\t${error}`);
        }
    }

    private getConnection(): Database.Database {
        if (!this.db) {
            throw new Error('Aucune connexion à la base de données. Appellez connect() avant.');
        }
        return this.db;
    }

    public runMigrations(): void {
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
        } catch (error) {
            throw new Error(`Erreur lors de la migration:\n\t${error}`);
        }
    }

    public close(): void {
        try {
            if (this.db) {
                this.db.close();
                this.db = null;
            }
        } catch (error) {
            throw new Error(`Erreur lors de la fermeture de la connexion à la base de données:\n\t${error}`);
        }
    }

    getAll(): Document[] {
        try {
            const db = this.getConnection();
            return db.prepare(`SELECT * FROM document`).all() as Document[];
        } catch (error) {
            throw new Error(`Erreur lors de la récupération de tous les documents:\n\t${error}`);
        }
    }

    get(id: number): Document | null {
        try {
            const db = this.getConnection();
            const row = db.prepare(`SELECT * FROM document WHERE id = ?`).get(id) as Document;
            return row ?? null;
        } catch (error) {
            throw new Error(`Erreur dans la récupération du document à l'identifiant ${id}:\n\t${error}}`);
        }
    }

    post(newDocument: Document): Document {
        try {
            const db = this.getConnection();
            const preparedRequest = db.prepare(`INSERT INTO document (name, content) VALUES (?, ?)`);
            const result = preparedRequest.run(newDocument.name, newDocument.content ?? null);
            return {
                id: result.lastInsertRowid as number,
                name: newDocument.name,
                content: newDocument.content
            };
        } catch (error) {
            throw new Error(`Erreur lors de l'ajout d'un document:\n\t${error}}`);
        }
    }

    update(updatedDocument: Document): Document | null {
        try {
            const db = this.getConnection();
            const preparedRequest = db.prepare(`UPDATE document SET name=?, content=? WHERE id=?`);
            preparedRequest.run(updatedDocument.name, updatedDocument.content ?? null, updatedDocument.id);
            return this.get(updatedDocument.id);
        } catch (error) {
            throw new Error(`Erreur dans la modification du document à l'identifiant ${updatedDocument.id}:\n\t${error}}`);
        }
    }

    delete(id: number): boolean {
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
        } catch (error) {
            throw new Error(`Erreur dans la suppression du document à l'identifiant ${id}:\n\t${error}}`);
        }
    }
}
