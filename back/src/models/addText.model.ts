export interface TextToAdd {
    wordPos: number,
    wordText: string,
    additionPos: number,
    additionText: string
}

export interface TextAdded {
    wordPos: number,
    wordText: string,
}

export interface AddedChar {
    char: string,
    pos: number,
}