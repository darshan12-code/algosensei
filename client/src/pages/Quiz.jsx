import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../lib/api.js';
import SkeletonLoader from '../components/SkeletonLoader.jsx';

const Page = styled.div`
  max-width: 660px;
  margin: 0 auto;
  padding: 32px 16px 80px
`;

const SetupGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
  margin-bottom: 24px;
`;

const TopicCard = styled(motion.button)`
  padding: 14px 12px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.accentBorder : theme.colors.border};
  background: ${({ $active, theme }) => $active ? theme.colors.accentBg : theme.colors.bgSurface};
  color: ${({ $active, theme }) => $active ? theme.colors.accent : theme.colors.textSecondary};
  font-size: 13px;
  font-weight: ${({ $active }) => $active ? 700 : 400};
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;

  &:hover { border-color: ${({ theme }) => theme.colors.accentBorder}; }
`;

const QuestionCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.bgSurface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: 24px;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.6;
`;

const OptionBtn = styled(motion.button)`
  width: 100%;
  text-align: left;
  padding: 14px 16px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ $state, theme }) =>
    $state === 'correct' ? theme.colors.greenBorder :
    $state === 'wrong'   ? theme.colors.redBorder :
    $state === 'selected' ? theme.colors.accentBorder : theme.colors.border};
  background: ${({ $state, theme }) =>
    $state === 'correct' ? theme.colors.greenBg :
    $state === 'wrong'   ? theme.colors.redBg :
    $state === 'selected' ? theme.colors.accentBg : theme.colors.bgSurface};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  font-weight: 500;
  cursor: ${({ disabled }) => disabled ? 'default' : 'pointer'};
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  transition: all 0.15s;

  &:hover:not(:disabled) { border-color: ${({ theme }) => theme.colors.accentBorder}; }
`;

const TimerBadge = styled(motion.div)`
  font-size: 18px;
  font-weight: 800;
  padding: 6px 16px;
  border-radius: 20px;
  border: 2px solid ${({ $color }) => $color};
  color: ${({ $color }) => $color};
  background: ${({ $color }) => $color}18;
  min-width: 64px;
  text-align: center;
`;

const ProgressBar = styled.div`
  height: 4px;
  background: ${({ theme }) => theme.colors.bgHover};
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 20px;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.accent};
`;

const ScoreRing = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ScoreLabel = styled.div`
  position: absolute;
  font-size: 28px;
  font-weight: 800;
  color: ${({ $color }) => $color};
`;

const ExplanationBox = styled(motion.div)`
  padding: 14px 16px;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ $correct, theme }) => $correct ? theme.colors.greenBg : theme.colors.redBg};
  border: 1px solid ${({ $correct, theme }) => $correct ? theme.colors.greenBorder : theme.colors.redBorder};
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 8px;
`;

const Btn = styled.button`
  padding: 12px 24px;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  background: ${({ $primary, theme }) => $primary ? theme.colors.accent : theme.colors.bgSurface};
  color: ${({ $primary }) => $primary ? '#fff' : 'inherit'};
  border: 1px solid ${({ $primary, theme }) => $primary ? 'transparent' : theme.colors.border};

  &:hover { opacity: 0.85; transform: translateY(-1px); }
`;

const TIMER_SECONDS = 30;
const TOPICS = {
  dsa:  ['Array', 'HashMap', 'Two Pointers', 'Sliding Window', 'Stack', 'Binary Search', 'LinkedList', 'Tree'],
  tech: ['JavaScript', 'React', 'Node.js', 'Backend', 'System Design', 'CS Fundamentals', 'Behavioral'],
};

