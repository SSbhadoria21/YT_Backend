import React from 'react';
import { Link } from 'react-router-dom';

const SidebarItem = ({ icon, text, active, isFilled, to = "#" }) => {
  return (
    <Link to={to} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        height: '40px',
        borderRadius: '10px',
        cursor: 'pointer',
        backgroundColor: active ? '#272727' : 'transparent',
        marginBottom: '4px'
      }}
      onMouseOver={(e) => {
        if (!active) e.currentTarget.style.backgroundColor = '#272727';
      }}
      onMouseOut={(e) => {
        if (!active) e.currentTarget.style.backgroundColor = 'transparent';
      }}>
        <span className={`material-symbols-outlined ${active || isFilled ? 'filled' : ''}`} style={{ marginRight: '24px', fontSize: '24px' }}>
          {icon}
        </span>
        <span style={{ fontSize: '14px', fontWeight: active ? '500' : '400', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {text}
        </span>
      </div>
    </Link>
  );
};

const SidebarDivider = () => (
  <div style={{ height: '1px', backgroundColor: '#3f3f3f', margin: '12px 0' }} />
);

const Sidebar = ({ isOpen, isOverlay, closeSidebar }) => {
  const sidebarStyle = {
    width: '240px',
    minWidth: '240px',
    backgroundColor: '#0f0f0f',
    overflowY: 'auto',
    padding: '12px',
    zIndex: 200,
    transition: 'transform 0.2s ease-in-out',
  };

  if (isOverlay) {
    sidebarStyle.position = 'absolute';
    sidebarStyle.top = 0;
    sidebarStyle.left = 0;
    sidebarStyle.height = '100%';
    sidebarStyle.transform = isOpen ? 'translateX(0)' : 'translateX(-100%)';
  } else {
    sidebarStyle.position = 'sticky';
    sidebarStyle.top = 0;
    sidebarStyle.height = 'calc(100vh - 56px)';
    sidebarStyle.display = isOpen ? 'block' : 'none';
  }

  return (
    <>
      {isOverlay && (
        <div 
          onClick={closeSidebar}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 150,
            display: isOpen ? 'block' : 'none',
            opacity: isOpen ? 1 : 0,
            transition: 'opacity 0.2s ease-in-out'
          }}
        />
      )}
      <aside style={sidebarStyle} className="hide-scrollbar">
      <SidebarItem icon="home" text="Home" active={true} to="/" />
      <SidebarItem icon="app_shortcut" text="Shorts" />
      <SidebarItem icon="subscriptions" text="Subscriptions" />
      
      <SidebarDivider />
      
      <div style={{ display: 'flex', alignItems: 'center', padding: '6px 12px', marginBottom: '4px', cursor: 'pointer' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '500' }}>You</h3>
        <span className="material-symbols-outlined" style={{ fontSize: '20px', marginLeft: '4px' }}>chevron_right</span>
      </div>
      
      <SidebarItem icon="history" text="History" />
      <SidebarItem icon="playlist_play" text="Playlists" />
      <SidebarItem icon="smart_display" text="Your videos" />
      <SidebarItem icon="schedule" text="Watch Later" />
      <SidebarItem icon="thumb_up" text="Liked videos" />

      <SidebarDivider />
      
      <h3 style={{ fontSize: '16px', fontWeight: '500', padding: '6px 12px', marginBottom: '4px' }}>Explore</h3>
      <SidebarItem icon="local_fire_department" text="Trending" />
      <SidebarItem icon="music_note" text="Music" />
      <SidebarItem icon="sports_esports" text="Gaming" />
      <SidebarItem icon="news" text="News" />
      <SidebarItem icon="trophy" text="Sports" />
      
      <SidebarDivider />
      
      <SidebarItem icon="settings" text="Settings" />
      <SidebarItem icon="flag" text="Report history" />
      <SidebarItem icon="help" text="Help" />
      <SidebarItem icon="feedback" text="Send feedback" />
      
      <SidebarDivider />
      
      <div style={{ padding: '16px 24px', fontSize: '12px', color: '#717171', lineHeight: '1.5' }}>
        <p>About Press Copyright Contact us Creators Advertise Developers</p>
        <br/>
        <p>Terms Privacy Policy & Safety How YouTube works Test new features</p>
        <br/>
        <p>© 2026 Google LLC</p>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
