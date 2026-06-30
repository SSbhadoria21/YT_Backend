import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ user, handleLogout, toggleSidebar }) => {
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 16px',
      height: '56px',
      backgroundColor: '#0f0f0f',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Left Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="icon-btn" onClick={toggleSidebar}>
          <span className="material-symbols-outlined">menu</span>
        </button>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* YouTube logo look-alike */}
          <span className="material-symbols-outlined filled" style={{ color: '#ff0000', fontSize: '28px' }}>
            play_circle
          </span>
          <span style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px', fontFamily: '"Impact", "Roboto", sans-serif' }}>SSB_YT</span>
        </Link>
      </div>

      {/* Center Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '0 1 732px', marginLeft: '40px' }}>
        <div style={{
          display: 'flex',
          flex: 1,
          alignItems: 'center',
          border: '1px solid #303030',
          borderRadius: '40px',
          backgroundColor: '#121212',
          overflow: 'hidden',
          marginLeft: '32px'
        }}>
          <input 
            type="text" 
            placeholder="Search" 
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              color: '#f1f1f1',
              padding: '0 16px 0 20px',
              fontSize: '16px',
              height: '40px',
              outline: 'none',
              width: '100%'
            }}
          />
          <button style={{
            backgroundColor: '#222222',
            border: 'none',
            borderLeft: '1px solid #303030',
            width: '64px',
            height: '40px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#f1f1f1'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px', fontWeight: 300 }}>search</span>
          </button>
        </div>
        <button className="icon-btn" style={{ backgroundColor: '#181818' }}>
          <span className="material-symbols-outlined">mic</span>
        </button>
      </div>

      {/* Right Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {user ? (
          <>
            <Link to="/publish">
              <button className="icon-btn">
                <span className="material-symbols-outlined">video_call</span>
              </button>
            </Link>
            <button className="icon-btn">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div style={{ marginLeft: '8px', cursor: 'pointer' }} onClick={handleLogout} title="Logout">
              {user.avatar ? (
                <img src={user.avatar} alt="avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#6200ee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '8px', marginRight: '10px' }}>
            <Link to="/login">
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0 15px',
                height: '36px',
                backgroundColor: 'transparent',
                color: '#3ea6ff',
                border: '1px solid #3ea6ff',
                borderRadius: '18px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>account_circle</span>
                Sign in
              </button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
