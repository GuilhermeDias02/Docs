import { get, run } from "../db/db";
import type { Document } from "../models/document.model";

export class DocumentService {
  static async getOrCreateById(id: number): Promise<Document> {
    const existingDocument = await get<{ id: number | bigint; name: string; content: string }>(
      "SELECT id, name, content FROM documents WHERE id = $id",
      { id }
    );

    if (existingDocument) {
      return {
        id: Number(existingDocument.id),
        name: existingDocument.name,
        content: existingDocument.content,
      };
    }

    const newDocument: Document = {
      id,
      name: `Document ${id}`,
      content: "",
    };

    await run("INSERT INTO documents (id, name, content) VALUES ($id, $name, $content)", {
      id: newDocument.id,
      name: newDocument.name,
      content: newDocument.content,
    });

    return newDocument;
  }
}