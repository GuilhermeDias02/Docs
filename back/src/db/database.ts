import { Document } from "../models/document.model";

export abstract class DatabaseService<TConnection> {
    /**
     * Initiate database connection
     * @param database Database name
     */
    abstract connect(database: string): this;
    /**
     * Close database connection
     */
    abstract close(): void;
    /**
     * Update database structure
     */
    abstract runMigrations(): void;

    /**
     * Fetch all Documents
     */
    abstract getAll(): Document[];
    /**
     * Fetch a Document by id
     * @param id Document's id
     */
    abstract get(id: number): Document | null;
    /**
     * Register the new Document
     * @param data Document to add
     */
    abstract post(data: Document): Document | null;
    /**
     * Update a documents info
     * @param data updated Document info
     */
    abstract update(data: Document): Document | null;
    /**
     * Deletes the Document by its id
     * @param id Document to update
     */
    abstract delete(id: number): boolean;
}
