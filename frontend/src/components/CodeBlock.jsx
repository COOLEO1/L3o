import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";
import "./CodeBlock.css";

/**
 * Professional editor-style code block used inside AI chat messages.
 * Detects the language from the fenced code tag (```python, ```js, etc.)
 * and falls back to a plain block if the language is unknown.
 */
export default function CodeBlock({ language, value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard not available — silently ignore
    }
  };

  const displayLang = language ? language.toLowerCase() : "text";

  return (
    <div className="codeblock">
      <div className="codeblock__header">
        <span className="codeblock__dots" aria-hidden="true">
          <span /> <span /> <span />
        </span>
        <span className="codeblock__lang">{displayLang}</span>
        <button className="codeblock__copy" onClick={handleCopy} type="button">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        language={displayLang}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: "16px",
          background: "transparent",
          fontSize: "0.85rem",
          borderRadius: "0 0 var(--radius-md) var(--radius-md)",
        }}
        wrapLongLines
        showLineNumbers={value.split("\n").length > 3}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}
