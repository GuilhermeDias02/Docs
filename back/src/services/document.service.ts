import { DatabaseInterface } from "../db/database";
import { Document } from "../models/document.model";
import { DocumentListDto } from "../models/documentListDto.model";

export class DocumentService {
    constructor(private readonly db: DatabaseInterface) {
        this.db.connect()
            .runMigrations();
    }

    public getAll(): DocumentListDto[] {
        try {
            const allDocs = this.db.getAll();
            return allDocs.filter((document: Document) => {
                return { id: document.id, name: document.name } as DocumentListDto;
            }) as DocumentListDto[];
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

    public updateContent(id: number, newContent: string): Document {
        try {
            let doc = this.db.get(id);
            if (!doc) {
                throw new Error(`Il n'existe aucun document avec l'id ${id}`);
            }

            doc.content = newContent;
            return this.db.update(doc);
        } catch (error) {
            throw new Error(`Erreur lors du traitement du Document à l'id ${id}:\n\t${error}`);
        }
    }
}