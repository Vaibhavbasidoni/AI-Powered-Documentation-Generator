import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Documentation from './pages/Documentation';

function App() {
  console.log('App rendering');

  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route 
              path="/documentation/:projectId" 
              element={<Documentation />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;