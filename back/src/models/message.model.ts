export interface Message {
    type: string,
    data: {
        name: string
        docID?: number
    }
}