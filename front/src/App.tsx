import { useEffect, useMemo, useState } from "react";
import { useSocket } from "./context/SocketContext";
import "./App.css";

type Doc = { id: number; nom: string };

type ListeMessage = { type: "liste"; data: { docs: Doc[] } };
type ErrorMessage = { type: "error"; data: { message: string } };
type ServerMessage = ListeMessage | ErrorMessage | { type: string; data?: any };

export default function App() {
  const socket = useSocket();

  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const onConnect = () => {
      setConnected(true);
      setError(null);
      // on attend le message "liste" du serveur
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    const onMessage = (msg: ServerMessage) => {
      if (msg.type === "liste") {
        const m = msg as ListeMessage;
        setDocs(m.data.docs ?? []);
        setLoading(false);
      } else if (msg.type === "error") {
        const m = msg as ErrorMessage;
        setError(m.data.message || "Erreur inconnue");
        setLoading(false);
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("message", onMessage);

    // si le serveur n’envoie rien, on ne reste pas bloqué en loading
    const fallbackTimer = window.setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => {
      window.clearTimeout(fallbackTimer);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("message", onMessage);
    };
  }, [socket]);

  const filteredDocs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return docs;
    return docs.filter((d) => d.nom.toLowerCase().includes(q) || String(d.id).includes(q));
  }, [docs, search]);

  const createDoc = () => {
    const nom = window.prompt("Nom du nouveau fichier ?");
    if (!nom || !nom.trim()) return;
    socket.emit("message", { type: "create", data: { nom: nom.trim() } });
  };

  const openDoc = (id: number) => {
    // prêt pour la suite : doc.html / route React
    console.log("OPEN DOC", id);
    // window.location.href = `/doc.html?id=${id}`;
  };

  return (
    
    <div className="page">
      <header className="header">
        <div className="brand">
          <div className="logo" aria-hidden="true">📄</div>
          <div>
            <h1 className="title">Mini Docs</h1>
            <p className="subtitle">Accueil — Liste des documents (Socket.IO)</p>
          </div>
        </div>

        <div className="headerRight">
        <div className="status">
          <span className={`dot ${connected ? "ok" : "ko"}`} />
          <span className="statusText">
            {connected ? "Connecté" : "Déconnecté"}
          </span>
        </div>
          <button className="createBtn" type="button" onClick={createDoc}>
            + Nouveau fichier
          </button>
        </div>
      </header>

      <main className="card">
        <div className="cardTop">
          <div>
            <h2 className="cardTitle">Documents</h2>
            <p className="cardHint">
              Cliquez sur un document pour l’ouvrir (id transmis au serveur ensuite).
            </p>
          </div>

          <div className="actions">
            <input
              className="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher (nom ou id)…"
              aria-label="Rechercher un document"
            />
          </div>
        </div>

        {loading && (
          <div className="state">
            <div className="spinner" aria-hidden="true" />
            <div>
              <p className="stateTitle">Chargement…</p>
              <p className="stateText">Connexion au serveur et récupération de la liste.</p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="state error">
            <p className="stateTitle">Erreur</p>
            <p className="stateText">{error}</p>
            <p className="stateText small">
              Vérifiez que le back Socket.IO tourne sur le port attendu.
            </p>
          </div>
        )}

        {!loading && !error && filteredDocs.length === 0 && (
          <div className="state">
            <p className="stateTitle">Aucun document</p>
            <p className="stateText">La liste est vide ou votre recherche ne retourne rien.</p>
          </div>
        )}

        {!loading && !error && filteredDocs.length > 0 && (
          <ul className="grid" aria-label="Liste des documents">
            {filteredDocs.map((doc) => (
              <li key={doc.id} className="docCard" onClick={() => openDoc(doc.id)} role="button" tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && openDoc(doc.id)}>
                <div className="docHeader">
                  <span className="docIcon" aria-hidden="true">🗂️</span>
                  <span className="docId">ID {doc.id}</span>
                </div>
                <div className="docName">{doc.nom}</div>
                <div className="docMeta">Ouvrir le document</div>
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer className="footer">
        <span>EFREI — Projet WebSocket / Socket.IO</span>
        <span className="sep">•</span>
        <span>Front : Vite + React + TS</span>
      </footer>
    </div>
  );
}
