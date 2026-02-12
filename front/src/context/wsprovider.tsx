import { useEffect, useState, createContext } from 'react'
import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import type { DocListItem } from '../types/document-list'
type WebSocketContextType = {
  socket: Socket | null
  selectDoc: (docID: number) => void
  createDoc: (docName: string) => void
  addText: (wordPos: number, wordText: string, additionPos: number, additionText: string) => void
  deleteText: (wordPos: number, wordText: string, deletePos: number, deleteSize: number) => void
  sendCursor: (cursorPos: number) => void
  documents: DocListItem[]
}

export const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  selectDoc: () => {},
  createDoc: () => {},
  addText: () => {},
  deleteText: () => {},
  sendCursor: () => {},
  documents: [],
})

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [documents, setDocuments] = useState<DocListItem[]>([])

  const selectDoc = (docID: number) => {
    socket?.emit('message', {
      type: 'doc',
      data: {
        docID,
      },
    })
  }

  const createDoc = (docName: string) => {
    socket?.emit('message', {
      type: 'createDoc',
      data: {
        docName,
      },
    })
  }
  const addText = (wordPos: number, wordText: string, additionPos: number, additionText: string) => {
    socket?.emit('message', {
      type: 'addText',
      data: {
        wordPos,
        wordText,
        additionPos,
        additionText,
      },
    })
  }

  const deleteText = (wordPos: number, wordText: string, deletePos: number, deleteSize: number) => {
    socket?.emit('message', {
      type: 'deleteText',
      data: {
        wordPos,
        wordText,
        deletePos,
        deleteSize,
      },
    })
  }

  const sendCursor = (cursorPos: number) => {
    socket?.emit('message', {
      type: 'cursor',
      data: { cursorPos },
    })
  }
  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
    })
    setSocket(newSocket)
    newSocket.on('message', (...args) => {
      switch (args[0]['type']) {
        case 'liste':
          setDocuments(args[0]['data'].docs)
      }
    })

    return () => {
      newSocket.close()
    }
  }, [])

  return (
    <WebSocketContext.Provider value={{ socket, selectDoc, createDoc, addText, deleteText, sendCursor, documents }}>
      {children}
    </WebSocketContext.Provider>
  )
}
