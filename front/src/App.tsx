import { Routes, Route } from 'react-router-dom'
import { DocumentPage } from './pages/document'
import './App.css'
import { WebSocketProvider } from './context/wsprovider'
import { DocumentListPage } from './pages/document-list'

function App() {
  return (
    <WebSocketProvider>
      <Routes>
        {/* <Route path="/documents" element={<DocumentsList />} /> */}
        <Route path="/documents/:id" element={<DocumentPage />} />
        <Route path="/" element={<DocumentListPage />} />
      </Routes>
    </WebSocketProvider>
  )
}

export default App
