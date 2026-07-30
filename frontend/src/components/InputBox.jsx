import React, { useRef } from "react";
import { SendHorizontal, Square } from "lucide-react";
import "./InputBox.css";

export default function InputBox({ value, onChange, onSend, onStop, disabled, isStreaming }) {
  const textareaRef = useRef(null);

  const handleInput = (e) => {
    onChange(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 160) + "px";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) onSend();
    }
  };

  return (
    <div className="inputbar">
      <div className="inputbar__shell">
        <textarea
          ref={textareaRef}
          className="inputbar__textarea"
          placeholder="Message L3o AI..."
          rows={1}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
        />
        {isStreaming ? (
          <button className="inputbar__btn inputbar__btn--stop" onClick={onStop} type="button" aria-label="Stop generating">
            <Square size={16} />
          </button>
        ) : (
          <button
            className="inputbar__btn"
            onClick={onSend}
            disabled={disabled || !value.trim()}
            type="button"
            aria-label="Send message"
          >
            <SendHorizontal size={18} />
          </button>
        )}
      </div>
      <p className="inputbar__hint">
        L3o AI can make mistakes. Powered by Mistral AI · Created by Leon Mapelera 🇲🇼
      </p>
    </div>
  );
}
