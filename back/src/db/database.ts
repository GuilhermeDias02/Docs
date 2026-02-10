import { Document } from "../models/document.model";

export interface DatabaseInterface {
    /**
     * Initiate database connection
     * @param database Database path or name
     */
    connect(database: string): this;
    /**
     * Close database connection
     */
    close(): void;
    /**
     * Update database structure
     */
    runMigrations(): void;

    /**
     * Fetch all Documents
     */
    getAll(): Document[];
    /**
     * Fetch a Document by id
     * @param id Document's id
     */
    get(id: number): Document | null;
    /**
     * Register the new Document
     * @param data Document to add
     */
    post(data: Document): Document | null;
    /**
     * Update a documents info
     * @param data updated Document info
     */
    update(data: Document): Document | null;
    /**
     * Deletes the Document by its id
     * @param id Document to delete
     */
    delete(id: number): boolean;
}
