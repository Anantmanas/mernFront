import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Sidebar.css';

const UserIcon = () => <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const SettingsIcon = () => <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const LogoutIcon = () => <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const ChevronLeft = () => <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const ChevronRight = () => <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const MenuIcon = () => <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;

const Sidebar = ({ user, getInitials, avatarColor, handleLogout }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) setIsOpen(false);
      else setIsOpen(true);
    };
    // initial check
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarWidth = isOpen ? 280 : (isMobile ? 0 : 80);

  return (
    <>
      {isMobile && (
        <button className="sidebar-toggle-mobile" onClick={() => setIsOpen(true)}>
          <MenuIcon />
        </button>
      )}

      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.div 
        className={`sidebar ${isMobile ? 'mobile' : ''}`}
        initial={false}
        animate={{ 
          width: sidebarWidth, 
          paddingLeft: sidebarWidth > 0 ? undefined : 0, 
          paddingRight: sidebarWidth > 0 ? undefined : 0, 
          borderRightWidth: sidebarWidth > 0 ? 1 : 0 
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
      >
        <div className="sidebar-header" style={{ minWidth: 280 }}>
          {isOpen && <motion.h2 initial={{opacity: 0}} animate={{opacity: 1}} className="sidebar-title">Menu</motion.h2>}
          {!isMobile && (
            <button className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)} style={{ marginLeft: isOpen ? 'auto' : 0 }}>
              {isOpen ? <ChevronLeft /> : <ChevronRight />}
            </button>
          )}
          {isMobile && (
             <button className="sidebar-toggle" onClick={() => setIsOpen(false)} style={{ marginLeft: 'auto' }}>
              <ChevronLeft />
            </button>
          )}
        </div>

        <div className="sidebar-profile" style={{ minWidth: 280 }}>
          <div className="sidebar-avatar" style={{ background: avatarColor(user) }}>
            {getInitials(user)}
          </div>
          {isOpen && (
            <motion.div 
              className="profile-info"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="profile-name">{user || "You"}</div>
              <div className="profile-email">@{user?.toLowerCase() || "user"}</div>
            </motion.div>
          )}
        </div>

        <div className="sidebar-nav" style={{ minWidth: 280 }}>
          <div className="nav-item">
            <div className="nav-icon"><UserIcon /></div>
            {isOpen && <motion.span initial={{opacity: 0}} animate={{opacity: 1}}>Profile Setting</motion.span>}
          </div>
          <div className="nav-item">
            <div className="nav-icon"><SettingsIcon /></div>
            {isOpen && <motion.span initial={{opacity: 0}} animate={{opacity: 1}}>Account Setting</motion.span>}
          </div>
        </div>

        <div className="sidebar-footer" style={{ minWidth: 280 }}>
          <div className="nav-item logout" onClick={handleLogout}>
            <div className="nav-icon"><LogoutIcon /></div>
            {isOpen && <motion.span initial={{opacity: 0}} animate={{opacity: 1}}>Logout</motion.span>}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
