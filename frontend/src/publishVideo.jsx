import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Navigate } from 'react-router-dom';

function PublishVideo({ user }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // If user is not logged in, redirect to login
  if (user === null) {
      return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!title.trim() || !description.trim() || !thumbnail || !videoFile) {
        setError("All fields (Title, Description, Thumbnail, Video File) are required!");
        return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('thumbnail', thumbnail);
    formData.append('videoFile', videoFile);

    try {
        const response = await axios.post('http://localhost:8000/api/v1/videos/', formData, {
            withCredentials: true,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.data.success) {
            setSuccess(true);
            setTimeout(() => {
                navigate('/');
            }, 1500);
        }
    } catch (err) {
        console.error("Upload Error:", err);
        setError(err.response?.data?.message || "Failed to publish video. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  const handleFileChange = (e, setter) => {
      if (e.target.files && e.target.files[0]) {
          setter(e.target.files[0]);
      }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)', padding: '20px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '40px', borderRadius: '15px' }}>
        <h2 style={{ textAlign: 'center', color: '#fff', marginBottom: '10px' }}>Upload a New Video 🚀</h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', marginBottom: '30px' }}>Share your moments with the world</p>

        {error && <div style={{ background: 'rgba(255, 0, 0, 0.1)', color: '#ff4d4d', padding: '10px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', border: '1px solid #ff4d4d' }}>{error}</div>}
        {success && <div style={{ background: 'rgba(0, 255, 128, 0.1)', color: '#00ff80', padding: '10px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', border: '1px solid #00ff80' }}>Video published successfully! Redirecting to Home... 🎉</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: '#fff', fontWeight: 'bold' }}>Title</label>
            <input 
              type="text" 
              placeholder="Enter an eye-catching title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(0,0,0,0.3)',
                color: '#fff',
                fontSize: '16px',
                outline: 'none',
                transition: 'border 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#ff0055'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: '#fff', fontWeight: 'bold' }}>Description</label>
            <textarea 
              placeholder="Tell viewers about your video..."
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(0,0,0,0.3)',
                color: '#fff',
                fontSize: '16px',
                outline: 'none',
                resize: 'none',
                transition: 'border 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#ff0055'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
            ></textarea>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: '#fff', fontWeight: 'bold' }}>Thumbnail (Image)</label>
                <div style={{ 
                    border: '2px dashed rgba(255,255,255,0.3)', 
                    padding: '20px', 
                    borderRadius: '8px', 
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: 'rgba(0,0,0,0.2)',
                    position: 'relative'
                }}>
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setThumbnail)}
                        disabled={loading}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '24px' }}>🖼️</span>
                    <p style={{ margin: '10px 0 0 0', color: thumbnail ? '#00ff80' : '#fff', fontSize: '14px' }}>
                        {thumbnail ? thumbnail.name : 'Select Image'}
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: '#fff', fontWeight: 'bold' }}>Video File (MP4)</label>
                <div style={{ 
                    border: '2px dashed rgba(255,255,255,0.3)', 
                    padding: '20px', 
                    borderRadius: '8px', 
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: 'rgba(0,0,0,0.2)',
                    position: 'relative'
                }}>
                    <input 
                        type="file" 
                        accept="video/*"
                        onChange={(e) => handleFileChange(e, setVideoFile)}
                        disabled={loading}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '24px' }}>🎥</span>
                    <p style={{ margin: '10px 0 0 0', color: videoFile ? '#00ff80' : '#fff', fontSize: '14px' }}>
                        {videoFile ? videoFile.name : 'Select Video'}
                    </p>
                </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              marginTop: '10px',
              padding: '15px',
              borderRadius: '8px',
              border: 'none',
              background: loading ? 'rgba(255, 0, 85, 0.5)' : 'linear-gradient(45deg, #ff0055, #ff4d4d)',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(255, 0, 85, 0.4)',
              transition: 'all 0.3s ease',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px'
            }}
            onMouseOver={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
            onMouseOut={(e) => !loading && (e.target.style.transform = 'translateY(0)')}
          >
            {loading ? (
                <>
                    <div style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    Uploading... (This might take a while)
                </>
            ) : 'Publish Video'}
          </button>
        </form>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default PublishVideo;