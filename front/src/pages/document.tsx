import { Document } from '../components/document'
import { useParams } from 'react-router-dom'

export function DocumentPage() {
  const { id } = useParams()
  return <Document docID={Number(id)} />
}
