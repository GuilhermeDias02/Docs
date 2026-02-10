import { WebSocketProvider } from '../context/wsprovider'
import { Document } from '../components/document'
import { useParams } from 'react-router-dom'

export function DocumentPage() {
  const { id } = useParams()
  return (
    <WebSocketProvider>
      <Document docID={Number(id)} />
    </WebSocketProvider>
  )
}
