import { useContext } from 'react'
import { WebSocketContext } from '../context/wsprovider'
import { DocumentsListComponents } from '../components/document-list'

export function DocumentListPage() {
  const { documentList } = useContext(WebSocketContext)
  return <DocumentsListComponents DocumentList={documentList} />
}
