import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Navigate, Link } from 'react-router-dom';

const categories = [
  "All", "Gaming", "Music", "Live", "Mixes", "Programming", "Podcasts", "News", "Recent", "Watched", "New to you", "JavaScript", "React", "Frontend Development", "Node.js", "AI", "Technology", "Comedy", "Vlogs", "Tutorials"
];

const CategoryChips = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScroll, 350); 
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      backgroundColor: '#0f0f0f',
      width: '100%',
      padding: '12px 0'
    }}>
      {showLeftArrow && (
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          background: 'linear-gradient(to right, #0f0f0f 70%, transparent)',
          zIndex: 2,
          paddingLeft: '12px'
        }}>
          <button className="icon-btn" onClick={() => scroll('left')} style={{ width: '32px', height: '32px', backgroundColor: '#0f0f0f', border: '1px solid #3f3f3f' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_left</span>
          </button>
        </div>
      )}
      
      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        style={{
          display: 'flex',
          gap: '12px',
          padding: '0 24px',
          overflowX: 'auto',
          width: '100%',
          scrollBehavior: 'smooth'
        }}
        className="hide-scrollbar"
      >
        {categories.map((cat, index) => (
          <button
            key={index}
            onClick={() => setActiveCategory(cat)}
            style={{
              backgroundColor: activeCategory === cat ? '#f1f1f1' : '#272727',
              color: activeCategory === cat ? '#0f0f0f' : '#f1f1f1',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => {
              if (activeCategory !== cat) e.currentTarget.style.backgroundColor = '#3f3f3f';
            }}
            onMouseOut={(e) => {
              if (activeCategory !== cat) e.currentTarget.style.backgroundColor = '#272727';
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {showRightArrow && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          background: 'linear-gradient(to left, #0f0f0f 70%, transparent)',
          zIndex: 2,
          paddingRight: '12px'
        }}>
          <button className="icon-btn" onClick={() => scroll('right')} style={{ width: '32px', height: '32px', backgroundColor: '#0f0f0f', border: '1px solid #3f3f3f' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
}

function Home({ user }) {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [unauthorized, setUnauthorized] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchVideos = async () => {
            try {
                setLoading(true);

                const response = await axios.get('http://localhost:8000/api/v1/videos', {
                    withCredentials: true
                });

                if (isMounted) {
                    setVideos(response.data.data.docs || response.data.data || []);
                }
            } catch (err) {
                console.error("Error fetching videos:", err);
                
                if (isMounted) {
                    if (err.response && err.response.status === 401) {
                        setUnauthorized(true);
                    } else {
                        setError("Could not load videos. Please check if the backend is running.");
                    }
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchVideos();

        return () => {
            isMounted = false;
        };
    }, []); 

    if (unauthorized) {
        return <Navigate to="/login" replace />;
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
                <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite', fontSize: '32px' }}>
                    progress_activity
                </span>
            </div>
        );
    }

    if (error) {
        return <div style={{ textAlign: "center", color: "#ff4d4d", marginTop: "50px", fontSize: '18px' }}>{error}</div>;
    }

    const videoList = Array.isArray(videos) ? videos : [];

    const formatViews = (views) => {
      if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
      if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
      return views;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <CategoryChips />
            
            <div style={{ padding: '24px' }}>
                {videoList.length === 0 ? (
                    <div style={{ textAlign: "center", marginTop: "50px", color: '#aaaaaa' }}>
                        <h2>Welcome! 🎉</h2>
                        <p>No videos found. Be the first to upload one!</p>
                    </div>
                ) : (
                    <div style={{ 
                        display: "grid", 
                        gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", 
                        gap: "40px 16px" 
                    }}>
                        {videoList.map((video) => (
                            <Link to={`/video/${video._id}`} key={video._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
                                    {/* Thumbnail container */}
                                    <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#222' }}>
                                        <img 
                                            src={video.thumbnail} 
                                            alt={video.title} 
                                            style={{ position: 'absolute', top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} 
                                        />
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '6px',
                                            right: '6px',
                                            backgroundColor: 'rgba(0,0,0,0.8)',
                                            color: 'white',
                                            padding: '3px 4px',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontWeight: '500'
                                        }}>
                                            {video.duration ? Math.floor(video.duration / 60) + ':' + ('0' + Math.floor(video.duration % 60)).slice(-2) : '10:05'}
                                        </div>
                                    </div>
                                    
                                    {/* Video Info */}
                                    <div style={{ display: 'flex', gap: '12px', marginTop: "12px" }}>
                                        <div>
                                          {video.ownerDetails && video.ownerDetails.avatar ? (
                                              <img src={video.ownerDetails.avatar} alt="avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                                          ) : (
                                              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#6200ee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                  {video.ownerDetails?.username ? video.ownerDetails.username.charAt(0).toUpperCase() : 'U'}
                                              </div>
                                          )}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', paddingRight: '24px' }}>
                                            <h3 style={{ 
                                                margin: 0, 
                                                fontSize: '16px', 
                                                fontWeight: '500', 
                                                lineHeight: '22px',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {video.title}
                                            </h3>
                                            <div style={{ color: "#aaaaaa", fontSize: '14px', marginTop: '4px', lineHeight: '20px' }}>
                                                <div>{video.ownerDetails ? video.ownerDetails.username : 'Unknown Channel'}</div>
                                                <div>{formatViews(video.views || 0)} views • 2 hours ago</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Home;
