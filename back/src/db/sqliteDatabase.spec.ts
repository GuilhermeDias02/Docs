import Database from "better-sqlite3";
import { SqliteDatabase } from "./sqliteDatabase";
import { Document } from "../models/document.model";

jest.mock("better-sqlite3");

type BetterSqlite3Mock = jest.Mocked<typeof Database> & {
  mockInstances?: any[];
};

describe("SqliteDatabase", () => {
  const dbPath = "test-db.sqlite";

  let db: SqliteDatabase;
  let mockInstance: {
    exec: jest.Mock;
    prepare: jest.Mock;
    close: jest.Mock;
  };

  beforeEach(() => {
    (Database as unknown as jest.Mock).mockClear();
    mockInstance = {
      exec: jest.fn(),
      prepare: jest.fn(),
      close: jest.fn(),
    };
    (Database as unknown as jest.Mock).mockImplementation(() => mockInstance);

    db = new SqliteDatabase(dbPath).connect();
  });

  it("runs migrations successfully", () => {
    db.runMigrations();
    expect(mockInstance.exec).toHaveBeenCalled();
  });

  it("inserts and retrieves a document", () => {
    const runMock = jest.fn().mockReturnValue({ lastInsertRowid: 1 });
    const getMock = jest
      .fn()
      .mockReturnValue({ id: 1, name: "Doc", content: "" } as Document);

    mockInstance.prepare.mockImplementation((sql: string) => {
      if (sql.startsWith("INSERT")) {
        return { run: runMock } as any;
      }
      if (sql.startsWith("SELECT")) {
        return { get: getMock, all: jest.fn().mockReturnValue([]) } as any;
      }
      return {} as any;
    });

    const created = db.post({ id: 0, name: "Doc", content: "" });
    expect(created.id).toBe(1);

    const fetched = db.get(1);
    expect(fetched).toEqual({ id: 1, name: "Doc", content: "" });
  });

  it("updates a document", () => {
    const runMock = jest.fn();
    const getMock = jest
      .fn()
      .mockReturnValue({ id: 1, name: "Updated", content: "c" } as Document);

    mockInstance.prepare.mockImplementation((sql: string) => {
      if (sql.startsWith("UPDATE")) {
        return { run: runMock } as any;
      }
      if (sql.startsWith("SELECT")) {
        return { get: getMock, all: jest.fn().mockReturnValue([]) } as any;
      }
      return {} as any;
    });

    const updated = db.update({ id: 1, name: "Updated", content: "c" });
    expect(updated.name).toBe("Updated");
  });

  it("deletes a document", () => {
    const selectMock = jest
      .fn()
      .mockReturnValueOnce({ id: 1, name: "Doc", content: "" } as Document)
      .mockReturnValueOnce(null);
    const deleteRunMock = jest.fn();

    mockInstance.prepare.mockImplementation((sql: string) => {
      if (sql.startsWith("DELETE")) {
        return { run: deleteRunMock } as any;
      }
      if (sql.startsWith("SELECT")) {
        return { get: selectMock, all: jest.fn().mockReturnValue([]) } as any;
      }
      return {} as any;
    });

    const result = db.delete(1);
    expect(result).toBe(true);
  });

  it("closes the connection", () => {
    db.close();
    expect(mockInstance.close).toHaveBeenCalled();
  });
});

