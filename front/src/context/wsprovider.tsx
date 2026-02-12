import { useEffect, useState, createContext } from 'react'
import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import type { DocListItem } from '../types/document-list'

type WebSocketContextType = {
  socket: Socket | null
  documentList: DocListItem[]
  selectDoc: (docID: number) => void
  addText: (wordPos: number, wordText: string, additionPos: number, additionText: string) => void
  deleteText: (wordPos: number, wordText: string, deletePos: number, deleteSize: number) => void
  sendCursor: (cursorPos: number) => void
}

export const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  documentList: [],
  selectDoc: () => {},
  addText: () => {},
  deleteText: () => {},
  sendCursor: () => {},
})

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [documentList, setDocumentList] = useState<DocListItem[]>([])

  const selectDoc = (docID: number) => {
    socket?.emit('message', {
      type: 'doc',
      data: {
        docID,
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

    const handleMessage = (...args: any[]) => {
      if (args[0]?.type === 'liste') {
        console.log('Received doc list', args[0]['data'].docs)
        setDocumentList(args[0]['data'].docs)
      }
    }

    newSocket.on('message', handleMessage)

    return () => {
      newSocket.off('message', handleMessage)
      newSocket.close()
    }
  }, [])

  return (
    <WebSocketContext.Provider value={{ socket, documentList, selectDoc, addText, deleteText, sendCursor }}>
      {children}
    </WebSocketContext.Provider>
  )
}
