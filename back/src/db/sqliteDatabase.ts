import Database from 'better-sqlite3';
import { DatabaseService } from './database';
import { Document } from '../models/document.model';

export class SqliteDatabase extends DatabaseService<Database.Database> {
    private db: Database.Database | null = null;
    private readonly dbPath: string;

    private constructor(dbPath: string) {
        super();
        this.dbPath = dbPath;
    }

    public connect(dbPath: string): this {
        this.db = new Database(dbPath);
        return this;
    }

    private getConnection(): Database.Database {
        if (!this.db) {
            throw new Error('Database not connected. Call connect() first.');
        }
        return this.db;
    }

    public runMigrations(): void {
        const db = this.getConnection();
        db.exec(`
            CREATE TABLE IF NOT EXISTS document (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                content TEXT
            );
        `);
    }

    public close(): void {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }

    getAll(): Document[] {
        try {
            const db = this.getConnection();
            return db.prepare(`SELECT * FROM document`).all() as Document[];
        } catch (error) {
            console.error(`Erreur lors de la récupération de tous les documents: ${error}`);
            return [];
        }
    }

    get(id: number): Document | null {
        try {
            const db = this.getConnection();
            const row = db.prepare(`SELECT * FROM document WHERE id = ?`).get(id) as Document;
            return row ?? null;
        } catch (error) {
            console.error(`Erreur dans la récupération du document à l'identifiant ${id}: ${error}}`);
            return null;
        }
    }

    post(newDocument: Document): Document | null {
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
            console.error(`Erreur lors de l'ajout d'un document: ${error}}`);
            return null;
        }
    }

    update(updatedDocument: Document): Document | null {
        try {
            const db = this.getConnection();
            const preparedRequest = db.prepare(`UPDATE document SET name=?, content=? WHERE id=?`);
            const result = preparedRequest.run(updatedDocument.name, updatedDocument.content ?? null, updatedDocument.id);
            return this.get(updatedDocument.id);
        } catch (error) {
            console.error(`Erreur dans la modification du document à l'identifiant ${updatedDocument.id}: ${error}}`);
            return null;
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
            console.error(`Erreur dans la suppression du document à l'identifiant ${id}: ${error}}`);
            return false;
        }
    }
}
