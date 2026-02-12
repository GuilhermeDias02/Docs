import React, { useContext, useState, useEffect } from 'react'
import { WebSocketContext } from '../context/wsprovider'
import type { DocListItem } from '../types/document-list'
import { DocumentsListComponents } from '../components/document-list'

export function DocumentListPage() {
  const { socket } = useContext(WebSocketContext)
  const [documentList, setDocumentList] = useState<DocListItem[]>([])
  useEffect(() => {
    console.log('socket in doc list', socket)
    socket?.on('message', (...args) => {
      switch (args[0]['type']) {
        case 'liste':
          console.log('Received doc list', args[0]['data'].docs)
          setDocumentList(args[0]['data'].docs)
      }
    })
    return () => {
      socket?.off('message')
    }
  }, [socket])
  return <DocumentsListComponents DocumentList={documentList} />
}
