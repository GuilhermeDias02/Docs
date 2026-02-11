import { DatabaseInterface } from "../db/database";
import { Document } from "../models/document.model";
import { DocumentListDto } from "../models/documentListDto.model";

export class DocumentService {
  constructor(private readonly db: DatabaseInterface) {
    this.db.connect().runMigrations();
  }

  public getAll(): DocumentListDto[] {
    try {
      const allDocs = this.db.getAll();
      return allDocs.map((document: Document) => ({
        id: document.id,
        name: document.name,
      }));
    } catch (error) {
      throw new Error(`Erreur lors du traitement de la liste des Documents:\n\t${error}`);
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
      throw new Error(`Erreur lors du traitement du Document à l'id ${id}:\n\t${error}`);
    }
  }

  public create(name: string): Document {
    try {
      const safeName = (name ?? "").trim();
      const finalName = safeName.length > 0 ? safeName : "Nouveau document";

      const created = this.db.post({
        id: 0,
        name: finalName,
        content: "",
      });

      if (!created) {
        throw new Error("La base a retourné null lors de la création.");
      }

      return created;
    } catch (error) {
      throw new Error(`Erreur lors de la création du document:\n\t${error}`);
    }
  }
}
