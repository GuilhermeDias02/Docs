import { useContext, useEffect } from 'react'
import { WebSocketContext } from '../context/wsprovider'
import { DocumentIcon } from '@heroicons/react/24/outline'
import './document.css'
import { Textareav2 } from './textareav2'

export function Document({ docID }: { docID: number }) {
  const { text, documentName, cursors, selectDoc, socket } = useContext(WebSocketContext)

  useEffect(() => {
    selectDoc(docID)
  }, [docID, socket])

  return (
    <main className="docs-shell">
      <header className="docs-header">
        <div className="docs-brand">
          <div className="docs-brand__title-group">
            <DocumentIcon className="w-10 h-10" color="var(--docs-accent)" />
            <div className="flex flex-col">
              <h1 className="docs-brand__title">{documentName.length > 0 ? documentName : 'Document ' + docID}</h1>
              <span className="docs-brand__subtitle">Enregistré dans le nuage</span>
            </div>
          </div>
        </div>
      </header>
      <div className="docs-page-wrap">
        <article>
          {text === null ? (
            // text animation
            <p className="docs-loading text-animation-pulse">Chargement du document...</p>
          ) : (
            <Textareav2 initialtext={text || ''} updateCursors={cursors} />
          )}
        </article>
      </div>
    </main>
  )
}
