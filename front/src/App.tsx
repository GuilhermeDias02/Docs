import { Routes, Route, Navigate } from 'react-router-dom'
import { DocumentPage } from './pages/document'
import { DocumentsListPage } from './pages/documents-list'
import { WebSocketProvider } from './context/wsprovider'
import './App.css'

function App() {
  return (
    <WebSocketProvider>
      <Routes>
        <Route path="/" element={<DocumentsListPage />} />
        <Route path="/documents" element={<Navigate to="/" replace />} />
        <Route path="/documents/:id" element={<DocumentPage/>} />
      </Routes>
    </WebSocketProvider>
  )
}

export default App
