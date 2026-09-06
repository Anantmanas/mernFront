import { AnimatePresence, motion } from 'framer-motion';
import './TypingIndicator.css';

export default function TypingIndicator({ isTyping, typerName }) {
  return (
    <AnimatePresence>
      {isTyping && (
        <motion.div
          className="ti"
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.16 }}
        >
          <div className="ti__bubble">
            <span className="ti__dot" />
            <span className="ti__dot" />
            <span className="ti__dot" />
            {typerName && <span className="ti__label">{typerName} is typing</span>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
