import { useRef, useState, useEffect, useContext } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import type { Cursor, TextAreaProps } from '../types/document'
import { WebSocketContext } from '../context/wsprovider'

export function Textareav2({ initialtext, updateCursors }: TextAreaProps) {
  const [cursors, setCursors] = useState<Cursor[]>([])
  const [text, setText] = useState(initialtext)
  const [caretPos, setCaretPos] = useState(0)
  const ref = useRef<HTMLTextAreaElement | null>(null)
  const mirrorRef = useRef<HTMLDivElement | null>(null)
  const posRef = useRef<number>(0)
  const { sendCursor, socket } = useContext(WebSocketContext)

  useEffect(() => {
    setText(initialtext)
  }, [initialtext])

  useEffect(() => {
    if (!updateCursors) return
    // remove socket.id from updateCursors
    const updatedCursors = updateCursors.filter(cursor => cursor.socketId !== socket?.id)
    setCursors(updatedCursors)
  }, [updateCursors])

  const clampPosition = (position: number) => Math.max(0, Math.min(position, text.length))

  const colorForCursor = (socketId: string) => {
    let hash = 0
    for (let index = 0; index < socketId.length; index += 1) {
      hash = (hash * 31 + socketId.charCodeAt(index)) | 0
    }
    const hue = Math.abs(hash) % 360
    return `hsl(${hue} 80% 45%)`
  }

  const syncMirrorScroll = (element: HTMLTextAreaElement) => {
    if (!mirrorRef.current) return
    mirrorRef.current.scrollTop = element.scrollTop
    mirrorRef.current.scrollLeft = element.scrollLeft
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Backspace') {
      console.log('DEL', posRef.current)
    } else {
      console.log('ADD', e.key, posRef.current + 1)
    }
  }

  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    sendCursor(e.currentTarget.selectionStart)
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.currentTarget.value)
  }

  const renderedCursors: Cursor[] = [
    ...cursors.map(cursor => ({ ...cursor, cursorPos: clampPosition(cursor.cursorPos) })),
  ]

  const cursorsByPosition = new Map<number, Cursor[]>()
  for (const cursor of renderedCursors) {
    const existing = cursorsByPosition.get(cursor.cursorPos)
    if (existing) {
      existing.push(cursor)
    } else {
      cursorsByPosition.set(cursor.cursorPos, [cursor])
    }
  }

  const sortedPositions = Array.from(cursorsByPosition.keys()).sort((a, b) => a - b)
  const overlayNodes: React.ReactNode[] = []
  let previousPosition = 0
  for (const position of sortedPositions) {
    if (position > previousPosition) {
      overlayNodes.push(
        <span key={`text-${previousPosition}-${position}`}>{text.slice(previousPosition, position)}</span>,
      )
    }

    const markers = cursorsByPosition.get(position) ?? []
    for (const cursor of markers) {
      const color = cursor.socketId === 'you' ? '#1f2438' : colorForCursor(cursor.socketId)
      overlayNodes.push(
        <span key={`cursor-${cursor.socketId}-${position}`} className="docs-cursor-marker">
          <span className="docs-cursor-marker__bar" style={{ backgroundColor: color }} />
          <span className="docs-cursor-marker__label" style={{ backgroundColor: color }}>
            {cursor.socketId}
          </span>
        </span>,
      )
    }
    previousPosition = position
  }
  if (previousPosition < text.length) {
    overlayNodes.push(<span key={`text-${previousPosition}-end`}>{text.slice(previousPosition)}</span>)
  }

  return (
    <div className="docs-page2-stack">
      <div ref={mirrorRef} className="docs-page2 docs-page2-mirror" aria-hidden="true">
        {overlayNodes}
      </div>
      <TextareaAutosize
        ref={ref}
        onSelect={handleSelect}
        onScroll={e => syncMirrorScroll(e.currentTarget)}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        className="docs-page2 docs-page2-input"
        value={text}
      />
      <div className="docs-page2-indicator">Cursor position: {caretPos}</div>
    </div>
  )
}
