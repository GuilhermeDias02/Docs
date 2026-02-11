import { useRef, useState, useEffect } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import type { Cursor, TextAreaProps } from '../types/document'

export function Textareav2({ initialtext, updateCursor }: TextAreaProps) {
  const [cursors, setCursors] = useState<Cursor[]>([])
  const ref = useRef<HTMLTextAreaElement | null>(null)
  const posRef = useRef<number>(0)
  useEffect(() => {
    if (updateCursor) {
      // check if cursor is already in cursors
      if (cursors.find(cursor => cursor.socketId === updateCursor.socketId)) {
        // update cursor position
        setCursors(prev =>
          prev.map(cursor =>
            cursor.socketId === updateCursor.socketId ? { ...cursor, cursorPos: updateCursor.cursorPos } : cursor,
          ),
        )
      } else {
        setCursors(prev => [...prev, updateCursor])
      }
    }
  }, [updateCursor, cursors])
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Backspace') {
      console.log('DEL', posRef.current)
    } else {
      console.log('ADD', e.key, posRef.current + 1)
    }
  }

  const handleSelect = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    posRef.current = e.target.selectionStart
  }

  return (
    <TextareaAutosize
      ref={ref}
      onSelect={handleSelect}
      onKeyDown={handleKeyDown}
      className="docs-page2"
      defaultValue={initialtext}
    />
  )
}
