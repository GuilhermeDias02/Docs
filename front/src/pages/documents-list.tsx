import { useContext, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { WebSocketContext } from '../context/wsprovider'
import {
  DocumentIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import './documents-list.css'

type DocListItem = {
  id: number
  name: string
}

export function DocumentsListPage() {
  const { socket } = useContext(WebSocketContext)

  const [docs, setDocs] = useState<DocListItem[]>([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<string>('Chargement...')

  useEffect(() => {
    if (!socket) return

    const onMessage = (msg: any) => {
      console.log('WS message', msg)

      switch (msg?.type) {
        case 'liste': {
          const incoming = (msg?.data?.docs ?? []) as DocListItem[]
          setDocs(incoming.map((d) => ({ id: Number(d.id), name: String(d.name ?? '') })))
          setStatus('')
          break
        }

        case 'docCreated': {
          const newDoc = msg?.data
          if (newDoc?.id) window.location.href = `/documents/${newDoc.id}`
          break
        }

        case 'error': {
          setStatus(msg?.error ?? 'Erreur inconnue')
          break
        }
      }
    }

    socket.on('message', onMessage)
    return () => socket.off('message', onMessage)
  }, [socket])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return docs
    return docs.filter((d) => d.name.toLowerCase().includes(q))
  }, [docs, query])

  const handleCreate = () => {
    if (!socket) return

    const name = prompt('Nom du document ?', 'Nouveau document')
    if (!name) return

    console.log('SEND createDoc', name)

    socket.emit('message', {
      type: 'createDoc',
      data: { name },
    })
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <main className="docs-shell">
      <div className="docs-bg-orb docs-bg-orb--left" />
      <div className="docs-bg-orb docs-bg-orb--right" />

      <header className="docs-header">
        <div className="docs-brand">
          <div className="docs-brand__title-group">
            <DocumentIcon className="w-10 h-10" color="var(--accent)" />
            <div className="flex flex-col">
              <h1 className="docs-brand__title">Mes documents</h1>
              <span className="docs-brand__subtitle">Ton espace de travail collaboratif</span>
            </div>
          </div>

          <div className="docs-list-actions">
            <span className="docs-count">{docs.length} docs</span>

            <div className="docs-search">
              <MagnifyingGlassIcon className="docs-search__icon w-5 h-5" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un document..."
                className="docs-search__input"
              />
            </div>

            <button className="docs-icon-btn" onClick={handleRefresh} title="Rafraichir">
              <ArrowPathIcon className="w-5 h-5" />
            </button>

            <button className="docs-new-btn" onClick={handleCreate}>
              <PlusIcon className="w-5 h-5" />
              Nouveau
            </button>
          </div>
        </div>
      </header>

      <div className="docs-page-wrap">
        <section className="docs-hero">
          <p className="docs-hero__eyebrow">Tableau de bord</p>
          <h2 className="docs-hero__title">Cree, retrouve et edite tes notes en direct.</h2>
          <p className="docs-hero__desc">{filtered.length} resultat(s) affiche(s) pour {docs.length} document(s).</p>
        </section>

        {status ? <p className="docs-status">{status}</p> : null}

        <section className="docs-list">
          {filtered.length === 0 && !status ? (
            <p className="docs-empty">Aucun document trouve. Cree ton premier doc.</p>
          ) : (
            filtered.map((doc) => (
              <Link key={doc.id} className="docs-list-item" to={`/documents/${doc.id}`}>
                <div className="docs-list-item__head">
                  <span className="docs-list-item__icon-wrap">
                    <DocumentIcon className="w-5 h-5" />
                  </span>
                  <span className="docs-list-item__meta">Doc #{doc.id}</span>
                </div>

                <div className="docs-list-item__title">{doc.name || `Document ${doc.id}`}</div>
                <p className="docs-list-item__caption">Ouvrir et editer en temps reel</p>
              </Link>
            ))
          )}
        </section>
      </div>
    </main>
  )
}

