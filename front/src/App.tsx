import { Routes, Route, Link } from 'react-router-dom';

function App() {
  return (
      <Routes>
        <Route path="/" element={<div>Hello World</div>} />
      </Routes>
  );
}

export default App;