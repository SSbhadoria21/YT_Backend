import React from 'react';
// Hum react-router-dom library se BrowserRouter, Routes, aur Route ko import kar rahe hain.
// Isse hamari website me alag-alag pages (routes) ban sakte hain.
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Hamari nayi Home file ko yahan import kar rahe hain.
import Home from './Home';

function App() {
  return (
    // Router component pure app ko wrap karta hai taaki routing enable ho sake.
    <Router>
      <div>
        {/* Navigation Bar ka ek chhota sa UI dikhane ke liye (Header) */}
        <nav style={{ background: "#202020", color: "white", padding: "15px", textAlign: "center" }}>
          <h1>My YouTube Clone 📺</h1>
        </nav>

        {/* Routes ke andar hum apni saari alag-alag URLs (pages) define karte hain */}
        <Routes>
          {/* Jab bhi URL "/" (homepage) hoga, tab 'Home' wala component dikhayega */}
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
