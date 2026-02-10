import { useContext, useEffect, useState } from 'react'
import { WebSocketContext } from '../context/wsprovider'
import { DocumentIcon } from '@heroicons/react/24/outline'

export function Document({ docID }: { docID: number }) {
  const { selectDoc, socket } = useContext(WebSocketContext)
  const [text, setText] = useState<string | null>(null)

  useEffect(() => {
    selectDoc(docID)
    socket?.on('docComplet', (...args) => {
      setText(args[0]['text'])
    })

    return () => {
      socket?.off('docComplet')
    }
  }, [docID, selectDoc, socket])

  const lines = (text ?? '').split('\n')

  return (
    <main className="docs-shell">
      <header className="docs-header">
        <div className="docs-brand">
          <div className="docs-brand__title-group">
            <DocumentIcon className="w-10 h-10" color="var(--docs-accent)" />
            <div className="flex flex-col">
              <h1 className="docs-brand__title">Document {docID}</h1>
              <span className="docs-brand__subtitle">Enregistré dans le nuage</span>
            </div>
          </div>
        </div>
        <button className="docs-share-btn" type="button">
          Share
        </button>
      </header>
      <div className="docs-page-wrap">
        <article className="docs-page">
          {text === null ? (
            <p className="docs-loading">Loading your document...</p>
          ) : (
            lines.map((line, idx) => (
              <p key={`${idx}-${line}`} className="docs-paragraph">
                {line || '\u00A0'}
              </p>
            ))
          )}
        </article>
      </div>
    </main>
  )
}
