export interface Message {
    type: string,
    data: {
        docID?: number,
        wordPos?: number,
        wordText?: string,
        additionPos?: number,
        additionText?: string,
        cursorPos?: number
    }
}