import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

const API = 'http://localhost:5000';

// Mode config — label, description, which context it needs
const MODES = {
  dsa_hint: {
    label: '💡 Hint',
    desc: 'Socratic hints only — no code given',
    needs: 'dsa',
    color: '#f59e0b',
  },
  dsa_reveal: {
    label: '🔓 Reveal',
    desc: '3 solutions with complexity analysis',
    needs: 'dsa',
    color: '#6366f1',
  },
  tech_explain: {
    label: '📖 Explain',
    desc: 'Deep explanation with analogy',
    needs: 'tech',
    color: '#10b981',
  },
  mock_dsa: {
    label: '🎤 Mock DSA',
    desc: 'Live coding interview simulation',
    needs: 'any',
    color: '#ef4444',
  },
  mock_tech: {
    label: '🎤 Mock Tech',
    desc: 'Technical concepts interview',
    needs: 'any',
    color: '#ef4444',
  },
  mock_behavioral: {
    label: '🎤 Behavioral',
    desc: 'Behavioral interview simulation',
    needs: 'any',
    color: '#ef4444',
  },
};

// Typing indicator — 3 animated dots
function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: '4px', padding: '12px 16px',
      alignItems: 'center', height: '42px' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: '7px', height: '7px', borderRadius: '50%',
          background: '#94a3b8',
          animation: 'bounce 1.2s infinite',
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

