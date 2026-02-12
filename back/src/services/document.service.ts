import { DatabaseInterface } from "../db/database";
import { AddedChar } from "../models/addText.model";
import { CursorPos } from "../models/cursor.model";
import { Document } from "../models/document.model";
import { DocumentListDto } from "../models/documentListDto.model";

export class DocumentService {
  private cursorsPos: Map<number, CursorPos[]> = new Map<number, CursorPos[]>();
    private isDocumentBeingModified: Map<number, boolean> = new Map<number, boolean>();

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

    public addChar(char: string, charPos: number, docId: number): AddedChar {
        try {
            //ne pas traiter la demande si modifications en cours
            while (this.isDocumentBeingModified.get(docId)) {
                continue;
            }
            this.isDocumentBeingModified.set(docId, true);

            let doc = this.db.get(docId);
            if (!doc) {
                throw new Error(`Le document à l'id ${docId} n'existe pas.`);
            }
            if (!doc.content) {
                doc.content = "";
            }
            if (doc.content.length < charPos - 1) {
                throw new Error("La position du charatère n'es pas bonne");
            }

            // Insert the char inside doc.content at the charPos position
            if (doc.content.length == 0) {
                doc.content = char;
            } else {
                const before = doc.content.slice(0, charPos);
                const after = doc.content.slice(charPos);
                doc.content = before + char + after;
            }
            this.db.update(doc);
            this.isDocumentBeingModified.set(docId, false);

            return {
                char: char,
                pos: charPos - 1
            };
        } catch (error) {
            this.isDocumentBeingModified.set(docId, false);
            throw new Error(`Erreur lors du traitement d'un nouveau caratère: ${error}`)
        }
    }

    public delChar(charPos: number, docId: number): number {
        try {
            //ne pas traiter la demande si modifications en cours
            while (this.isDocumentBeingModified.get(docId)) {
                continue;
            }
            this.isDocumentBeingModified.set(docId, true);

            let doc = this.db.get(docId);
            if (!doc) {
                throw new Error(`Le document à l'id ${docId} n'existe pas.`);
            }
            if (!doc.content || doc.content.length < charPos) {
                throw new Error("La position du charatère n'es pas bonne");
            }

            // Delete the character at the charPos position
            const before = doc.content.slice(0, charPos);
            const after = doc.content.slice(charPos + 1);
            doc.content = before + after;
            this.db.update(doc);
            this.isDocumentBeingModified.set(docId, false);

            return charPos;
        } catch (error) {
            this.isDocumentBeingModified.set(docId, false);
            throw new Error(`Erreur lors du traitement de la suppression d'un caratère: ${error}`);
        }
    }
}
