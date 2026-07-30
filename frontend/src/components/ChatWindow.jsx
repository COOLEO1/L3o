import React, { useEffect, useRef } from "react";
import Message from "./Message.jsx";
import InputBox from "./InputBox.jsx";
import { Sparkles, Trash2 } from "lucide-react";
import "./ChatWindow.css";

const SUGGESTIONS = [
  "Explain how async/await works in JavaScript",
  "Write a Python function to reverse a linked list",
  "What is the capital of Malawi?",
  "Help me debug a FastAPI CORS error",
];

export default function ChatWindow({
  messages,
  input,
  onInputChange,
  onSend,
  onStop,
  onSuggestion,
  onClear,
  isStreaming,
}) {
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <div className="chatwindow">
      <header className="chatwindow__header">
        <div className="chatwindow__brand">
          <span className="chatwindow__logo" aria-hidden="true" />
          <div>
            <h1 className="chatwindow__title">
              L<span className="chatwindow__title-accent">3</span>o AI
            </h1>
            <p className="chatwindow__tagline">by Leon Mapelera 🇲🇼</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button className="chatwindow__clear" onClick={onClear} type="button" aria-label="Clear chat">
            <Trash2 size={16} />
          </button>
        )}
      </header>

      <div className="chatwindow__scroll" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="chatwindow__welcome">
            <div className="chatwindow__welcome-orb" aria-hidden="true">
              <Sparkles size={22} />
            </div>
            <h2>How can I help you today?</h2>
            <p>Ask me anything, or drop in some code — I render Markdown and syntax-highlighted code blocks automatically.</p>
            <div className="chatwindow__suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="chatwindow__suggestion" onClick={() => onSuggestion(s)} type="button">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="chatwindow__messages">
            {messages.map((m, i) => (
              <Message
                key={i}
                role={m.role}
                content={m.content}
                isStreaming={isStreaming && i === messages.length - 1 && m.role === "assistant"}
              />
            ))}
          </div>
        )}
      </div>

      <InputBox
        value={input}
        onChange={onInputChange}
        onSend={onSend}
        onStop={onStop}
        disabled={isStreaming}
        isStreaming={isStreaming}
      />
    </div>
  );
}
