import './Skeleton.css';

export default function Skeleton({ w, h, r, circle }) {
  return (
    <div
      className="skel"
      style={{
        width: w || '100%',
        height: h || '14px',
        borderRadius: circle ? '50%' : r || 'var(--r-sm)',
      }}
    />
  );
}
