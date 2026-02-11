import { useEffect, useState } from 'react'

const PAGE_CHAR_MAX = 2400

export function Textarea({ text }: { text: string }) {
  const [chunks, setChunks] = useState<string[]>([])
  useEffect(() => {
    for (let index = 0; index < text.length; index += PAGE_CHAR_MAX) {
      const chunk = text.slice(index, index + PAGE_CHAR_MAX)
      setChunks(prev => [...prev, chunk])
    }
  }, [text])
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('User stopped writing:', chunks)
    }, 500)

    return () => clearTimeout(timer)
  }, [chunks])

  return chunks.map((chunk, index) => {
    return (
      <textarea
        maxLength={PAGE_CHAR_MAX}
        key={index}
        value={chunk}
        onChange={e => setChunks(prev => [...prev.slice(0, index), e.target.value, ...prev.slice(index + 1)])}
        className="docs-page resize-none"
      />
    )
  })
}
