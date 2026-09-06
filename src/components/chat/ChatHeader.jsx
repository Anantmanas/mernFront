import { Search, MoreHorizontal } from 'lucide-react';
import './ChatHeader.css';

export default function ChatHeader({ roomName = 'general', onlineCount = 0 }) {
  return (
    <div className="ch-hdr">
      <div className="ch-hdr__left">
        <div className="ch-hdr__room-av">CR</div>
        <div className="ch-hdr__text">
          <span className="ch-hdr__name">{roomName}</span>
        </div>
        <div className="ch-hdr__pill">
          <span className="ch-hdr__pill-dot" />
          <span>{onlineCount} online</span>
        </div>
      </div>
      <div className="ch-hdr__actions">
        <button className="ch-hdr__btn" type="button" aria-label="Search">
          <Search size={15} />
        </button>
        <button className="ch-hdr__btn" type="button" aria-label="More options">
          <MoreHorizontal size={15} />
        </button>
      </div>
    </div>
  );
}
