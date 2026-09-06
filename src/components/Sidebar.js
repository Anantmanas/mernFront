import React from "react";
import { motion } from "framer-motion";

const Sidebar = ({ user, getInitials, avatarColor, handleLogout }) => {
  const safeUser = user || "Guest";

  return (
    <div className="sidebar-shell sb">
      <div className="sidebar-header sb__head">
        <div className="sidebar-brand sb__brand">
          <span className="sidebar-brand-mark">⬡</span>
          <span>ChatRoom</span>
        </div>
        <button
          className="sidebar-action sb__icon-btn"
          type="button"
          aria-label="Create channel"
        >
          +
        </button>
      </div>

      <div className="sidebar-section sb__section">
        <div className="sidebar-section-label">
          <span>Channels</span>
          <span className="section-hint">#</span>
        </div>

        <motion.div
          className="channel sb__ch sb__ch--active active"
          whileHover={{ x: 2 }}
          transition={{ duration: 0.12 }}
        >
          <span>#</span>
          <span>general</span>
        </motion.div>
        <motion.div
          className="channel sb__ch"
          whileHover={{ x: 2 }}
          transition={{ duration: 0.12 }}
        >
          <span>#</span>
          <span>random</span>
        </motion.div>
        <motion.div
          className="channel sb__ch"
          whileHover={{ x: 2 }}
          transition={{ duration: 0.12 }}
        >
          <span>#</span>
          <span>dev</span>
        </motion.div>
      </div>

      <div className="sidebar-section sidebar-section-grow sb__section sb__section--flex">
        <div className="sidebar-section-label">
          <span>Online</span>
          <span className="section-hint">4</span>
        </div>
      </div>

      <div className="sidebar-footer sb__footer">
        <div
          className="sidebar-user-avatar"
          style={{ background: avatarColor(safeUser) }}
        >
          {getInitials(safeUser)}
        </div>
        <div className="sidebar-user-meta">
          <span className="sidebar-user-name">{safeUser}</span>
          <span className="sidebar-user-status">Online</span>
        </div>
        <button
          className="sidebar-action sb__icon-btn sb__icon-btn--logout"
          type="button"
          onClick={handleLogout}
          aria-label="Logout"
        >
          ↩
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
