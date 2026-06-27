import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Navigate, Link } from 'react-router-dom';

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
                        setError("Videos lane me error aayi. Kya backend chal raha hai?");
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

    // Component ke return me hum JSX (HTML inside JS) likhte hain jo screen par dikhega.

    // Agar user logged in nahi hai (401 unauthorized), to usko redirect karenge login par
    if (unauthorized) {
        return <Navigate to="/login" replace />;
    }

    // Agar loading abhi bhi true hai (API ka response nahi aaya), to ek Loading message dikhayenge.
    if (loading) {
        return <h2 style={{ textAlign: "center", marginTop: "50px" }}>Loading Videos... ⏳</h2>;
    }

    // Agar koi error aayi thi, to red color me error message dikhayenge.
    if (error) {
        return <h2 style={{ textAlign: "center", color: "red", marginTop: "50px" }}>{error}</h2>;
    }

    // Helper component for Sidebar Item
    const SidebarItem = ({ icon, text, active }) => (
        <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '15px', 
            padding: '10px 15px', 
            borderRadius: '10px',
            cursor: 'pointer',
            backgroundColor: active ? 'rgba(255, 0, 85, 0.2)' : 'transparent',
            color: active ? '#ff0055' : 'white',
            transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => {
            if (!active) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
        }}
        onMouseOut={(e) => {
            if (!active) e.currentTarget.style.backgroundColor = 'transparent';
        }}>
            <span style={{ fontSize: '1.2rem' }}>{icon}</span>
            <span style={{ fontWeight: active ? 'bold' : 'normal' }}>{text}</span>
        </div>
    );

    const videoList = Array.isArray(videos) ? videos : [];

    const renderContent = () => {
        if (videoList.length === 0) {
            return (
                <div style={{ textAlign: "center", marginTop: "50px" }}>
                    <h2>{user ? `${user.fullName || user.username}, Aapke Homepage Par Aapka Swagat Hai! 🎉` : 'Aapke Homepage Par Aapka Swagat Hai! 🎉'}</h2>
                    <p>Abhi yahan koi video nahi hai. Video controller backend me kaam kar raha hai,</p>
                    <p>lekin database mein koi video nahi hai kyuki Upload feature abhi frontend se nahi bana.</p>
                </div>
            );
        }

        return (
            <div>
                <h2>All Videos 📺</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px", marginTop: "20px" }}>
                    {videoList.map((video) => (
                        <Link to={`/video/${video._id}`} key={video._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div style={{ 
                                border: "1px solid rgba(255,255,255,0.1)", 
                                padding: "10px", 
                                borderRadius: "12px",
                                background: "rgba(0,0,0,0.2)",
                                transition: "all 0.3s ease",
                                cursor: "pointer",
                                boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = "scale(1.02)";
                                e.currentTarget.style.boxShadow = "0 8px 15px rgba(255,0,85,0.2)";
                                e.currentTarget.style.borderColor = "rgba(255,0,85,0.5)";
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                                e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
                                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                            }}>
                                <img 
                                    src={video.thumbnail} 
                                    alt={video.title} 
                                    style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px" }} 
                                />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: "12px" }}>
                                    {video.ownerDetails && video.ownerDetails.avatar && (
                                        <img src={video.ownerDetails.avatar} alt="avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                                    )}
                                    <div style={{ overflow: 'hidden' }}>
                                        <h3 style={{ margin: 0, fontSize: '16px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{video.title}</h3>
                                        <p style={{ margin: "2px 0 0 0", color: "gray", fontSize: '14px' }}>
                                            {video.ownerDetails ? video.ownerDetails.username : 'Unknown'} • Views: {video.views || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'row', height: 'calc(100vh - 80px)', overflow: 'hidden' }}>
            {/* Main Content Area (Left side) */}
            <div style={{ flex: 1, padding: "20px", overflowY: 'auto' }}>
                {renderContent()}
            </div>

            {/* Sidebar (Right side) */}
            <div className="glass-panel" style={{ 
                width: '260px', 
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)', 
                borderTop: 'none',
                borderRight: 'none',
                borderBottom: 'none',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                overflowY: 'auto',
                borderRadius: '0'
            }}>
                <h3 style={{ marginBottom: '10px', color: '#ff0055', paddingLeft: '15px' }}>Explore</h3>
                
                <SidebarItem icon="🏠" text="Home" active={true} />
                <SidebarItem icon="🔥" text="Trending" />
                <SidebarItem icon="🎵" text="Music" />
                <SidebarItem icon="🎮" text="Gaming" />
                <SidebarItem icon="📰" text="News" />
                <SidebarItem icon="🏆" text="Sports" />

                <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '15px 0' }} />
                
                <h3 style={{ marginBottom: '10px', color: '#ff0055', paddingLeft: '15px' }}>You</h3>
                <SidebarItem icon="📚" text="Library" />
                <SidebarItem icon="🕒" text="History" />
                <SidebarItem icon="👍" text="Liked Videos" />
            </div>
        </div>
    );
}

// Function ko export kiya taaki dusri files (jaise App.jsx) isko import kar sakein.
export default Home;
