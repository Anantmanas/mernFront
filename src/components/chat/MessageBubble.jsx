import { motion } from 'framer-motion';
import clsx from 'clsx';
import Avatar from '../ui/Avatar';
import './MessageBubble.css';

export default function MessageBubble({ msg, showAvatar = true }) {
  const { text, sender, timestamp, isSelf, fileUrl, fileName } = msg;

  return (
    <motion.div
      className={clsx('mb', isSelf && 'mb--self')}
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      layout
    >
      {!isSelf ? (
        showAvatar ? <Avatar name={sender} size="sm" className="mb__av" /> : <div className="mb__av-spacer" />
      ) : null}

      <div className="mb__body">
        {!isSelf && showAvatar && <span className="mb__sender">{sender}</span>}

        {fileUrl ? (
          <FileCard url={fileUrl} name={fileName} isSelf={isSelf} />
        ) : (
          <div className={clsx('mb__bubble', isSelf ? 'mb__bubble--self' : 'mb__bubble--other')}>{text}</div>
        )}

        <div className="mb__meta">
          <span>{formatTime(timestamp)}</span>
          {isSelf && <span className="mb__ticks">✓✓</span>}
        </div>
      </div>

      {isSelf && <div className="mb__av-spacer" />}
    </motion.div>
  );
}

function FileCard({ url, name, isSelf }) {
  const isImg = /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(url || name || '');

  return (
    <div className={clsx('mb__file', isSelf && 'mb__file--self')}>
      <div className="mb__file-header">
        <span className="mb__file-icon">{isImg ? '🖼' : '📎'}</span>
        <span className="mb__file-name">{name || 'Shared file'}</span>
      </div>
      {isImg && <img src={url} alt={name} className="mb__file-img" />}
    </div>
  );
}

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
