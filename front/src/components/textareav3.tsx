import { forwardRef, useImperativeHandle, useRef } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import './textarea.css'
import type { TextEvent } from '../types/document'
export type TextareaApi = {
  insertAt: (pos: number, value: string) => void
  removeAt: (pos: number, length?: number) => void
  replaceRange: (start: number, end: number, value: string) => void
  getSelection: () => { start: number; end: number }
  setSelection: (start: number, end?: number) => void
}

type Props = {
  text: string
  setText: (next: string) => void
  updateEvent: (event: TextEvent) => void
}

export const Textareav3 = forwardRef<TextareaApi, Props>(({ text, setText, updateEvent }, ref) => {
  const elRef = useRef<HTMLTextAreaElement | null>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return
    if (e.key.length === 1) {
      updateEvent({ type: 'addChar', data: { char: e.key, pos: e.currentTarget.selectionStart } })
    }
    if (e.key === 'Backspace') {
      updateEvent({ type: 'removeChar', data: { pos: e.currentTarget.selectionStart - 1 } })
    }
    if (e.key === 'Enter') {
      updateEvent({ type: 'addChar', data: { char: '\n', pos: e.currentTarget.selectionStart } })
    }
  }

  useImperativeHandle(
    ref,
    () => ({
      insertAt(pos, value) {
        setText(text.slice(0, pos) + value + text.slice(pos))
      },
      removeAt(pos, length = 1) {
        setText(text.slice(0, pos) + text.slice(pos + length))
      },
      replaceRange(start, end, value) {
        setText(text.slice(0, start) + value + text.slice(end))
      },
      getSelection() {
        const el = elRef.current
        return { start: el?.selectionStart ?? 0, end: el?.selectionEnd ?? 0 }
      },
      setSelection(start, end = start) {
        elRef.current?.setSelectionRange(start, end)
      },
    }),
    [text, setText],
  )
  return (
    <TextareaAutosize
      onKeyDown={handleKeyDown}
      className="textarea"
      ref={elRef}
      value={text}
      onChange={e => setText(e.target.value)}
    />
  )
})
