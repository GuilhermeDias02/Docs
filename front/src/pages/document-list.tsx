import { useContext } from 'react'
import { WebSocketContext } from '../context/wsprovider'
import { DocumentsListComponents } from '../components/document-list'

export function DocumentListPage() {
  const { documents } = useContext(WebSocketContext)
  return <DocumentsListComponents DocumentList={documents} />
}
