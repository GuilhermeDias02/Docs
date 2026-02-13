import { DatabaseInterface } from "./database";
import { Document } from "../models/document.model";

/**
 * Simple in-memory implementation of DatabaseInterface intended for unit tests.
 */
export class InMemoryDatabase implements DatabaseInterface {
  private documents: Map<number, Document> = new Map();
  private autoIncrementId = 1;

  connect(): this {
    return this;
  }

  close(): void {
    // nothing to do for in-memory
  }

  runMigrations(): void {
    // no-op: schema is implicit in the in-memory representation
  }

  getAll(): Document[] {
    return Array.from(this.documents.values());
  }

  get(id: number): Document | null {
    return this.documents.get(id) ?? null;
  }

  post(data: Document): Document {
    const id = this.autoIncrementId++;
    const doc: Document = {
      id,
      name: data.name,
      content: data.content ?? "",
    };
    this.documents.set(id, doc);
    return doc;
  }

  update(data: Document): Document {
    if (!data.id || !this.documents.has(data.id)) {
      throw new Error(`Document with id ${data.id} does not exist`);
    }
    const updated: Document = {
      id: data.id,
      name: data.name,
      content: data.content ?? "",
    };
    this.documents.set(data.id, updated);
    return updated;
  }

  delete(id: number): boolean {
    return this.documents.delete(id);
  }
}

