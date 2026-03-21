// client/src/pages/Chat.jsx

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import CodeBlock from '../components/CodeBlock';
import { apiFetch } from '../lib/api';
import { useStream } from '../hooks/useStream';

/* ── Layout ─────────────────────────────────────────────── */
const Layout = styled.div`
  display: flex;
  height: calc(100vh - 57px) /* navbar + footer */
  overflow: hidden;
  background: ${({ theme }) => theme.colors.bg};

  @media (max-width: 768px) {
    height: calc(100vh - 57px);   /* no footer on mobile chat */
    flex-direction: column;
  }
`;
const Sidebar = styled.aside`
  width: 270px; flex-shrink: 0;
  border-right: 1px solid ${({ theme }) => theme.colors.borderLight};
  background: ${({ theme }) => theme.colors.bgRaised};
  overflow-y: auto; padding: 16px;
  display: flex; flex-direction: column; gap: 12px;
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) { display: none; }
`;
const ChatArea = styled.div`flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0;`;
const ChatHeader = styled.div`
  padding: 12px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  background: ${({ theme }) => theme.colors.bgRaised};
  display: flex; align-items: center; gap: 12px; min-height: 52px; flex-wrap: wrap;
`;
const HeaderMode = styled.span`font-size: 14px; font-weight: 700; color: ${({ theme }) => theme.colors.accent};`;
const HeaderDesc = styled.span`font-size: 12px; color: ${({ theme }) => theme.colors.textMuted};`;
const HeaderActions = styled.div`margin-left: auto; display: flex; gap: 8px;`;
const NewChatBtn = styled.button`
  font-size: 12px; padding: 6px 12px;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent; color: ${({ theme }) => theme.colors.textSecondary}; cursor: pointer;
  transition: all 0.15s;
  &:hover { background: ${({ theme }) => theme.colors.bgHover}; color: ${({ theme }) => theme.colors.textPrimary}; }
`;
const MessagesArea = styled.div`
  flex: 1; overflow-y: auto; padding: 24px 20px;
  display: flex; flex-direction: column; gap: 16px;
`;
const EmptyState = styled(motion.div)`
  flex: 1; display: flex; flex-direction: column; align-items: center;
  justify-content: center; text-align: center; padding: 48px 24px;
  color: ${({ theme }) => theme.colors.textMuted}; gap: 12px;
`;
const EmptyIcon  = styled.div`font-size: 40px;`;
const EmptyTitle = styled.div`font-size: 16px; font-weight: 600; color: ${({ theme }) => theme.colors.textSecondary};`;
const EmptyDesc  = styled.div`font-size: 13px; max-width: 300px; line-height: 1.6;`;
const MessageRow = styled(motion.div)`display: flex; justify-content: ${({ $isUser }) => $isUser ? 'flex-end' : 'flex-start'};`;
const Bubble = styled.div`
  max-width: 72%; padding: 12px 16px; font-size: 14px; line-height: 1.65;
  border-radius: ${({ $isUser, theme }) => $isUser
    ? `${theme.radius.lg} ${theme.radius.lg} 4px ${theme.radius.lg}`
    : `${theme.radius.lg} ${theme.radius.lg} ${theme.radius.lg} 4px`};
  background: ${({ $isUser, theme }) => $isUser ? theme.colors.accent : theme.colors.bgSurface};
  color: ${({ $isUser, theme }) => $isUser ? '#fff' : theme.colors.textPrimary};
  border: ${({ $isUser, theme }) => $isUser ? 'none' : `1px solid ${theme.colors.borderLight}`};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) { max-width: 90%; }
`;
const TypingRow    = styled.div`display: flex; justify-content: flex-start;`;
const TypingBubble = styled.div`
  padding: 14px 18px;
  border-radius: ${({ theme }) => `${theme.radius.lg} ${theme.radius.lg} ${theme.radius.lg} 4px`};
  background: ${({ theme }) => theme.colors.bgSurface};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  display: flex; gap: 5px; align-items: center;
`;
const Dot = styled.span`
  width: 7px; height: 7px; border-radius: 50%;
  background: ${({ theme }) => theme.colors.textMuted}; display: inline-block;
  animation: bounce 1.2s infinite; animation-delay: ${({ $i }) => $i * 0.2}s;
  @keyframes bounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
`;
// Fix #10: renamed from "token counter" — it was counting SSE chunks, not tokens
const SessionInfo = styled.div`
  font-size: 11px; color: ${({ theme }) => theme.colors.textMuted};
  font-family: ${({ theme }) => theme.fonts.mono};
  padding: 4px 20px 2px; border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
`;
const InputArea = styled.div`
  padding: 16px 20px; border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
  background: ${({ theme }) => theme.colors.bgRaised}; display: flex; gap: 10px; align-items: flex-end;
`;
const TextArea = styled.textarea`
  flex: 1; padding: 12px 14px; border-radius: ${({ theme }) => theme.radius.md};
  font-size: 14px; border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bgSurface}; color: ${({ theme }) => theme.colors.textPrimary};
  resize: none; font-family: ${({ theme }) => theme.fonts.sans}; outline: none;
  line-height: 1.5; max-height: 120px; overflow-y: auto;
  transition: border-color 0.15s;
  &:focus { border-color: ${({ theme }) => theme.colors.accent}; }
  &::placeholder { color: ${({ theme }) => theme.colors.textMuted}; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;
const SendBtn = styled.button`
  padding: 12px 20px; border-radius: ${({ theme }) => theme.radius.md};
  font-size: 14px; font-weight: 700; white-space: nowrap; transition: all 0.15s;
  background: ${({ $active, theme }) => $active ? theme.colors.accent : theme.colors.bgSurface};
  color: ${({ $active, theme }) => $active ? '#fff' : theme.colors.textMuted};
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.accent : theme.colors.border};
  cursor: ${({ $active }) => $active ? 'pointer' : 'not-allowed'};
  &:active:not(:disabled) { transform: scale(0.97); }
  &:hover:not(:disabled) { background: ${({ $active, theme }) => $active ? theme.colors.accentHover : theme.colors.bgHover}; }
