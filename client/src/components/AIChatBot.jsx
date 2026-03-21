// src/components/AIChatBot.jsx
import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useStream } from '../hooks/useStream.js';

/* ── Styled components ──────────────────────────────────────────── */
const Fab = styled(motion.button)`
  position: fixed;
  bottom: 28px;
  right: 28px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  color: #fff;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.5);
  z-index: 500;
  cursor: pointer;
  /* No transition on box-shadow — interferes with framer-motion */

  &:hover {
    box-shadow: 0 6px 28px rgba(99, 102, 241, 0.7);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    bottom: 16px;
    right: 16px;
    width: 48px;
    height: 48px;
    font-size: 18px;
  }
`;

const Panel = styled(motion.div)`
  position: fixed;
  bottom: 96px;
  right: 28px;
  width: 360px;
  max-height: 520px;
  background: ${({ theme }) => theme.colors.bgSurface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.xl};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 499;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    right: 16px;
    left: 16px;
    width: auto;
    bottom: 80px;
  }
`;

const PanelHeader = styled.div`
  padding: 14px 18px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1));
  flex-shrink: 0;
`;

const HeaderTitle = styled.div`
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const HeaderBadge = styled.span`
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 20px;
  background: ${({ theme }) => theme.colors.accentBg};
  color: ${({ theme }) => theme.colors.accent};
  font-weight: 600;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 16px;
  padding: 4px;
  cursor: pointer;
  border-radius: 4px;
  line-height: 1;
  transition: color 0.15s;
  &:hover { color: ${({ theme }) => theme.colors.textPrimary}; }
`;

const Messages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Bubble = styled(motion.div)`
  padding: 10px 14px;
  border-radius: ${({ $isUser }) => ($isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px')};
  background: ${({ $isUser, theme }) => ($isUser ? theme.colors.accent : theme.colors.bgRaised)};
  color: ${({ $isUser, theme }) => ($isUser ? '#fff' : theme.colors.textPrimary)};
  font-size: 13px;
  line-height: 1.55;
  max-width: 85%;
  align-self: ${({ $isUser }) => ($isUser ? 'flex-end' : 'flex-start')};
  border: ${({ $isUser, theme }) => ($isUser ? 'none' : `1px solid ${theme.colors.border}`)};
`;

const TypingDots = styled.div`
  display: flex;
  gap: 4px;
  padding: 10px 14px;
  align-self: flex-start;
  background: ${({ theme }) => theme.colors.bgRaised};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px 14px 14px 4px;
`;

const Dot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.textMuted};
  display: inline-block;
  animation: bounce 1.2s infinite;
  animation-delay: ${({ $i }) => $i * 0.2}s;

  @keyframes bounce {
    0%, 60%, 100% { transform: translateY(0); }
    30%           { transform: translateY(-5px); }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 24px 16px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 13px;
`;

const Suggestions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
  justify-content: center;
`;

const SugBtn = styled.button`
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bgRaised};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    border-color: ${({ theme }) => theme.colors.accentBorder};
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const InputRow = styled.div`
  padding: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  gap: 8px;
  flex-shrink: 0;
`;

const BotInput = styled.input`
  flex: 1;
  background: ${({ theme }) => theme.colors.bgRaised};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 9px 12px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textPrimary};
  outline: none;
  font-family: inherit;
  &:focus { border-color: ${({ theme }) => theme.colors.accentBorder}; }
  &::placeholder { color: ${({ theme }) => theme.colors.textMuted}; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const SendBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.accent};
  border: none;
  color: #fff;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  transition: background 0.15s;
  &:hover:not(:disabled) { background: ${({ theme }) => theme.colors.accentHover}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

/* ── Data ─────────────────────────────────────────────────────── */
const SUGGESTIONS = [
  'Explain Two Sum',
  'What is O(n log n)?',
  'Explain closures',
  'What is a hash map?',
  'Binary search steps',
];

/* ── Component ────────────────────────────────────────────────── */
const AIChatBot = () => {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const bottomRef = useRef(null);

  const { streaming, typing, startStream, cancelStream } = useStream();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => () => cancelStream(), [cancelStream]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || streaming) return;
    setInput('');

    const userMsg = { role: 'user', content: msg };
    const history = [...messages, userMsg];
    const aiIdx   = history.length;

    setMessages([...history, { role: 'assistant', content: '' }]);

    await startStream(
      '/api/chat/stream',
      { messages: history, mode: 'general' },
      (fullContent) => {
        setMessages(prev => {
          const updated = [...prev];
          updated[aiIdx] = { role: 'assistant', content: fullContent };
          return updated;
        });
      },
      {
        onError: (err) => {
          setMessages(prev => {
            const updated = [...prev];
            updated[aiIdx] = {
              role: 'assistant',
              content: `❌ ${err}. Try asking on the full Chat page for a deeper session.`,
            };
            return updated;
          });
        },
      },
    );
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <Panel
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            <PanelHeader>
              <HeaderTitle>
                🤖 AlgoSensei Bot
                <HeaderBadge>AI</HeaderBadge>
              </HeaderTitle>
              <CloseBtn onClick={() => setOpen(false)} aria-label="Close">✕</CloseBtn>
            </PanelHeader>

            <Messages>
              {messages.length === 0 ? (
                <EmptyState>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>👋</div>
                  <div style={{ fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>
                    Hi! Ask me anything about DSA or interviews.
                  </div>
                  <div>Quick questions only — for deep dives, use the Chat page.</div>
                  <Suggestions>
                    {SUGGESTIONS.map(s => (
                      <SugBtn key={s} onClick={() => sendMessage(s)}>{s}</SugBtn>
                    ))}
                  </Suggestions>
                </EmptyState>
              ) : (
                messages.map((m, i) => (
                  <Bubble
                    key={i}
                    $isUser={m.role === 'user'}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    {m.role === 'assistant' ? (
                      <div className="markdown-body">
                        <ReactMarkdown>
                          {m.content || (streaming && i === messages.length - 1 ? '▋' : '…')}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      m.content
                    )}
                  </Bubble>
                ))
              )}

              {typing && (
                <TypingDots>
                  <Dot $i={0} /><Dot $i={1} /><Dot $i={2} />
                </TypingDots>
              )}

              <div ref={bottomRef} />
            </Messages>

            <InputRow>
              <BotInput
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={streaming ? 'Waiting...' : 'Ask a quick question…'}
                disabled={streaming}
                autoFocus
              />
              <SendBtn onClick={() => sendMessage()} disabled={!input.trim() || streaming}>
                {streaming ? '⏳' : '→'}
              </SendBtn>
            </InputRow>
          </Panel>
        )}
      </AnimatePresence>

    
      <Fab
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        animate={{ rotate: open ? 45 : 0 }}
        transition={{ duration: 0.2 }}
        title={open ? 'Close assistant' : 'Quick AI answers — DSA, system design, interviews'}
        aria-label={open ? 'Close AI assistant' : 'Open AI assistant'}
      >
        {open ? '✕' : '🤖'}
      </Fab>
    </>
  );
};

export default AIChatBot;