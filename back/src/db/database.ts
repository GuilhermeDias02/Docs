import { Document } from "../models/document.model";

export interface DatabaseInterface {
    /**
     * Initiate database connection
     * @param database Database path or name
     * @returns this or throws an error
     */
    connect(): this;
    /**
     * Close database connection
     * @returns void or throws an error
     */
    close(): void;
    /**
     * Update database structure
     * @returns void or throws an error
     */
    runMigrations(): void;

    /**
     * Fetch all Documents
     * @returns A list of Document or throws an error
     */
    getAll(): Document[];
    /**
     * Fetch a Document by id
     * @param id Document's id
     * @returns a Document or null if not found; Can throw an error
     */
    get(id: number): Document | null;
    /**
     * Register the new Document
     * @param data Document to add
     * @returns The new Document from the db or throws an error
     */
    post(data: Document): Document | null;
    /**
     * Update a documents info
     * @param data updated Document info
     * @returns The updated Document or throws an error
     */
    update(data: Document): Document;
    /**
     * Deletes the Document by its id
     * @param id Document to delete
     * @returns true if the Document was deleted or false if the Document to delete doesn't exist; Can throw an error
     */
    delete(id: number): boolean;
}
