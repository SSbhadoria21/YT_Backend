import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Register from './Register';
import PublishVideo from './publishVideo';
import VideoDetail from './VideoDetail';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import axios from 'axios';

function AppContent() {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const isVideoPage = location.pathname.startsWith('/video/');
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isVideoPage);

  useEffect(() => {
    if (isVideoPage) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [location.pathname, isVideoPage]);

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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Navbar user={user} handleLogout={handleLogout} toggleSidebar={toggleSidebar} />
      
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        <Sidebar isOpen={isSidebarOpen} isOverlay={isVideoPage} closeSidebar={() => setIsSidebarOpen(false)} />
        
        <main style={{ flex: 1, overflowY: 'auto', backgroundColor: '#0f0f0f' }}>
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/publish" element={<PublishVideo user={user} />} />
            <Route path="/video/:videoId" element={<VideoDetail user={user} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
