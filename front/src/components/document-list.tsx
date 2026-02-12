import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { DocumentIcon, PlusIcon } from '@heroicons/react/24/outline'
import './document-list.css'
import type { DocListItem } from '../types/document-list'
import { WebSocketContext } from '../context/wsprovider'

export function DocumentsListComponents({ DocumentList }: { DocumentList: DocListItem[] }) {
  const { createDoc } = useContext(WebSocketContext)

  const handleCreate = () => {
    const name = prompt('Nom du document ?', 'Nouveau document')
    if (!name) return
    createDoc(name)
  }

  return (
    <main className="doc-list-shell">
      <div className="doc-list-bg-orb doc-list-bg-orb--left" />
      <div className="doc-list-bg-orb doc-list-bg-orb--right" />

      <header className="doc-list-header">
        <div className="doc-list-brand">
          <div className="doc-list-brand__title-group">
            <DocumentIcon className="w-10 h-10" color="var(--doc-list-accent)" strokeWidth={1.75} />
            <div className="flex flex-col">
              <h1 className="doc-list-brand__title">Gogole doc</h1>
              <span className="doc-list-brand__subtitle">Ton espace de travail collaboratif</span>
            </div>
          </div>

          <div className="doc-list-actions">
            <span className="doc-list-count">
              {DocumentList.length} doc{DocumentList.length !== 1 ? 's' : ''}
            </span>

            <button className="doc-list-new-btn" onClick={handleCreate}>
              <PlusIcon className="w-5 h-5" />
              Nouveau
            </button>
          </div>
        </div>
      </header>

      <div className="doc-list-page-wrap">
        <section className="doc-list-hero">
          <p className="doc-list-hero__eyebrow">Tableau de bord</p>
          <h2 className="doc-list-hero__title">Modifie tes notes en temps réel avec ton équipe</h2>
        </section>

        <section className="doc-list-grid">
          {DocumentList.length > 0 ? (
            DocumentList.map(doc => (
              <Link to={'/documents/' + doc.id} key={doc.id} className="doc-list-item">
                <span className="doc-list-item__icon-wrap">
                  <DocumentIcon className="w-5 h-5" strokeWidth={1.75} />
                </span>
                <span className="doc-list-item__title">{doc.name}</span>
              </Link>
            ))
          ) : (
            <p className="doc-list-empty">Aucun document. Crée-en un pour commencer.</p>
          )}
        </section>
      </div>
    </main>
  )
}
