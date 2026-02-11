import { useContext, useEffect, useState, useCallback } from 'react'
import { WebSocketContext } from '../context/wsprovider'
import { DocumentIcon } from '@heroicons/react/24/outline'
import './document.css'
import { Textareav2 } from './textareav2'
import type { Cursor } from '../types/document'

export function Document({ docID }: { docID: number }) {
  const { selectDoc, socket } = useContext(WebSocketContext)
  const [text, setText] = useState<string>('')
  const [documentName, setDocumentName] = useState<string>('')
  const [updateCursor, setUpdateCursor] = useState<Cursor | null>(null)

  useEffect(() => {
    selectDoc(docID)
    socket?.on('message', (...args) => {
      switch (args[0]['type']) {
        case 'docComplet':
          setText(args[0]['data'].content)
          setDocumentName(args[0]['data'].name)
      }
    })

    return () => {
      socket?.off('message')
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
            <Textareav2 initialtext={text || ''} updateCursor={updateCursor} />
          )}
        </article>
        <button onClick={() => setUpdateCursor({ socketId: socket?.id || '', cursorPos: 10 })}>Update Cursor</button>
      </div>
    </main>
  )
}