export default function Chat() {
  const [searchParams] = useSearchParams();
  const problemId      = searchParams.get('problemId');
  const techId         = searchParams.get('techQuestionId');

  const [context,    setContext]    = useState(null);  // { type, data }
  const [mode,       setMode]       = useState('');
  const [messages,   setMessages]   = useState([]);    // { role, content }[]
  const [input,      setInput]      = useState('');
  const [streaming,  setStreaming]  = useState(false);
  const [typing,     setTyping]     = useState(false); // show dots before first token
  const [sessionSaved, setSessionSaved] = useState(false);

  const bottomRef  = useRef(null);
  const readerRef  = useRef(null); // to cancel stream on unmount

  // Fetch context (problem or tech question)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const params = new URLSearchParams();
    if (problemId) params.set('problemId', problemId);
    if (techId)    params.set('techQuestionId', techId);

    fetch(`${API}/api/chat/context?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(data => {
      setContext(data);
      // Auto-set default mode based on context type
      if (data.type === 'dsa')  setMode('dsa_hint');
      if (data.type === 'tech') setMode('tech_explain');
      if (data.type === 'mock') setMode('mock_dsa');
    })
    .catch(console.error);
  }, [problemId, techId]);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Cancel stream on unmount
  useEffect(() => {
    return () => { readerRef.current?.cancel(); };
  }, []);

  const sendMessage = async (userText) => {
    if (!userText.trim() || streaming) return;
    const token = localStorage.getItem('token');
    if (!token) { alert('Please log in first'); return; }

    const userMsg = { role: 'user', content: userText };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setStreaming(true);
    setTyping(true); // show dots

    // Placeholder for the AI response — will be filled chunk by chunk
    const aiMsgIndex = newMessages.length;
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch(`${API}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages:        newMessages,
          mode,
          problemId:       problemId || undefined,
          techQuestionId:  techId    || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Stream failed');
      }

      const reader = res.body.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();
      let fullContent = '';

      // Read SSE chunks
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        setTyping(false); // hide dots once first chunk arrives

        // Each SSE chunk looks like: "data: {...}\n\n"
        // Some chunks may have multiple data lines
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const dataStr = line.slice(6).trim();
          if (dataStr === '[DONE]') continue;
          if (dataStr.startsWith('[ERROR]')) {
            fullContent += '\n\n❌ ' + dataStr.slice(7);
            break;
          }

          try {
            const parsed = JSON.parse(dataStr);
            const token  = parsed.choices?.[0]?.delta?.content;
            if (token) {
              fullContent += token;
              // Update the AI message in place
              setMessages(prev => {
                const updated = [...prev];
                updated[aiMsgIndex] = { role: 'assistant', content: fullContent };
                return updated;
              });
            }
          } catch {
            // Incomplete JSON chunk — skip
          }
        }
      }

    } catch (err) {
      setTyping(false);
      setMessages(prev => {
        const updated = [...prev];
        updated[aiMsgIndex] = {
          role: 'assistant',
          content: `❌ Error: ${err.message}. Please try again.`
        };
        return updated;
      });
    } finally {
      setStreaming(false);
      setTyping(false);
    }
  };

  const saveSession = async (solved) => {
    const token = localStorage.getItem('token');
    if (!token || messages.length === 0) return;
    try {
      await fetch(`${API}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ problemId, messages, mode, solved }),
      });
      setSessionSaved(true);
    } catch (err) {
      console.error('Save session error:', err);
    }
  };

  const switchMode = (newMode) => {
    if (streaming) return;
    setMode(newMode);
    setMessages([]); // clear chat when switching modes
    setSessionSaved(false);
  };

  // Which modes to show based on context type
  const visibleModes = Object.entries(MODES).filter(([key, cfg]) => {
    if (!context) return cfg.needs === 'any';
    if (cfg.needs === 'any') return true;
    return cfg.needs === context.type;
  });

  const DIFF_COLOR = {
    Easy:   '#16a34a',
    Medium: '#ca8a04',
    Hard:   '#dc2626',
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 57px)', overflow: 'hidden' }}>

      {/* ── Left Panel ─────────────────────────────────────── */}
      <div style={{
        width: '260px', flexShrink: 0, borderRight: '1px solid #e2e8f0',
        background: '#f8fafc', overflowY: 'auto', padding: '16px'
      }}>

        {/* Context card */}
        {context?.data && (
          <div style={{
            background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px',
            padding: '14px', marginBottom: '16px'
          }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '1px',
              fontWeight: 700, marginBottom: '6px' }}>
              {context.type === 'dsa' ? 'DSA PROBLEM' : 'TECH QUESTION'}
            </div>

            {context.type === 'dsa' && (
              <>
                <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>
                  #{context.data.leetcodeNum} {context.data.title}
                </div>
                <span style={{
                  fontSize: '11px', fontWeight: 600, padding: '2px 8px',
                  borderRadius: '20px', background: '#f1f5f9',
                  color: DIFF_COLOR[context.data.difficulty]
                }}>
                  {context.data.difficulty}
                </span>
                <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {context.data.topics?.map(t => (
                    <span key={t} style={{ fontSize: '11px', padding: '2px 7px',
                      borderRadius: '4px', background: '#ede9fe', color: '#6366f1' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </>
            )}

            {context.type === 'tech' && (
              <div style={{ fontSize: '13px', lineHeight: 1.5, color: '#334155' }}>
                {context.data.question}
              </div>
            )}
          </div>
        )}

        {/* Mode buttons */}
        <div style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '1px',
          fontWeight: 700, marginBottom: '8px' }}>
          MODE
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {visibleModes.map(([key, cfg]) => (
            <button key={key} onClick={() => switchMode(key)}
              style={{
                width: '100%', textAlign: 'left', padding: '10px 12px',
                borderRadius: '8px', border: '1px solid',
                cursor: streaming ? 'not-allowed' : 'pointer',
                borderColor: mode === key ? cfg.color : '#e2e8f0',
                background:  mode === key ? cfg.color + '15' : '#fff',
                opacity: streaming ? 0.6 : 1,
                transition: 'all 0.15s',
              }}>
              <div style={{ fontSize: '13px', fontWeight: 600,
                color: mode === key ? cfg.color : '#334155' }}>
                {cfg.label}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                {cfg.desc}
              </div>
            </button>
          ))}
        </div>

        {/* Save session */}
        {messages.length > 1 && !sessionSaved && context?.type === 'dsa' && (
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '1px',
              fontWeight: 700, marginBottom: '4px' }}>
              MARK SESSION
            </div>
            <button onClick={() => saveSession(true)}
              style={{ padding: '8px', borderRadius: '7px', fontSize: '13px',
                background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0',
                cursor: 'pointer', fontWeight: 600 }}>
              ✓ Solved it!
            </button>
            <button onClick={() => saveSession(false)}
              style={{ padding: '8px', borderRadius: '7px', fontSize: '13px',
                background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0',
                cursor: 'pointer' }}>
              Save & come back later
            </button>
          </div>
        )}

        {sessionSaved && (
          <div style={{ marginTop: '16px', padding: '10px', borderRadius: '8px',
            background: '#dcfce7', color: '#16a34a', fontSize: '13px',
            fontWeight: 600, textAlign: 'center' }}>
            ✓ Session saved!
          </div>
        )}
      </div>

      {/* ── Chat Area ──────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Mode header bar */}
        <div style={{
          padding: '10px 20px', borderBottom: '1px solid #e2e8f0',
          background: '#fff', display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          {mode && MODES[mode] && (
            <>
              <span style={{ fontSize: '15px', fontWeight: 700,
                color: MODES[mode].color }}>
                {MODES[mode].label}
              </span>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                {MODES[mode].desc}
              </span>
            </>
          )}
          {!mode && (
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>
              Select a mode on the left to start
            </span>
          )}
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px',
          display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Empty state */}
          {messages.length === 0 && mode && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🥋</div>
              <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px', color: '#64748b' }}>
                {MODES[mode]?.label} mode ready
              </div>
              <div style={{ fontSize: '13px' }}>
                {mode === 'dsa_hint' && 'Describe your current approach and I\'ll guide you with questions.'}
                {mode === 'dsa_reveal' && 'Type "show me the solutions" to get all 3 approaches.'}
                {mode === 'tech_explain' && 'Ask me anything about this topic or type "explain it".'}
                {mode.startsWith('mock') && 'Type "start interview" to begin your mock session.'}
              </div>
            </div>
          )}

          {/* Message bubbles */}
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}>
              <div style={{
                maxWidth: '75%',
                padding: '12px 16px',
                borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                background: msg.role === 'user' ? '#6366f1' : '#f1f5f9',
                color: msg.role === 'user' ? '#fff' : '#1e293b',
                fontSize: '14px',
                lineHeight: 1.65,
              }}>
                {msg.role === 'assistant' ? (
                  <div className="markdown-body" style={{ fontSize: '14px' }}>
                    <ReactMarkdown>{msg.content || '...'}</ReactMarkdown>
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
              <div style={{ background: '#f1f5f9', borderRadius: '14px 14px 14px 4px' }}>
                <TypingDots />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div style={{
          padding: '14px 20px', borderTop: '1px solid #e2e8f0', background: '#fff',
          display: 'flex', gap: '10px', alignItems: 'flex-end'
        }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder={
              !mode ? 'Select a mode first...' :
              streaming ? 'Waiting for response...' :
              'Type your message... (Enter to send, Shift+Enter for newline)'
            }
            disabled={!mode || streaming}
            rows={1}
            style={{
              flex: 1, padding: '12px 14px', borderRadius: '10px', fontSize: '14px',
              border: '1px solid #e2e8f0', resize: 'none', fontFamily: 'inherit',
              outline: 'none', lineHeight: 1.5,
              background: (!mode || streaming) ? '#f8fafc' : '#fff',
              maxHeight: '120px', overflowY: 'auto',
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!mode || streaming || !input.trim()}
            style={{
              padding: '12px 20px', borderRadius: '10px', fontSize: '14px',
              fontWeight: 700, border: 'none', cursor: 'pointer',
              background: (!mode || streaming || !input.trim()) ? '#e2e8f0' : '#6366f1',
              color:      (!mode || streaming || !input.trim()) ? '#94a3b8' : '#fff',
              transition: 'all 0.15s', whiteSpace: 'nowrap',
            }}>
            {streaming ? '...' : 'Send →'}
          </button>
        </div>
      </div>
    </div>
  );
}