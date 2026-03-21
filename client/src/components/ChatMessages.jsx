// client/src/components/ChatMessages.jsx
import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlock';

const TypingDots = () => (
  <div className="typing-dots">
    <div className="typing-dot" />
    <div className="typing-dot" />
    <div className="typing-dot" />
  </div>
);

const MODES = {
  dsa_hint:        { label: '💡 Hint',      desc: "Describe your current approach and I'll guide you with questions." },
  dsa_reveal:      { label: '🔓 Reveal',     desc: 'Type "show me the solution" to get all 3 approaches.' },
  tech_explain:    { label: '📖 Explain',    desc: 'Ask me anything about this topic or type "explain it".' },
  mock_dsa:        { label: '🎤 Mock DSA',   desc: 'Type "start interview" to begin your mock session.' },
  mock_tech:       { label: '🎤 Mock Tech',  desc: 'Type "start interview" to begin.' },
  mock_behavioral: { label: '🎤 Behavioral', desc: 'Type "start interview" to begin.' },
};

// react-markdown v10 components — no className on <ReactMarkdown>, no `inline` prop
const markdownComponents = {
  // Unwrap the default <pre> so CodeBlock handles its own wrapper
  pre({ children }) { return <>{children}</>; },
  code({ className, children }) {
    const match = /language-(\w+)/.exec(className || '');
    return match
      ? <CodeBlock language={match[1]}>{String(children).replace(/\n$/, '')}</CodeBlock>
      : <code className={className}>{children}</code>;
  },
};

const ChatMessages = ({ messages, typing, bottomRef, mode }) => (
  <div className="chat-messages">
    {/* Empty state */}
    {messages.length === 0 && mode && (
      <div className="chat-empty">
        <div className="chat-empty-icon">🥋</div>
        <div className="chat-empty-title">{MODES[mode]?.label} mode ready</div>
        <div className="chat-empty-desc">{MODES[mode]?.desc}</div>
      </div>
    )}

    {/* Message bubbles */}
    {messages.map((msg, i) => (
      <div
        key={i}
        style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
      >
        <div className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
          {msg.role === 'assistant' ? (
            <div className="markdown-body">
              <ReactMarkdown components={markdownComponents}>
                {msg.content || '...'}
              </ReactMarkdown>
            </div>
          ) : (
            <span>{msg.content}</span>
          )}
        </div>
      </div>
    ))}

    {/* Typing indicator */}
    {typing && (
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <div className="chat-bubble-ai" style={{ padding: 0 }}>
          <TypingDots />
        </div>
      </div>
    )}

    <div ref={bottomRef} />
  </div>
);

export default ChatMessages;