import { useEffect, useState, createContext } from 'react'
import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'

type WebSocketContextType = {
  socket: Socket | null
  selectDoc: (docID: number) => void
  addText: (wordPos: number, wordText: string, additionPos: number, additionText: string) => void
  deleteText: (wordPos: number, wordText: string, deletePos: number, deleteSize: number) => void
}

export const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  selectDoc: () => {},
  addText: () => {},
  deleteText: () => {},
})

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)

  const selectDoc = (docID: number) => {
    socket?.send(JSON.stringify({ type: 'doc', docID: docID }))
  }

  const addText = (wordPos: number, wordText: string, additionPos: number, additionText: string) => {
    socket?.send(
      JSON.stringify({
        type: 'addText',
        data: {
          wordPos,
          wordText,
          additionPos,
          additionText,
        },
      }),
    )
  }

  const deleteText = (wordPos: number, wordText: string, deletePos: number, deleteSize: number) => {
    socket?.send(
      JSON.stringify({
        type: 'deleteText',
        data: {
          wordPos,
          wordText,
          deletePos,
          deleteSize,
        },
      }),
    )
  }
  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
    })
    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  return (
    <WebSocketContext.Provider value={{ socket, selectDoc, addText, deleteText }}>{children}</WebSocketContext.Provider>
  )
}
