import { useEffect, useState, createContext } from 'react'
import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import type { DocListItem } from '../types/document-list'
import type { Cursor } from '../types/document'
type WebSocketContextType = {
  socket: Socket | null
  selectDoc: (docID: number) => void
  createDoc: (docName: string) => void
  addText: (wordPos: number, wordText: string, additionPos: number, additionText: string) => void
  deleteText: (wordPos: number, wordText: string, deletePos: number, deleteSize: number) => void
  sendCursor: (cursorPos: number) => void
  addChar: (char: string, pos: number) => void
  removeChar: (pos: number) => void
  documents: DocListItem[]
  text: string
  documentName: string
  cursors: Cursor[] | null
  newChar: { char: string; pos: number } | null
  removedChar: { pos: number } | null
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
  documents: [],
  text: '',
  documentName: '',
  cursors: null,
  newChar: null,
  removedChar: null,
})

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [documents, setDocuments] = useState<DocListItem[]>([])
  const [text, setText] = useState<string>('')
  const [documentName, setDocumentName] = useState<string>('')
  const [newChar, setNewChar] = useState<{ char: string; pos: number } | null>(null)
  const [removedChar, setRemovedChar] = useState<{ pos: number } | null>(null)
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
          setNewChar({ char: args[0]['data'].char, pos: args[0]['data'].pos })
          break
        case 'rmChar':
          setRemovedChar({ pos: args[0]['data'].pos })
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
        newChar,
        removedChar,
        documents,
        addChar,
        removeChar,
        text,
        documentName,
        cursors,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  )
}
