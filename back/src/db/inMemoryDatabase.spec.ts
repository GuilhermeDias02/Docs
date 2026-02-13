import { InMemoryDatabase } from "./inMemoryDatabase";
import { Document } from "../models/document.model";

describe("InMemoryDatabase", () => {
  let db: InMemoryDatabase;

  beforeEach(() => {
    db = new InMemoryDatabase().connect();
    db.runMigrations(); // should be a no-op
  });

  it("connects and closes without error", () => {
    expect(() => db.connect()).not.toThrow();
    expect(() => db.close()).not.toThrow();
  });

  it("inserts and retrieves a document", () => {
    const created = db.post({ id: 0, name: "Doc", content: "hello" } as Document);
    expect(created.id).toBeGreaterThan(0);
    expect(created.name).toBe("Doc");
    expect(created.content).toBe("hello");

    const fetched = db.get(created.id);
    expect(fetched).toEqual(created);
  });

  it("returns all documents", () => {
    db.post({ id: 0, name: "Doc1", content: "" } as Document);
    db.post({ id: 0, name: "Doc2", content: "" } as Document);

    const all = db.getAll();
    expect(all).toHaveLength(2);
    expect(all.map((d) => d.name).sort()).toEqual(["Doc1", "Doc2"]);
  });

  it("updates an existing document", () => {
    const created = db.post({ id: 0, name: "Doc", content: "a" } as Document);

    const updated = db.update({
      id: created.id,
      name: "Doc-updated",
      content: "b",
    });

    expect(updated.id).toBe(created.id);
    expect(updated.name).toBe("Doc-updated");
    expect(updated.content).toBe("b");

    const fetched = db.get(created.id)!;
    expect(fetched).toEqual(updated);
  });

  it("throws when updating a non-existing document", () => {
    expect(() =>
      db.update({ id: 999, name: "Missing", content: "" } as Document),
    ).toThrow("Document with id 999 does not exist");
  });

  it("deletes an existing document and returns true", () => {
    const created = db.post({ id: 0, name: "Doc", content: "" } as Document);
    const result = db.delete(created.id);
    expect(result).toBe(true);
    expect(db.get(created.id)).toBeNull();
  });

  it("returns false when deleting a non-existing document", () => {
    const result = db.delete(1234);
    expect(result).toBe(false);
  });
});

