import { DatabaseInterface } from "../db/database";
import { CursorPos } from "../models/cursor.model";
import { Document } from "../models/document.model";
import { DocumentListDto } from "../models/documentListDto.model";

export class DocumentService {
  private cursorsPos: Map<number, CursorPos[]> = new Map<number, CursorPos[]>();

  constructor(private readonly db: DatabaseInterface) {
    this.db.connect().runMigrations();
  }
  public create(docName: string): Document {
    return this.db.post({ id: 0, name: docName, content: "" }) as Document;
  }

  public getAll(): DocumentListDto[] {
    try {
      const allDocs = this.db.getAll();
      return allDocs.filter((document: Document) => {
        return { id: document.id, name: document.name } as DocumentListDto;
      }) as DocumentListDto[];
    } catch (error) {
      throw new Error(
        `Erreur lors du traitement de la liste des Documents:\n\t${error}`,
      );
    }
  }

  public getById(id: number): Document {
    try {
      const doc = this.db.get(id);
      if (!doc) {
        throw new Error(`Il n'existe aucun document avec l'id ${id}`);
      }
      return doc;
    } catch (error) {
      throw new Error(
        `Erreur lors du traitement du Document à l'id ${id}:\n\t${error}`,
      );
    }
  }

  public updateContent(id: number, newContent: string): Document {
    try {
      let doc = this.db.get(id);
      if (!doc) {
        throw new Error(`Il n'existe aucun document avec l'id ${id}`);
      }

      doc.content = newContent;
      return this.db.update(doc);
    } catch (error) {
      throw new Error(
        `Erreur lors du traitement du Document à l'id ${id}:\n\t${error}`,
      );
    }
  }

  public setCursorPos(
    docId: number,
    socketId: string,
    cursorPos: number,
  ): CursorPos[] {
    // Get existing cursor positions for this document, or initialize a new array
    let docCursorPositions = this.cursorsPos.get(docId);
    if (!docCursorPositions) {
      docCursorPositions = [];
      this.cursorsPos.set(docId, docCursorPositions);
    }

    // Ensure uniqueness per socketId: update if exists, otherwise push a new entry
    const existing = docCursorPositions.find(
      (pos: CursorPos) => pos.socketId === socketId,
    );
    if (existing) {
      existing.cursorPos = cursorPos;
    } else {
      docCursorPositions.push({ socketId, cursorPos });
    }

    return docCursorPositions;
  }

  public createDoc(docName: string): Document {
    try {
      const newDoc = this.create(docName);
      return newDoc;
    } catch (error) {
      throw new Error(`Le document n'a pas pu être créé: ${error}`);
    }
  }

  public deleteCurorPos(docId: number, socketId: string): CursorPos[] {
    const docCursorPositions = this.cursorsPos.get(docId);
    if (!docCursorPositions) {
      return [];
    }

    const index = docCursorPositions.findIndex(
      (pos: CursorPos) => pos.socketId === socketId,
    );
    if (index !== -1) {
      docCursorPositions.splice(index, 1);
    }

    // If no more cursors for this doc, optionally remove the map entry
    if (docCursorPositions.length === 0) {
      this.cursorsPos.delete(docId);
      return [];
    }

    return docCursorPositions;
  }
  public getCursorPos(docId: number): CursorPos[] {
    return this.cursorsPos.get(docId) ?? [];
  }
}
