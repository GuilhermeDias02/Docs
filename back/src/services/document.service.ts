import { DatabaseInterface } from "../db/database";

export class DocumentService {
    constructor(private readonly db: DatabaseInterface) { }
}