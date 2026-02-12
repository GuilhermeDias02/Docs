export interface Message {
    type: string,
    data: {
        docID?: number,
        docName?: string,
        wordPos?: number,
        wordText?: string,
        additionPos?: number,
        additionText?: string,
        cursorPos?: number,
        char?: string,
        pos?: number,
    };
}
