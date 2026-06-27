import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import axios from 'axios';

function VideoDetail({ user }) {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchVideoDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8000/api/v1/videos/${videoId}`, {
          withCredentials: true
        });
        
        if (isMounted) {
          setVideo(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching video details:", err);
        if (isMounted) {
          setError(err.response?.data?.message || "Failed to load video. It might have been deleted.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchVideoDetails();
    return () => { isMounted = false; };
  }, [videoId]);

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}><h2>Loading Video... ⏳</h2></div>;
  }

  if (error) {
    return <div style={{ textAlign: "center", marginTop: "50px", color: "#ff4d4d" }}><h2>{error}</h2></div>;
  }

  if (!video) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}><h2>Video not found!</h2></div>;
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px', minHeight: 'calc(100vh - 80px)' }}>
      <div style={{ width: '100%', maxWidth: '1000px' }}>
        
        {/* Video Player */}
        <div style={{ 
            width: '100%', 
            background: '#000', 
            borderRadius: '12px', 
            overflow: 'hidden',
            boxShadow: '0 8px 20px rgba(0,0,0,0.5)'
        }}>
          <video 
            src={video.videoFile} 
            controls 
            autoPlay 
            style={{ width: '100%', maxHeight: '600px', outline: 'none' }}
            poster={video.thumbnail}
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Video Info Section */}
        <div style={{ marginTop: '20px' }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>{video.title}</h1>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            {/* Owner Details */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {video.owner?.avatar ? (
                <img 
                    src={video.owner.avatar} 
                    alt={video.owner.username} 
                    style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} 
                />
              ) : (
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#333', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    👤
                </div>
              )}
              <div>
                <h3 style={{ margin: 0 }}>{video.owner?.fullName || video.owner?.username || 'Unknown Creator'}</h3>
                <p style={{ margin: 0, color: 'gray', fontSize: '14px' }}>@{video.owner?.username}</p>
              </div>
              <button style={{ 
                marginLeft: '15px', 
                padding: '8px 16px', 
                borderRadius: '20px', 
                border: 'none', 
                background: 'white', 
                color: 'black', 
                fontWeight: 'bold',
                cursor: 'pointer' 
              }}>Subscribe</button>
            </div>

            {/* Video Stats */}
            <div style={{ display: 'flex', gap: '15px', background: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '25px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontSize: '18px' }}>👁️</span>
                <span style={{ fontWeight: 'bold' }}>{video.views || 0}</span>
              </div>
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                <span style={{ fontSize: '18px' }}>👍</span>
                <span style={{ fontWeight: 'bold' }}>{video.likesCount || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description Box */}
        <div style={{ 
            marginTop: '20px', 
            background: 'rgba(255,255,255,0.05)', 
            padding: '15px', 
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '14px' }}>
            Published on {new Date(video.createdAt).toLocaleDateString()}
          </p>
          <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
            {video.description}
          </p>
        </div>

      </div>
    </div>
  );
}

export default VideoDetail;
