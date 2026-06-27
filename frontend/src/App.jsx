import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Register from './Register';
import PublishVideo from './publishVideo';
import VideoDetail from './VideoDetail';
import axios from 'axios';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.post('http://localhost:8000/api/v1/users/current-user', {}, {
          withCredentials: true
        });
        if (response.data && response.data.data) {
          setUser(response.data.data);
        }
      } catch (err) {
        // Not logged in or session expired
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8000/api/v1/users/logout', {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setUser(null);
      window.location.href = '/login';
    }
  };

  return (
    <Router>
      <div>
        {/* Navbar for Navigation */}
        <nav className="navbar">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1>My YouTube Clone 📺</h1>
          </Link>
          <div className="nav-links">
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {user.avatar && <img src={user.avatar} alt="avatar" style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} />}
                  Welcome, {user.fullName || user.username}
                </span>
                <Link to="/publish" style={{
                  background: 'linear-gradient(45deg, #ff0055, #ff4d4d)',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 10px rgba(255, 0, 85, 0.3)',
                  transition: 'all 0.3s ease',
                  fontSize: '14px'
                }}
                onMouseOver={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 15px rgba(255, 0, 85, 0.5)'; }}
                onMouseOut={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 10px rgba(255, 0, 85, 0.3)'; }}
                >
                  ➕ Publish
                </Link>
                <button onClick={handleLogout} style={{
                  background: 'transparent', border: '1px solid #ff4d4d', color: '#ff4d4d',
                  padding: '5px 12px', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => { e.target.style.background = '#ff4d4d'; e.target.style.color = '#fff'; }}
                onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#ff4d4d'; }}
                >Logout</button>
              </div>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register" style={{ 
                  background: 'rgba(255, 0, 85, 0.2)', 
                  padding: '8px 16px', 
                  borderRadius: '20px', 
                  border: '1px solid rgba(255, 0, 85, 0.5)',
                  color: '#fff' 
                }}>Sign Up</Link>
              </>
            )}
          </div>
        </nav>

        {/* Setup routes for pages */}
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/publish" element={<PublishVideo user={user} />} />
          <Route path="/video/:videoId" element={<VideoDetail user={user} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
