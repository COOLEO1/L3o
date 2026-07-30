import React, { useEffect, useRef, useState } from "react";
import SplashScreen from "./components/SplashScreen.jsx";
import ChatWindow from "./components/ChatWindow.jsx";

// Backend base URL. Set VITE_API_URL in frontend/.env for production
// (e.g. https://your-backend.onrender.com). Falls back to localhost for dev.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  const sendMessage = async (text) => {
    const userMessage = { role: "user", content: text };
    const history = [...messages, userMessage];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${API_URL}/api/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const errText = await res.text();
        throw new Error(errText || "Request failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop();

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;
          const dataStr = line.slice(5).trim();
          if (dataStr === "[DONE]") continue;

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.content) {
              assistantText += parsed.content;
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = { role: "assistant", content: assistantText };
                return next;
              });
            }
          } catch {
            // ignore malformed chunk
          }
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            role: "assistant",
            content:
              "⚠️ Something went wrong reaching L3o AI's backend. Make sure the server is running and MISTRAL_API_KEY is set.\n\n```\n" +
              String(err.message || err) +
              "\n```",
          };
          return next;
        });
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    sendMessage(text);
  };

  const handleStop = () => {
    if (abortRef.current) abortRef.current.abort();
    setIsStreaming(false);
  };

  const handleClear = () => setMessages([]);

  return (
    <>
      <SplashScreen visible={showSplash} />
      <ChatWindow
        messages={messages}
        input={input}
        onInputChange={setInput}
        onSend={handleSend}
        onStop={handleStop}
        onSuggestion={(s) => sendMessage(s)}
        onClear={handleClear}
        isStreaming={isStreaming}
      />
    </>
  );
}
