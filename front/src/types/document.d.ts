export interface Cursor {
  socketId: string
  cursorPos: number
}

export interface TextAreaProps {
  initialtext: string
  updateCursors: Cursor[] | null
}

export type TextEvent = {
  type: 'addChar' | 'removeChar'
  data: {
    char?: string
    pos: number
  }
}
