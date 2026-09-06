import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Paperclip, Send } from 'lucide-react';
import './MessageComposer.css';

export default function MessageComposer({ onSend, onTyping, onFileAttach, disabled }) {
  const [val, setVal] = useState('');
  const ref = useRef(null);

  const submit = useCallback(() => {
    if (!val.trim() || disabled) return;
    onSend?.(val.trim());
    setVal('');
    setTimeout(() => ref.current?.focus(), 0);
  }, [val, disabled, onSend]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="mc">
      <div className="mc__inner">
        <label className="mc__attach" title="Attach file">
          <Paperclip size={16} />
          <input type="file" hidden onChange={onFileAttach} />
        </label>
        <textarea
          ref={ref}
          className="mc__input"
          rows={1}
          placeholder="Message #general"
          value={val}
          onChange={(e) => {
            setVal(e.target.value);
            onTyping?.();
          }}
          onKeyDown={handleKey}
          disabled={disabled}
        />
        <motion.button
          className="mc__send"
          onClick={submit}
          disabled={!val.trim() || disabled}
          whileTap={{ scale: 0.88 }}
          transition={{ duration: 0.1 }}
          type="button"
        >
          <Send size={15} />
        </motion.button>
      </div>
    </div>
  );
}
