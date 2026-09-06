import { motion } from 'framer-motion';
import './AppLayout.css';

export default function AppLayout({ sidebar, chat, className = '' }) {
  return (
    <motion.div
      className={`app-shell ${className}`.trim()}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      {sidebar && <aside className="app-sidebar">{sidebar}</aside>}
      <main className="app-main">{chat}</main>
    </motion.div>
  );
}
