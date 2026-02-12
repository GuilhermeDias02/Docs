export interface Cursor {
  socketId: string
  cursorPos: number
}

export interface TextAreaProps {
  initialtext: string
  updateCursors: Cursor[] | null
}
