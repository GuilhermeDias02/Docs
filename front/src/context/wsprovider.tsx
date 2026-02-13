import { useEffect, useState, createContext } from 'react'
import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import type { DocListItem } from '../types/document-list'
import type { Cursor } from '../types/document'
import type { TextEvent } from '../types/document'
import examples from '../utils/examples'
type WebSocketContextType = {
  socket: Socket | null
  selectDoc: (docID: number) => void
  createDoc: (docName: string) => void
  addText: (wordPos: number, wordText: string, additionPos: number, additionText: string) => void
  deleteText: (wordPos: number, wordText: string, deletePos: number, deleteSize: number) => void
  sendCursor: (cursorPos: number) => void
  addChar: (char: string, pos: number) => void
  removeChar: (pos: number) => void
  setText: (text: string) => void
  documents: DocListItem[]
  text: string
  documentName: string
  cursors: Cursor[] | null
  textEvent: TextEvent | null
  setTextEvent: (textEvent: TextEvent | null) => void
}

export const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  selectDoc: () => {},
  createDoc: () => {},
  addText: () => {},
  deleteText: () => {},
  sendCursor: () => {},
  addChar: () => {},
  removeChar: () => {},
  setText: () => {},
  documents: [],
  text: '',
  documentName: '',
  cursors: null,
  textEvent: null,
  setTextEvent: () => {},
})

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [documents, setDocuments] = useState<DocListItem[]>([])
  const [text, setText] = useState<string>('')
  const [documentName, setDocumentName] = useState<string>('')
  const [textEvent, setTextEvent] = useState<TextEvent | null>(null)
  const [cursors, setCursors] = useState<Cursor[] | null>(null)
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

  const addChar = (char: string, pos: number) => {
    socket?.emit('message', {
      type: 'addChar',
      data: {
        char,
        pos,
      },
    })
  }

  const removeChar = (pos: number) => {
    socket?.emit('message', {
      type: 'rmChar',
      data: {
        pos,
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
          break
        case 'docComplet':
          setText(args[0]['data'].content)
          setDocumentName(args[0]['data'].name)
          break
        case 'cursor':
          setCursors(args[0]['data'].cursors)
          break
        case 'addChar':
          setTextEvent({ type: 'addChar', data: { char: args[0]['data'].char, pos: args[0]['data'].pos } })
          break
        case 'rmChar':
          setTextEvent({ type: 'removeChar', data: { pos: args[0]['data'].pos } })
          break
      }
    })

    return () => {
      newSocket.close()
    }
  }, [])

  return (
    <WebSocketContext.Provider
      value={{
        socket,
        selectDoc,
        createDoc,
        addText,
        deleteText,
        sendCursor,
        documents,
        addChar,
        removeChar,
        setTextEvent,
        textEvent,
        setText,
        text,
        documentName,
        cursors,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  )
}
