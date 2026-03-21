export default function ChatInput({ input, setInput, onSend, disabled, mode, streaming }) {
  const placeholder = !mode ? 'Select a mode first...'
    : streaming ? 'Waiting for response...'
    : 'Type your message... (Enter to send, Shift+Enter for newline)';

  return (
    <div className="chat-input-area">
      <textarea
        className="chat-input"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend(input);
          }
        }}
        placeholder={placeholder}
        disabled={!mode || streaming}
        rows={1}
      />
      <button
        onClick={() => onSend(input)}
        disabled={!mode || streaming || !input.trim()}
        className="chat-send-btn"
        style={{
          background: (!mode || streaming || !input.trim()) ? 'var(--bg-surface)' : 'var(--accent)',
          color: (!mode || streaming || !input.trim()) ? 'var(--text-muted)' : '#fff',
          border: `1px solid ${(!mode || streaming || !input.trim()) ? 'var(--border)' : 'var(--accent)'}`,
        }}
      >
        {streaming ? '...' : 'Send →'}
      </button>
    </div>
  );
}