`;

/* Sidebar sub-components */
const ContextCard  = styled.div`
  background: ${({ theme }) => theme.colors.bgSurface};
  border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: ${({ theme }) => theme.radius.md}; padding: 14px;
`;
const SectionLabel = styled.div`
  font-size: 10px; font-weight: 700; letter-spacing: 2px;
  color: ${({ theme }) => theme.colors.textMuted}; text-transform: uppercase; margin-bottom: 8px;
`;
const ModeBtn = styled.button`
  width: 100%; text-align: left; padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.accentBorder : theme.colors.border};
  background: ${({ $active, theme }) => $active ? theme.colors.accentBg : theme.colors.bgSurface};
  transition: all 0.15s; cursor: pointer;
  &:hover:not(:disabled) { background: ${({ $active, theme }) => $active ? theme.colors.accentBg : theme.colors.bgHover}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;
const ModeBtnLabel = styled.div`font-size: 13px; font-weight: 600; color: ${({ theme }) => theme.colors.textPrimary};`;
const ModeBtnDesc  = styled.div`font-size: 11px; color: ${({ theme }) => theme.colors.textMuted}; margin-top: 2px;`;
const SaveActionsBox = styled.div`margin-top: 16px; display: flex; flex-direction: column; gap: 6px;`;
const SaveBtn = styled.button`
  width: 100%; padding: 10px; border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid ${({ $success, theme }) => $success ? theme.colors.greenBorder : theme.colors.border};
  background: ${({ $success, theme }) => $success ? theme.colors.greenBg : theme.colors.bgSurface};
  color: ${({ $success, theme }) => $success ? theme.colors.green : theme.colors.textSecondary};
  font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s;
  &:hover { opacity: 0.85; }
`;
const SavedBadge = styled.div`
  margin-top: 12px; padding: 10px; border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme }) => theme.colors.greenBg}; color: ${({ theme }) => theme.colors.green};
  font-size: 13px; font-weight: 600; text-align: center;
  border: 1px solid ${({ theme }) => theme.colors.greenBorder};
`;

const MODES_CONFIG = {
  dsa_hint:        { label: '💡 Hint',      desc: 'Socratic hints only — no code given',     needs: 'dsa'  },
  dsa_reveal:      { label: '🔓 Reveal',     desc: '3 solutions with complexity analysis',     needs: 'dsa'  },
  tech_explain:    { label: '📖 Explain',    desc: 'Deep explanation with analogy',            needs: 'tech' },
  mock_dsa:        { label: '🎤 Mock DSA',   desc: 'Live coding interview simulation',         needs: 'any'  },
  mock_tech:       { label: '🎤 Mock Tech',  desc: 'Technical concepts interview',            needs: 'any'  },
  mock_behavioral: { label: '🎤 Behavioral', desc: 'Behavioral interview simulation',          needs: 'any'  },
};

const EMPTY_DESCS = {
  dsa_hint:        "Describe your current approach and I'll guide you with Socratic questions.",
  dsa_reveal:      'Type "show me the solution" to get all 3 approaches with complexity.',
  tech_explain:    'Ask me anything about this topic or type "explain it".',
  mock_dsa:        'Type "start interview" to begin your mock DSA session.',
  mock_tech:       'Type "start interview" to begin your mock tech interview.',
  mock_behavioral: 'Type "start interview" to begin your behavioral mock.',
};

const markdownComponents = {
  pre({ children }) { return <>{children}</>; },
  code({ className, children }) {
    const match = /language-(\w+)/.exec(className || '');
    return match
      ? <CodeBlock language={match[1]}>{String(children).replace(/\n$/, '')}</CodeBlock>
      : <code className={className}>{children}</code>;
  },
};

const Chat = () => {
  const [searchParams] = useSearchParams();
  const problemId = searchParams.get('problemId');
  const techId    = searchParams.get('techQuestionId');

  const [context,      setContext]      = useState(null);
  const [mode,         setMode]         = useState('');
  const [messages,     setMessages]     = useState([]);
  const [input,        setInput]        = useState('');
  const [sessionSaved, setSessionSaved] = useState(false);
  // Fix #10: count actual AI messages, not SSE chunks
  const [aiMsgCount,   setAiMsgCount]   = useState(0);

  const bottomRef        = useRef(null);
  const shouldAutoScroll = useRef(true);
  const { streaming, typing, startStream, cancelStream } = useStream();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const params = new URLSearchParams();
    if (problemId) params.set('problemId', problemId);
    if (techId)    params.set('techQuestionId', techId);
    apiFetch(`/api/chat/context?${params}`)
      .then(data => {
        setContext(data);
        if (data.type === 'dsa')  setMode('dsa_hint');
        if (data.type === 'tech') setMode('tech_explain');
        if (data.type === 'mock') setMode('mock_dsa');
      })
      .catch(console.error);
  }, [problemId, techId]);

  useEffect(() => {
    if (shouldAutoScroll.current) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => () => cancelStream(), [cancelStream]);

  const sendMessage = async (userText) => {
    if (!userText.trim() || streaming) return;
    const token = localStorage.getItem('token');
    if (!token) { alert('Please log in first'); return; }

    const userMsg    = { role: 'user', content: userText };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    shouldAutoScroll.current = true;

    const aiMsgIndex = newMessages.length;
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      await startStream(
        '/api/chat/stream',
        { messages: newMessages, mode, problemId: problemId || undefined, techQuestionId: techId || undefined },
        (fullContent) => {
          setMessages(prev => {
            const updated = [...prev];
            updated[aiMsgIndex] = { role: 'assistant', content: fullContent };
            return updated;
          });
        },
      );
      setAiMsgCount(c => c + 1); // Fix #10: increment after full message, not per chunk
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        updated[aiMsgIndex] = { role: 'assistant', content: `❌ Error: ${err.message}. Please try again.` };
        return updated;
      });
    }
  };

  const saveSession = async (solved) => {
    const token = localStorage.getItem('token');
    if (!token || messages.length === 0) return;
    try {
      await apiFetch('/api/sessions', {
        method: 'POST',
        body:   JSON.stringify({ problemId, messages, mode, solved }),
      });
      setSessionSaved(true);
    } catch (err) { console.error('Save session error:', err); }
  };

  const switchMode = (newMode) => {
    if (streaming) return;
    setMode(newMode); setMessages([]); setSessionSaved(false); setAiMsgCount(0);
  };

  const newChat = () => {
    if (streaming) return;
    setMessages([]); setSessionSaved(false); setAiMsgCount(0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const visibleModes = Object.entries(MODES_CONFIG).filter(([, cfg]) => {
    if (!context) return cfg.needs === 'any';
    if (cfg.needs === 'any') return true;
    return cfg.needs === context.type;
  });

  const canSend = !!mode && !streaming && !!input.trim();

  return (
    <Layout className='chat-layout'>
      {/* ── Sidebar ── */}
      <Sidebar>
        {context?.data && (
          <ContextCard>
            <SectionLabel>{context.type === 'dsa' ? 'DSA PROBLEM' : 'TECH QUESTION'}</SectionLabel>
            {context.type === 'dsa' && (
              <>
                <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  #{context.data.leetcodeNum} {context.data.title}
                </div>
                <span style={{
                  fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: 600,
                  background: context.data.difficulty === 'Easy' ? 'var(--green-bg)' : context.data.difficulty === 'Hard' ? 'var(--red-bg)' : 'var(--amber-bg)',
                  color:      context.data.difficulty === 'Easy' ? 'var(--green)'    : context.data.difficulty === 'Hard' ? 'var(--red)'    : 'var(--amber)',
                }}>
                  {context.data.difficulty}
                </span>
                <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {context.data.topics?.map(t => (
                    <span key={t} style={{ fontSize: '11px', padding: '2px 7px', borderRadius: '4px', background: 'var(--accent-bg)', color: 'var(--accent)' }}>{t}</span>
                  ))}
                </div>
              </>
            )}
            {context.type === 'tech' && (
              <div style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                {context.data.question}
              </div>
            )}
          </ContextCard>
        )}

        <div>
          <SectionLabel>MODE</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {visibleModes.map(([key, cfg]) => (
              <ModeBtn key={key} $active={mode === key} onClick={() => switchMode(key)} disabled={streaming}>
                <ModeBtnLabel>{cfg.label}</ModeBtnLabel>
                <ModeBtnDesc>{cfg.desc}</ModeBtnDesc>
              </ModeBtn>
            ))}
          </div>
        </div>

        {messages.length > 1 && !sessionSaved && context?.type === 'dsa' && (
          <SaveActionsBox>
            <SectionLabel>MARK SESSION</SectionLabel>
            <SaveBtn $success onClick={() => saveSession(true)}>✓ Solved it!</SaveBtn>
            <SaveBtn onClick={() => saveSession(false)}>Save & come back later</SaveBtn>
          </SaveActionsBox>
        )}
        {sessionSaved && <SavedBadge>✓ Session saved!</SavedBadge>}
      </Sidebar>

      {/* ── Chat Area ── */}
      <ChatArea className='chat-messages'>
        <ChatHeader>
          {mode && MODES_CONFIG[mode] ? (
            <>
              <HeaderMode>{MODES_CONFIG[mode].label}</HeaderMode>
              <HeaderDesc>{MODES_CONFIG[mode].desc}</HeaderDesc>
            </>
          ) : (
            <HeaderDesc>Select a mode on the left to start</HeaderDesc>
          )}
          <HeaderActions>
            {messages.length > 0 && <NewChatBtn onClick={newChat}>+ New Chat</NewChatBtn>}
          </HeaderActions>
        </ChatHeader>

        <MessagesArea>
          {messages.length === 0 && mode && (
            <EmptyState initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <EmptyIcon>🥋</EmptyIcon>
              <EmptyTitle>{MODES_CONFIG[mode]?.label} mode ready</EmptyTitle>
              <EmptyDesc>{EMPTY_DESCS[mode]}</EmptyDesc>
            </EmptyState>
          )}

          {messages.map((msg, i) => (
            <MessageRow key={i} $isUser={msg.role === 'user'} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              <Bubble $isUser={msg.role === 'user'}>
                {msg.role === 'assistant' ? (
                  <div className="markdown-body">
                    <ReactMarkdown components={markdownComponents}>
                      {msg.content || '...'}
                    </ReactMarkdown>
                  </div>
                ) : <span>{msg.content}</span>}
              </Bubble>
            </MessageRow>
          ))}

          {typing && (
            <TypingRow>
              <TypingBubble><Dot $i={0} /><Dot $i={1} /><Dot $i={2} /></TypingBubble>
            </TypingRow>
          )}
          <div ref={bottomRef} />
        </MessagesArea>

        {/* Fix #10: accurate label — counts completed AI replies, not SSE chunks */}
        {aiMsgCount > 0 && (
          <SessionInfo>{aiMsgCount} AI message{aiMsgCount !== 1 ? 's' : ''} this session</SessionInfo>
        )}

        <InputArea>
          <TextArea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={!mode ? 'Select a mode first…' : streaming ? 'Waiting for response…' : 'Type your message… (Enter to send, Shift+Enter for newline)'}
            disabled={!mode || streaming}
            rows={1}
          />
          <SendBtn $active={canSend} onClick={() => sendMessage(input)} disabled={!canSend}>
            {streaming ? '…' : 'Send →'}
          </SendBtn>
        </InputArea>
      </ChatArea>
    </Layout>
  );
};

export default Chat;