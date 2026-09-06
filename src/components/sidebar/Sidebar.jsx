import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Hash, Plus, LogOut } from 'lucide-react';
import Avatar from '../ui/Avatar';
import './Sidebar.css';

export default function Sidebar({ username, onLogout, onlineUsers = [] }) {
  return (
    <div className="sb">
      <div className="sb__head">
        <div className="sb__brand">
          <div className="sb__logo">C</div>
          <span className="sb__title">ChatRoom</span>
        </div>
      </div>

      <section className="sb__section">
        <div className="sb__label">
          <span>Channels</span>
          <button className="sb__icon-btn" title="Create group" type="button">
            <Plus size={13} />
          </button>
        </div>
        <Channel name="general" active />
        <Channel name="random" unread={3} />
        <Channel name="dev" />
      </section>

      <div className="sb__sep" />

      <section className="sb__section sb__section--flex">
        <div className="sb__label">
          <span>Online</span>
          <span className="sb__count">{onlineUsers.length || 4}</span>
        </div>
        <div className="sb__online-list">
          {(onlineUsers.length > 0 ? onlineUsers : ['AnantXplay', 'Yash', 'Rahul', 'Siddharth']).map((u) => (
            <OnlineUser key={typeof u === 'string' ? u : u.id || u.username} name={typeof u === 'string' ? u : u.username} status={typeof u === 'string' ? (u === 'Rahul' ? 'away' : 'online') : 'online'} />
          ))}
        </div>
      </section>

      <div className="sb__footer">
        <Avatar name={username || 'User'} size="sm" status="online" />
        <div className="sb__footer-info">
          <span className="sb__footer-name">{username || '...'}</span>
          <span className="sb__footer-status">
            <span className="sb__online-dot" /> Online
          </span>
        </div>
        <button className="sb__icon-btn sb__icon-btn--logout" onClick={onLogout} title="Logout" type="button">
          <LogOut size={14} />
        </button>
      </div>
    </div>
  );
}

function Channel({ name, active, unread }) {
  return (
    <motion.div
      className={clsx('sb__ch', active && 'sb__ch--active')}
      whileHover={{ x: active ? 0 : 3 }}
      transition={{ duration: 0.12 }}
    >
      <Hash size={13} className="sb__ch-hash" />
      <span>{name}</span>
      {unread > 0 && <span className="sb__ch-badge">{unread}</span>}
    </motion.div>
  );
}

function OnlineUser({ name, status }) {
  return (
    <div className="sb__user">
      <Avatar name={name} size="xs" status={status} />
      <span className="sb__user-name">{name}</span>
    </div>
  );
}