export default function Quiz() {
  const navigate = useNavigate();
  const [screen, setScreen]     = useState('setup');
  const [type, setType]         = useState('dsa');
  const [topic, setTopic]       = useState(TOPICS.dsa[0]);
  const [questions, setQuestions] = useState([]);
  const [qIdx, setQIdx]         = useState(0);
  const [answers, setAnswers]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [error, setError]       = useState('');
  const timerRef = useRef(null);

  const currentQ = questions[qIdx];
  const score = answers.filter(a => a.correct).length;

  useEffect(() => {
    if (screen !== 'quiz' || revealed) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); submitAnswer(null); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [screen, qIdx, revealed]);

  const startQuiz = async () => {
    setError(''); setScreen('loading');
    try {
      const data = await apiFetch('/api/quiz/generate', { method: 'POST', body: JSON.stringify({ topic, type }) });
      setQuestions(data.questions);
      setQIdx(0); setAnswers([]); setTimeLeft(TIMER_SECONDS);
      setSelected(null); setRevealed(false); setScreen('quiz');
    } catch (err) { setError(err.message); setScreen('setup'); }
  };

  const submitAnswer = async (optionIdx) => {
    if (revealed) return;
    clearInterval(timerRef.current);
    const correct = optionIdx === currentQ?.correct;
    setSelected(optionIdx); setRevealed(true);
    const newAnswers = [...answers, { qIdx, selected: optionIdx, correct }];
    setAnswers(newAnswers);

    setTimeout(() => {
      if (qIdx < questions.length - 1) {
        setQIdx(q => q + 1); setSelected(null); setRevealed(false); setTimeLeft(TIMER_SECONDS);
      } else { finishQuiz(newAnswers); }
    }, 2500);
  };

  const finishQuiz = async (finalAnswers) => {
    const finalScore = Math.round((finalAnswers.filter(a => a.correct).length / questions.length) * 100);
    try {
      await apiFetch('/api/quiz/complete', {
        method: 'POST',
        body: JSON.stringify({
          topic, type, score: finalScore,
          questions: finalAnswers.map((a, i) => ({ question: questions[i]?.question, userAnswer: questions[i]?.options[a.selected] || 'Timed out', correct: a.correct })),
          answers: finalAnswers,
        }),
      });
    } catch { /* non-blocking */ }
    setScreen('result');
  };

  const timerColor = timeLeft > 15 ? '#22c55e' : timeLeft > 7 ? '#f59e0b' : '#ef4444';

  if (screen === 'setup') return (
    <Page>
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>
        📝 Quiz Mode
      </motion.h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '14px' }}>
        5 AI-generated questions · 30s per question · scored instantly
      </p>
      {error && <div style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', background: 'var(--red-bg)', border: '1px solid var(--red-border)', fontSize: '13px', color: 'var(--red)' }}>❌ {error}</div>}

      <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '8px' }}>QUIZ TYPE</div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['dsa', 'tech'].map(t => (
          <Btn key={t} $primary={type === t} onClick={() => { setType(t); setTopic(TOPICS[t][0]); }}>
            {t === 'dsa' ? '💻 DSA' : '🎯 Tech'}
          </Btn>
        ))}
      </div>

      <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '8px' }}>TOPIC</div>
      <SetupGrid>
        {TOPICS[type].map(t => (
          <TopicCard key={t} $active={topic === t} onClick={() => setTopic(t)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            {t}
          </TopicCard>
        ))}
      </SetupGrid>

      <Btn $primary onClick={startQuiz} style={{ width: '100%', padding: '14px', fontSize: '15px', justifyContent: 'center' }}>
        Start Quiz — {topic} →
      </Btn>
    </Page>
  );

  if (screen === 'loading') return (
    <Page style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ fontSize: '32px', marginBottom: '16px' }}>⚡</motion.div>
      <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '24px' }}>Generating {topic} quiz...</div>
      <SkeletonLoader count={3} />
    </Page>
  );

  if (screen === 'result') {
    const pct = Math.round((score / questions.length) * 100);
    const ringColor = pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444';
    const c = 2 * Math.PI * 45;
    return (
      <Page>
        <ScoreRing>
          <svg width="120" height="120" viewBox="0 0 100 100" style={{ position: 'absolute' }}>
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
            <motion.circle
              cx="50" cy="50" r="45" fill="none" stroke={ringColor} strokeWidth="8"
              strokeLinecap="round" strokeDasharray={c}
              initial={{ strokeDashoffset: c }}
              animate={{ strokeDashoffset: c - (pct / 100) * c }}
              transition={{ duration: 1.2, ease: [0.16,1,0.3,1] }}
              style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
            />
          </svg>
          <ScoreLabel $color={ringColor}>{pct}%</ScoreLabel>
        </ScoreRing>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            {pct >= 80 ? 'Excellent! 🎉' : pct >= 60 ? 'Good job 👍' : 'Keep grinding 💪'}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{score}/{questions.length} correct · {topic}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          {questions.map((q, i) => {
            const ans = answers[i];
            return (
              <div key={i} style={{ padding: '14px 16px', borderRadius: '10px', border: `1px solid ${ans?.correct ? '#22c55e44' : '#ef444444'}`, background: ans?.correct ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', fontSize: '13px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                  <span>{ans?.correct ? '✅' : '❌'}</span>
                  <span style={{ fontWeight: 600, lineHeight: 1.5 }}>{q.question}</span>
                </div>
                <div style={{ color: 'var(--text-secondary)', paddingLeft: '24px' }}>
                  Correct: <b style={{ color: '#22c55e' }}>{q.options[q.correct]}</b>
                  {!ans?.correct && ans?.selected != null && <> · Yours: <b style={{ color: '#ef4444' }}>{q.options[ans.selected]}</b></>}
                  {!ans?.correct && ans?.selected == null && <> · <b style={{ color: '#ef4444' }}>Timed out</b></>}
                </div>
                {q.explanation && <div style={{ color: 'var(--text-muted)', paddingLeft: '24px', marginTop: '4px', fontStyle: 'italic' }}>{q.explanation}</div>}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Btn onClick={() => setScreen('setup')} style={{ flex: 1, justifyContent: 'center' }}>Try Another Topic</Btn>
          <Btn $primary onClick={() => navigate(`/problems?topic=${encodeURIComponent(topic)}`)} style={{ flex: 1, justifyContent: 'center' }}>Practice Weak Topics →</Btn>
        </div>
      </Page>
    );
  }

  // Quiz in progress
  const optionState = (i) => {
    if (revealed && i === currentQ?.correct) return 'correct';
    if (revealed && i === selected && i !== currentQ?.correct) return 'wrong';
    if (!revealed && selected === i) return 'selected';
    return 'default';
  };

  return (
    <Page>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
          Question {qIdx + 1} of {questions.length} · {topic}
        </span>
        <TimerBadge $color={timerColor} animate={timeLeft <= 10 ? { scale: [1, 1.05, 1] } : {}} transition={{ repeat: Infinity, duration: 0.6 }}>
          {timeLeft}s
        </TimerBadge>
      </div>

      <ProgressBar>
        <ProgressFill
          initial={{ width: 0 }}
          animate={{ width: `${(qIdx / questions.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </ProgressBar>

      <AnimatePresence mode="wait">
        <QuestionCard
          key={qIdx}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
        >
          {currentQ?.question}
        </QuestionCard>
      </AnimatePresence>

      {currentQ?.options.map((opt, i) => (
        <OptionBtn
          key={i}
          $state={optionState(i)}
          onClick={() => submitAnswer(i)}
          disabled={revealed}
          whileHover={!revealed ? { scale: 1.01 } : {}}
          whileTap={!revealed ? { scale: 0.99 } : {}}
        >
          <span style={{ fontWeight: 700, color: 'var(--text-muted)', minWidth: '20px' }}>
            {['A', 'B', 'C', 'D'][i]}.
          </span>
          {opt}
          {revealed && i === currentQ.correct && <span style={{ marginLeft: 'auto' }}>✓</span>}
          {revealed && i === selected && i !== currentQ.correct && <span style={{ marginLeft: 'auto' }}>✗</span>}
        </OptionBtn>
      ))}

      <AnimatePresence>
        {revealed && (
          <ExplanationBox
            $correct={answers[answers.length - 1]?.correct}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <b>{answers[answers.length - 1]?.correct ? '✅ Correct! ' : '❌ Wrong. '}</b>
            {currentQ?.explanation}
            <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Auto-advancing in 2.5 seconds...
            </div>
          </ExplanationBox>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '12px' }}>
        {answers.map((a, i) => (
          <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ width: '10px', height: '10px', borderRadius: '50%', background: a.correct ? '#4ade80' : '#f87171' }} />
        ))}
        {Array(questions.length - answers.length).fill(0).map((_, i) => (
          <div key={`e-${i}`} style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
        ))}
      </div>
    </Page>
  );
}