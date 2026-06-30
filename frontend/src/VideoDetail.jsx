import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { timeAgo } from './utils/timeAgo';



function VideoDetail({ user }) {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const videoRef = useRef(null);

  // Keyboard Shortcuts Effect
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        document.activeElement.tagName === 'INPUT' || 
        document.activeElement.tagName === 'TEXTAREA' ||
        document.activeElement.isContentEditable
      ) {
        return;
      }

      const videoEl = videoRef.current;
      if (!videoEl) return;

      switch (e.key.toLowerCase()) {
        case 'k':
        case ' ': 
          e.preventDefault(); 
          if (videoEl.paused) videoEl.play();
          else videoEl.pause();
          break;
        case 'j':
          videoEl.currentTime -= 10;
          break;
        case 'l':
          videoEl.currentTime += 10;
          break;
        case 'm':
          videoEl.muted = !videoEl.muted;
          break;
        case 'f':
          if (!document.fullscreenElement) {
            videoEl.requestFullscreen().catch(err => console.error("Fullscreen error:", err));
          } else {
            document.exitFullscreen();
          }
          break;
        case 'i':
          if (document.pictureInPictureElement) {
            document.exitPictureInPicture();
          } else if (document.pictureInPictureEnabled) {
            videoEl.requestPictureInPicture().catch(err => console.error("PiP error:", err));
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch current video
        const videoRes = await axios.get(`http://localhost:8000/api/v1/videos/${videoId}`, { withCredentials: true });
        
        // Fetch all videos for recommendations
        const recRes = await axios.get(`http://localhost:8000/api/v1/videos`, { withCredentials: true });
        
        // Fetch comments for this video
        let fetchedComments = [];
        try {
          const commentsRes = await axios.get(`http://localhost:8000/api/v1/comments/${videoId}`, { withCredentials: true });
          fetchedComments = commentsRes.data.data.docs || commentsRes.data.data || [];
        } catch (commentErr) {
          console.error("Failed to load comments:", commentErr);
        }
        
        if (isMounted) {
          const fetchedVideo = videoRes.data.data;
          setVideo(fetchedVideo);
          setIsSubscribed(fetchedVideo.isSubscribed || false);
          setSubscribersCount(fetchedVideo.subscribersCount || 0);
          setIsLiked(fetchedVideo.isLiked || false);
          setLikesCount(fetchedVideo.likesCount || 0);
          setComments(fetchedComments);

          // Filter out current video from recommendations
          let recs = recRes.data.data.docs || recRes.data.data || [];
          recs = recs.filter(v => v._id !== videoId);
          setRecommendedVideos(recs);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || "Failed to load video.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [videoId]);

  const handleSubscribe = async () => {
    if (!user) {
      alert("Please login to subscribe");
      return;
    }
    if (video?.owner?._id === user._id) {
      alert("You cannot subscribe to your own channel");
      return;
    }
    
    // Optimistic UI update
    const previousSubState = isSubscribed;
    setIsSubscribed(!isSubscribed);
    setSubscribersCount(prev => isSubscribed ? prev - 1 : prev + 1);

    try {
      await axios.post(`http://localhost:8000/api/v1/subscriptions/c/${video.owner._id}`, {}, {
        withCredentials: true
      });
    } catch (err) {
      console.error("Subscription failed:", err);
      // Revert if failed
      setIsSubscribed(previousSubState);
      setSubscribersCount(prev => previousSubState ? prev + 1 : prev - 1);
      alert(err.response?.data?.message || "Failed to subscribe");
    }
  };

  const handleCommentSubmit = async (e) => {
    if (e.key === 'Enter') {
      if (!user) {
        alert("Please login to comment");
        return;
      }
      if (!newComment.trim()) return;

      try {
        const res = await axios.post(`http://localhost:8000/api/v1/comments/${videoId}`, {
          content: newComment
        }, {
          withCredentials: true
        });

        // Optimistically add the new comment to the list
        // Add ownerDetails manually since the API response for adding a comment doesn't populate it immediately
        const addedComment = {
          ...res.data.data,
          ownerDetails: {
            username: user.username,
            fullName: user.fullName,
            avatar: user.avatar
          }
        };

        setComments(prev => [addedComment, ...prev]);
        setNewComment(""); // Clear input
      } catch (err) {
        console.error("Failed to add comment:", err);
        alert(err.response?.data?.message || "Failed to add comment");
      }
    }
  };

  const handleLikeToggle = async () => {
    if (!user) {
      alert("Please login to like this video");
      return;
    }

    // Optimistic UI update
    const previousLikeState = isLiked;
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);

    try {
      await axios.post(`http://localhost:8000/api/v1/likes/toggle/v/${videoId}`, {}, {
        withCredentials: true
      });
    } catch (err) {
      console.error("Like toggle failed:", err);
      // Revert if failed
      setIsLiked(previousLikeState);
      setLikesCount(prev => previousLikeState ? prev + 1 : prev - 1);
      alert(err.response?.data?.message || "Failed to like video");
    }
  };

  if (loading) return <div style={{display:'flex',justifyContent:'center',marginTop:'50px'}}><span className="material-symbols-outlined" style={{animation:'spin 1s linear infinite', fontSize:'32px'}}>progress_activity</span></div>;
  if (error) return <div style={{textAlign:"center",marginTop:"50px",color:"#ff4d4d"}}><h2>{error}</h2></div>;
  if (!video) return <div style={{textAlign:"center",marginTop:"50px"}}><h2>Video not found!</h2></div>;

  const formatViews = (views) => {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
    return views;
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '24px', backgroundColor: '#0f0f0f', minHeight: 'calc(100vh - 56px)' }}>
      {/* Container max-width and responsive flex */}
      <div style={{ display: 'flex', flexWrap: 'wrap', width: '100%', maxWidth: '1700px', gap: '24px' }}>
        
        {/* Left Column: Video + Meta + Comments */}
        <div style={{ flex: '1 1 65%', minWidth: '300px' }}>
          {/* Video Player */}
          <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden' }}>
            <video ref={videoRef} src={video.videoFile} controls autoPlay poster={video.thumbnail} style={{ width: '100%', height: '100%', outline: 'none' }}></video>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: '20px', fontWeight: '700', marginTop: '16px', marginBottom: '12px', lineHeight: '28px' }}>{video.title}</h1>

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
            
            {/* Channel Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {video.owner?.avatar ? (
                <img src={video.owner.avatar} alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#6200ee', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>
                  {video.owner?.username ? video.owner.username.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: '500', fontSize: '16px' }}>{video.owner?.fullName || video.owner?.username || 'Unknown'}</span>
                <span style={{ fontSize: '12px', color: '#aaaaaa' }}>{formatViews(subscribersCount)} subscribers</span>
              </div>
              <button 
                onClick={handleSubscribe}
                style={{ 
                  marginLeft: '12px', 
                  backgroundColor: isSubscribed ? '#272727' : '#f1f1f1', 
                  color: isSubscribed ? '#f1f1f1' : '#0f0f0f', 
                  border: 'none', 
                  borderRadius: '18px', 
                  padding: '0 16px', 
                  height: '36px', 
                  fontWeight: '500', 
                  fontSize: '14px', 
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ display: 'flex', backgroundColor: '#272727', borderRadius: '18px', overflow: 'hidden' }}>
                <button onClick={handleLikeToggle} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', color: '#f1f1f1', padding: '0 16px', height: '36px', cursor: 'pointer', borderRight: '1px solid #3f3f3f' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}>thumb_up</span>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{formatViews(likesCount)}</span>
                </button>
                <button style={{ display: 'flex', alignItems: 'center', background: 'transparent', border: 'none', color: '#f1f1f1', padding: '0 16px', height: '36px', cursor: 'pointer' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>thumb_down</span>
                </button>
              </div>

              <button style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#272727', color: '#f1f1f1', border: 'none', borderRadius: '18px', padding: '0 16px', height: '36px', fontWeight: '500', fontSize: '14px', cursor: 'pointer' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>share</span> Share
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#272727', color: '#f1f1f1', border: 'none', borderRadius: '18px', padding: '0 16px', height: '36px', fontWeight: '500', fontSize: '14px', cursor: 'pointer' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>download</span> Download
              </button>
              <button style={{ display: 'flex', alignItems: 'center', backgroundColor: '#272727', color: '#f1f1f1', border: 'none', borderRadius: '18px', padding: '0 12px', height: '36px', cursor: 'pointer' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>more_horiz</span>
              </button>
            </div>
          </div>

          {/* Description Box */}
          <div 
            style={{ backgroundColor: '#272727', borderRadius: '12px', padding: '12px', cursor: 'pointer', transition: 'background-color 0.2s' }}
            onClick={() => setShowFullDesc(!showFullDesc)}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3f3f3f'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#272727'}
          >
            <div style={{ fontWeight: '500', fontSize: '14px', marginBottom: '4px' }}>
              {formatViews(video.views || 0)} views • {timeAgo(video.createdAt)}
            </div>
            <div style={{ fontSize: '14px', whiteSpace: 'pre-wrap', lineHeight: '20px', display: showFullDesc ? 'block' : '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {video.description || "No description provided."}
            </div>
            <div style={{ marginTop: '4px', fontWeight: '500', fontSize: '14px' }}>
              {showFullDesc ? 'Show less' : '...more'}
            </div>
          </div>

          {/* Comments Section */}
          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700' }}>{comments.length} Comments</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>sort</span>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>Sort by</span>
              </div>
            </div>

            {/* Add Comment Input */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#6200ee', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <input 
                  type="text" 
                  placeholder="Add a comment... (Press Enter to submit)" 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={handleCommentSubmit}
                  style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid #717171', color: '#f1f1f1', paddingBottom: '4px', fontSize: '14px', outline: 'none' }} 
                />
              </div>
            </div>

            {/* Comment List */}
            {comments.map(comment => {
              const commenterName = comment.ownerDetails?.fullName || comment.ownerDetails?.username || 'User';
              const commenterUsername = comment.ownerDetails?.username || 'user';
              
              return (
                <div key={comment._id} style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  {comment.ownerDetails?.avatar ? (
                    <img src={comment.ownerDetails.avatar} alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '40px', height: '40px', minWidth: '40px', borderRadius: '50%', background: '#444', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>
                      {commenterName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '500', fontSize: '13px' }}>@{commenterUsername.toLowerCase()}</span>
                      <span style={{ fontSize: '12px', color: '#aaaaaa' }}>{timeAgo(comment.createdAt)}</span>
                    </div>
                    <div style={{ fontSize: '14px', marginBottom: '8px', whiteSpace: 'pre-wrap' }}>{comment.content}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>thumb_up</span>
                        <span style={{ fontSize: '12px', color: '#aaaaaa' }}>0</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>thumb_down</span>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>Reply</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: Recommendations */}
        <div style={{ flex: '1 1 30%', minWidth: '300px' }}>
          {recommendedVideos.map(recVideo => (
            <Link to={`/video/${recVideo._id}`} key={recVideo._id} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <div style={{ position: 'relative', width: '168px', minWidth: '168px', height: '94px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#222' }}>
                <img src={recVideo.thumbnail} alt={recVideo.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: '4px', right: '4px', backgroundColor: 'rgba(0,0,0,0.8)', padding: '2px 4px', borderRadius: '4px', fontSize: '12px', fontWeight: '500' }}>
                  {recVideo.duration ? Math.floor(recVideo.duration / 60) + ':' + ('0' + Math.floor(recVideo.duration % 60)).slice(-2) : '10:05'}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingRight: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '500', lineHeight: '20px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {recVideo.title}
                </h3>
                <div style={{ fontSize: '12px', color: '#aaaaaa', marginTop: '4px', lineHeight: '18px' }}>
                  <div>{recVideo.ownerDetails?.username || 'Unknown Channel'}</div>
                  <div>{formatViews(recVideo.views || 0)} views • {timeAgo(recVideo.createdAt)}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VideoDetail;
