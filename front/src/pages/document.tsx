import { useParams } from 'react-router-dom'
import { Document } from '../components/document'

export function DocumentPage() {
  const { id } = useParams()
  return <Document docID={Number(id)} />
}
