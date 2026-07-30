import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "./CodeBlock.jsx";
import "./Message.css";

/**
 * Renders a single chat message.
 * - Normal text renders as plain readable Markdown (paragraphs, lists, bold, etc.)
 * - Fenced ```lang code blocks are detected automatically and rendered with
 *   the professional CodeBlock editor + syntax highlighting.
 * - Unknown/missing language falls back to a plain code block (still styled).
 */
export default function Message({ role, content, isStreaming }) {
  const isUser = role === "user";

  return (
    <div className={`msg-row ${isUser ? "msg-row--user" : "msg-row--ai"}`}>
      {!isUser && (
        <div className="msg-avatar msg-avatar--ai" aria-hidden="true">
          <span className="msg-avatar__core" />
        </div>
      )}

      <div className={`msg-bubble ${isUser ? "msg-bubble--user" : "msg-bubble--ai"}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // react-markdown v9 no longer passes an `inline` prop to the code
            // renderer, so we detect it ourselves: fenced code blocks either
            // carry a `language-xxx` className, or (when the language is
            // omitted/unknown) contain a newline. Anything else is inline code.
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              const codeString = String(children).replace(/\n$/, "");
              const looksLikeBlock = Boolean(match) || codeString.includes("\n");

              if (!looksLikeBlock) {
                return (
                  <code className="msg-inline-code" {...props}>
                    {children}
                  </code>
                );
              }

              return <CodeBlock language={match ? match[1] : ""} value={codeString} />;
            },
            p({ children }) {
              return <p className="msg-paragraph">{children}</p>;
            },
          }}
        >
          {content}
        </ReactMarkdown>
        {isStreaming && <span className="msg-caret" aria-hidden="true" />}
      </div>

      {isUser && (
        <div className="msg-avatar msg-avatar--user" aria-hidden="true">
          You
        </div>
      )}
    </div>
  );
}
