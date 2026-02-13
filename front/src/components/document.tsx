import { useRef, useContext, useEffect } from 'react'
import { WebSocketContext } from '../context/wsprovider'
import { DocumentIcon } from '@heroicons/react/24/outline'
import './document.css'
import { Textareav3 } from './textareav3'
import type { TextareaApi } from './textareav3'
import type { TextEvent } from '../types/document'

export function Document({ docID }: { docID: number }) {
  const { documentName, text, setText, textEvent, selectDoc, socket, addChar, removeChar } =
    useContext(WebSocketContext)
  const textareaRef = useRef<TextareaApi>(null)

  const handleTextEvent = (event: TextEvent) => {
    if (event.type === 'addChar') {
      addChar(event.data.char ?? '', event.data.pos)
    }
    if (event.type === 'removeChar') {
      removeChar(event.data.pos)
    }
  }

  useEffect(() => {
    selectDoc(docID)
  }, [docID, socket])

  useEffect(() => {
    if (!textEvent) return
    if (textEvent.type === 'addChar') {
      textareaRef.current?.insertAt(textEvent.data.pos, textEvent.data.char ?? '')
    }
    if (textEvent.type === 'removeChar') {
      textareaRef.current?.removeAt(textEvent.data.pos)
    }
  }, [textEvent])

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
            <Textareav3 updateEvent={handleTextEvent} ref={textareaRef} text={text || ''} setText={setText} />
          )}
        </article>
      </div>
    </main>
  )
}
