import { Server, Socket } from "socket.io";
import { MessageBroker } from "./messageBroker.service";
import { DocumentService } from "./document.service";
import { InMemoryDatabase } from "../db/inMemoryDatabase";

function createMockSocket(): jest.Mocked<Socket> {
  return {
    id: "socket1",
    join: jest.fn(),
    leave: jest.fn(),
    emit: jest.fn(),
    to: jest.fn().mockReturnThis(),
    rooms: new Set<string>(),
  } as any;
}

function createMockServer(): jest.Mocked<Server> {
  const server: Partial<Server> = {
    emit: jest.fn(),
    to: jest.fn().mockReturnThis(),
  };
  return server as jest.Mocked<Server>;
}

describe("MessageBroker", () => {
  let server: jest.Mocked<Server>;
  let socket: jest.Mocked<Socket>;
  let documentService: DocumentService;
  let broker: MessageBroker;

  beforeEach(() => {
    server = createMockServer();
    socket = createMockSocket();
    const db = new InMemoryDatabase();
    documentService = new DocumentService(db);
    broker = new MessageBroker(server, documentService);
  });

  it("sends document list", () => {
    jest.spyOn(documentService, "getAll").mockReturnValue([
      { id: 1, name: "Doc" } as any,
    ]);

    broker.sendDocumentList(socket);

    expect(socket.emit).toHaveBeenCalledWith("message", {
      type: "liste",
      data: { docs: [{ id: 1, name: "Doc" }] },
    });
  });

  it("handles unknown message type", () => {
    broker.messageManager(socket, { type: "unknown", data: {} } as any);
    expect(socket.emit).toHaveBeenCalledWith("message", {
      type: "error",
      error: "Type de message inconnu.",
    });
  });

  it("enters a document room and sends doc + cursors", () => {
    const db = new InMemoryDatabase();
    const docService = new DocumentService(db);
    const created = docService.createDoc("Doc");

    documentService = docService;
    broker = new MessageBroker(server, documentService);

    jest.spyOn(documentService, "getById").mockReturnValue(created as any);
    jest.spyOn(documentService, "getCursorPos").mockReturnValue([]);

    socket.rooms.add(`doc_${created.id}`);
    broker["enterDoc"](socket, created.id);

    expect(socket.join).toHaveBeenCalledWith(`doc_${created.id}`);
    expect(socket.emit).toHaveBeenCalledWith("message", {
      type: "docComplet",
      data: created,
    });
  });
});

