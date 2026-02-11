import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { WebSocketContext } from '../context/wsprovider'
import { DocumentIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import './document.css'
import { Textarea } from './textarea'

export function Document({ docID }: { docID: number }) {
  const { selectDoc, socket } = useContext(WebSocketContext)
  const navigate = useNavigate()

  const [text, setText] = useState<string>('')
  const [documentName, setDocumentName] = useState<string>('')

  useEffect(() => {
    if (!socket) return

    selectDoc(docID)

    const onMessage = (msg: any) => {
      if (msg?.type === 'docComplet') {
        setText(msg?.data?.content ?? '')
        setDocumentName(msg?.data?.name ?? '')
      }
    }

    socket.on('message', onMessage)
    return () => socket.off('message', onMessage)
  }, [docID, selectDoc, socket])

  return (
    <main className="docs-shell">
      <header className="docs-header">
        <div className="docs-brand docs-brand--doc">
          <button className="docs-back-btn" onClick={() => navigate('/')}>
            <ArrowLeftIcon className="w-5 h-5" />
            Retour
          </button>

          <div className="docs-brand__title-group">
            <DocumentIcon className="w-10 h-10" color="var(--docs-accent)" />
            <div className="flex flex-col">
              <h1 className="docs-brand__title">{documentName || `Document ${docID}`}</h1>
              <span className="docs-brand__subtitle">Enregistré dans le nuage</span>
            </div>
          </div>
        </div>
      </header>

          </main>
  )
}
