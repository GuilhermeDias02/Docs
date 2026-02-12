import { useContext, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DocumentIcon, MagnifyingGlassIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import './document-list.css'
import type { DocListItem } from '../types/document-list'

export function DocumentsListComponents({ DocumentList }: { DocumentList: DocListItem[] }) {
  const [docs, setDocs] = useState<DocListItem[]>([])
  const [status, setStatus] = useState<string>('Chargement...')

  useEffect(() => {
   console.log(DocumentList)
  }, [DocumentList])

  const handleCreate = () => {
    const name = prompt('Nom du document ?', 'Nouveau document')
    if (!name) return

    console.log('SEND createDoc', name)
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
        </section>

        {status ? <p className="docs-status">{status}</p> : null}

        <section className="docs-list">
          {DocumentList.length > 0 ? (
  DocumentList.map((doc) => (
    <Link to={'/documents/' + doc.id} key={doc.id} className="docs-list-item">
      {' '}
      <DocumentIcon className="w-6 h-6" color="var(--accent)" />
      <span>{doc.name}</span>{' '}
    </Link>
  ))
) : (
  <p>No documents found</p>
)}
        </section>
      </div>
    </main>
  )
}
