// client/src/components/ExplainModal.jsx
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { apiFetch } from '../lib/api.js';

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  backdrop-filter: blur(6px);

  @media (max-width: 600px) {
    padding: 0;
    align-items: flex-end;
  }
`;

const Modal = styled(motion.div)`
  background: ${({ theme }) => theme.colors.bgSurface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.xl};

  /* FIX: constrain to viewport width so it never causes horizontal scroll */
  width: min(680px, 95vw);
  max-height: min(88vh, 720px);

  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: ${({ theme }) => theme.shadows.lg};

  @media (max-width: 600px) {
    width: 100vw;
    max-height: 92vh;
    border-radius: ${({ theme }) => theme.radius.lg} ${({ theme }) => theme.radius.lg} 0 0;
    border-bottom: none;
  }
`;

const Header = styled.div`
  padding: 18px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  flex-shrink: 0;
`;

const HeaderLeft = styled.div`
  flex: 1;
  min-width: 0; /* allow text truncation */
`;

const CategoryLabel = styled.div`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
  color: ${({ theme }) => theme.colors.accent};
  margin-bottom: 4px;
`;

const QuestionText = styled.div`
  font-size: 14px;
  font-weight: 600;
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.textPrimary};
  /* FIX: allow long words to wrap instead of overflowing */
  word-wrap: break-word;
  overflow-wrap: break-word;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;
  flex-shrink: 0;
  padding: 2px 4px;
  line-height: 1;
  border-radius: 4px;
  transition: all 0.15s;
  &:hover { color: ${({ theme }) => theme.colors.textPrimary}; background: ${({ theme }) => theme.colors.bgHover}; }
`;

const TabBar = styled.div`
  display: flex;
  gap: 2px;
  padding: 8px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bgRaised};
  overflow-x: auto;
  flex-shrink: 0;
  /* FIX: hide scrollbar on tab row — tabs are short so it's fine */
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const Tab = styled.button`
  padding: 6px 13px;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: none;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  background: ${({ $active, theme }) => $active ? theme.colors.accentBg : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.accent : theme.colors.textSecondary};
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.accentBorder : 'transparent'};
  transition: all 0.15s;
  &:hover { color: ${({ theme }) => theme.colors.textPrimary}; }
`;

const Body = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden; /* FIX: no horizontal scroll inside body */
  padding: 18px 20px;
  /* FIX: all content inside body wraps properly */
  word-wrap: break-word;
  overflow-wrap: break-word;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 48px;
  color: ${({ theme }) => theme.colors.accent};
`;

const AnalogyBox = styled.div`
  margin-top: 18px;
  padding: 14px 16px;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.greenBg};
  border: 1px solid ${({ theme }) => theme.colors.greenBorder};
`;

const FollowUpItem = styled.div`
  padding: 11px 14px;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bgRaised};
  font-size: 13px;
  line-height: 1.55;
  margin-bottom: 8px;
  display: flex;
  gap: 10px;
  color: ${({ theme }) => theme.colors.textPrimary};
  word-wrap: break-word;
  overflow-wrap: break-word;
`;

const ModalFooter = styled.div`
  padding: 12px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
`;

const CloseFooterBtn = styled.button`
  padding: 8px 18px;
  border-radius: ${({ theme }) => theme.radius.sm};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  background: ${({ theme }) => theme.colors.bgHover};
  color: ${({ theme }) => theme.colors.textPrimary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: all 0.15s;
  &:hover { background: ${({ theme }) => theme.colors.bgActive}; }
`;

const TABS = ['Quick Answer', 'Deep Dive', 'Follow-ups', 'Avoid Saying'];

const ExplainModal = ({ question, category, onClose }) => {
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => document.body.classList.remove('modal-open');
  }, []);

  useEffect(() => {
    setLoading(true); setError('');
    apiFetch('/api/tech/explain', {
      method: 'POST',
      body: JSON.stringify({ question, category }),
    })
      .then(d => { setData(d); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [question, category]);

  return (
    <Overlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <Modal
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        exit={{    opacity: 0, y: 28, scale: 0.97 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
      >
        <Header>
          <HeaderLeft>
            <CategoryLabel>{category?.toUpperCase()}</CategoryLabel>
            <QuestionText>{question}</QuestionText>
          </HeaderLeft>
          <CloseBtn onClick={onClose} aria-label="Close">✕</CloseBtn>
        </Header>

        <TabBar>
          {TABS.map((tab, i) => (
            <Tab key={tab} $active={activeTab === i} onClick={() => setActiveTab(i)}>
              {tab}
            </Tab>
          ))}
        </TabBar>

        <Body>
          {loading && (
            <LoadingState>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ fontSize: '28px', marginBottom: '12px' }}>⚡</motion.div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Groq is thinking...</div>
            </LoadingState>
          )}

          {error && (
            <div style={{ color: 'var(--red)', padding: '16px', background: 'var(--red-bg)', borderRadius: '8px', fontSize: '13px' }}>
              ❌ {error}
            </div>
          )}

          {data && !loading && (
            <>
              {activeTab === 0 && (
                <p style={{ fontSize: '14px', lineHeight: 1.75, color: 'var(--text-primary)' }}>
                  {data.quickAnswer}
                </p>
              )}

              {activeTab === 1 && (
                <div className="markdown-body" style={{ fontSize: '13px', lineHeight: 1.8 }}>
                  <ReactMarkdown>{data.deepDive}</ReactMarkdown>
                </div>
              )}

              {activeTab === 2 && data.followUps?.map((q, i) => (
                <FollowUpItem key={i}>
                  <span style={{ color: 'var(--accent)', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                  {q}
                </FollowUpItem>
              ))}

              {activeTab === 3 && (
                <p style={{
                  fontSize: '13px', lineHeight: 1.75,
                  padding: '14px 16px',
                  background: 'var(--amber-bg)',
                  border: '1px solid var(--amber-border)',
                  borderRadius: '8px',
                }}>
                  ⚠️ {data.avoidSaying}
                </p>
              )}

              {data.analogy && (
                <AnalogyBox>
                  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', color: 'var(--green)', marginBottom: '6px' }}>
                    💡 ANALOGY
                  </div>
                  <p style={{ fontSize: '13px', lineHeight: 1.6, margin: 0, color: 'var(--text-secondary)' }}>
                    {data.analogy}
                  </p>
                </AnalogyBox>
              )}
            </>
          )}
        </Body>

        <ModalFooter>
          <CloseFooterBtn onClick={onClose}>Close</CloseFooterBtn>
        </ModalFooter>
      </Modal>
    </Overlay>
  );
};

export default ExplainModal;