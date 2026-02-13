import { InMemoryDatabase } from "../db/inMemoryDatabase";
import { DocumentService } from "./document.service";

describe("DocumentService", () => {
  let db: InMemoryDatabase;
  let service: DocumentService;

  beforeEach(() => {
    db = new InMemoryDatabase();
    service = new DocumentService(db);
  });

  it("creates a document", () => {
    const doc = service.createDoc("Test");
    expect(doc.id).toBeGreaterThan(0);
    expect(doc.name).toBe("Test");
    expect(doc.content).toBe("");
  });

  it("gets a document by id", () => {
    const created = service.createDoc("Doc");
    const fetched = service.getById(created.id);
    expect(fetched).toEqual(created);
  });

  it("updates document content", () => {
    const created = service.createDoc("Doc");
    const updated = service.updateContent(created.id, "hello");
    expect(updated.content).toBe("hello");
  });

  it("manages cursor positions per document and socket", () => {
    const positions1 = service.setCursorPos(1, "socket1", 5);
    expect(positions1).toEqual([{ socketId: "socket1", cursorPos: 5 }]);

    const positions2 = service.setCursorPos(1, "socket1", 7);
    expect(positions2).toEqual([{ socketId: "socket1", cursorPos: 7 }]);

    const positions3 = service.setCursorPos(1, "socket2", 10);
    expect(positions3).toContainEqual({ socketId: "socket1", cursorPos: 7 });
    expect(positions3).toContainEqual({ socketId: "socket2", cursorPos: 10 });

    expect(service.getCursorPos(1).length).toBe(2);

    const afterDelete = service.deleteCurorPos(1, "socket1");
    expect(afterDelete).toHaveLength(1);
    expect(afterDelete[0].socketId).toBe("socket2");
  });

  it("adds a char at the correct position", () => {
    const created = service.createDoc("Doc");
    service.addChar("a", 0, created.id);
    const updated = db.get(created.id)!;
    expect(updated.content).toBe("a");
  });

  it("deletes a char at the correct position", () => {
    const created = service.createDoc("Doc");
    // seed content
    db.update({ ...created, content: "abc" });
    const pos = service.delChar(1, created.id);
    expect(pos).toBe(1);
    const updated = db.get(created.id)!;
    expect(updated.content).toBe("ac");
  });
});

