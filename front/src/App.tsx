import { Routes, Route } from 'react-router-dom'
import { DocumentPage } from './pages/document'
import './App.css'

function App() {
  return (
    <Routes>
      {/* <Route path="/documents" element={<DocumentsList />} /> */}
      <Route path="/documents/:id" element={<DocumentPage />} />
    </Routes>
  )
}

export default App
