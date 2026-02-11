export interface Cursor {
  socketId: string
  cursorPos: number
}

export interface TextAreaProps {
  initialtext: string
  updateCursor: Cursor | null
}
