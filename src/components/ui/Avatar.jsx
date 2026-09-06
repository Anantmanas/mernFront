import clsx from 'clsx';
import './Avatar.css';

const GRADIENTS = [
  'linear-gradient(135deg,#4F6BF0,#7C3AED)',
  'linear-gradient(135deg,#0F766E,#14B8A6)',
  'linear-gradient(135deg,#7C3AED,#EC4899)',
  'linear-gradient(135deg,#D97706,#F59E0B)',
  'linear-gradient(135deg,#DC2626,#F97316)',
  'linear-gradient(135deg,#0369A1,#38BDF8)',
];

function pickGrad(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) {
    h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  }
  return GRADIENTS[h % GRADIENTS.length];
}

export default function Avatar({ src, name = '?', size = 'md', status, className }) {
  const initials = name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={clsx('av', `av--${size}`, className)}>
      {src ? (
        <img src={src} alt={name} className="av__img" />
      ) : (
        <span className="av__init" style={{ background: pickGrad(name) }}>{initials}</span>
      )}
      {status && <span className={clsx('av__dot', `av__dot--${status}`)} />}
    </div>
  );
}
