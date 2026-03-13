import { HashRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Monthly from './pages/Monthly';

function App() {

  return (
    <div>
      <HashRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path="/month/:year/:month" element={<Monthly />} />
        </Routes>
      </HashRouter>
    </div>
  )
}

export default App
