import { useState } from 'react';

/**
 * Code block with copy button.
 * Used inside markdown rendering for AI responses.
 */
export default function CodeBlock({ children, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = typeof children === 'string' ? children : children?.toString() || '';
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="code-block-wrapper">
      <pre>
        <code className={language ? `language-${language}` : ''}>
          {children}
        </code>
      </pre>
      <button className="code-copy-btn" onClick={handleCopy}>
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  );
}