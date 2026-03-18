import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000';
const TIMER_SECONDS = 30;

const TOPICS = {
  dsa:  ['Array', 'HashMap', 'Two Pointers', 'Sliding Window', 'Stack', 'Binary Search', 'LinkedList', 'Tree'],
  tech: ['JavaScript', 'React', 'Node.js', 'Backend', 'System Design', 'CS Fundamentals', 'Behavioral'],
};

export default function Quiz() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Setup state
  const [screen,    setScreen]    = useState('setup');   // setup | loading | quiz | result
  const [topic,     setTopic]     = useState(searchParams.get('topic') || 'HashMap');
  const [type,      setType]      = useState(searchParams.get('type')  || 'dsa');

  // Quiz state
  const [questions, setQuestions] = useState([]);
  const [qIdx,      setQIdx]      = useState(0);
  const [selected,  setSelected]  = useState(null);   // index of chosen option
  const [revealed,  setRevealed]  = useState(false);  // show correct/wrong
  const [answers,   setAnswers]   = useState([]);     // { correct: bool, selected, qIdx }
  const [timeLeft,  setTimeLeft]  = useState(TIMER_SECONDS);
  const [error,     setError]     = useState('');

  const timerRef = useRef(null);

  const currentQ = questions[qIdx];
  const score = answers.filter(a => a.correct).length;

  // ── Timer ──────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== 'quiz' || revealed) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { handleTimeout(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [screen, qIdx, revealed]);

  const handleTimeout = () => {
    clearInterval(timerRef.current);
    // Auto-submit as wrong answer
    submitAnswer(null);
  };

  // ── Generate quiz ──────────────────────────────────────────
  const startQuiz = async () => {
    const token = localStorage.getItem('token');
    if (!token) { alert('Please log in first'); return; }

    setScreen('loading');
    setError('');

    try {
      const res = await fetch(`${API}/api/quiz/generate`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ topic, type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQuestions(data.questions);
      setQIdx(0);
      setAnswers([]);
      setTimeLeft(TIMER_SECONDS);
      setSelected(null);
      setRevealed(false);
      setScreen('quiz');
    } catch (err) {
      setError(err.message);
      setScreen('setup');
    }
  };

  // ── Answer handling ────────────────────────────────────────
  const submitAnswer = async (optionIdx) => {
    if (revealed) return;
    clearInterval(timerRef.current);

    const correct = optionIdx === currentQ.correct;
    setSelected(optionIdx);
    setRevealed(true);

    const newAnswer = { qIdx, selected: optionIdx, correct };
    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);

    // Update weak topic tracker
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API}/api/tracker/update`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ topic, type, failed: !correct }),
      }).catch(console.error);
    }

    // Auto-advance after 2.5 seconds
    setTimeout(() => {
      if (qIdx < questions.length - 1) {
        setQIdx(q => q + 1);
        setSelected(null);
        setRevealed(false);
        setTimeLeft(TIMER_SECONDS);
      } else {
        // Quiz complete — save result
        finishQuiz(newAnswers);
      }
    }, 2500);
  };

  const finishQuiz = async (finalAnswers) => {
    const token = localStorage.getItem('token');
    const finalScore = Math.round(
      (finalAnswers.filter(a => a.correct).length / questions.length) * 100
    );

    if (token) {
      fetch(`${API}/api/quiz/result`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic,
          score: finalScore,
          questions: finalAnswers.map((a, i) => ({
            question: questions[i]?.question,
            userAnswer: questions[i]?.options[a.selected] || 'Timed out',
            correct: a.correct,
          })),
        }),
      }).catch(console.error);
    }

    setScreen('result');
  };

  // ── Timer color ────────────────────────────────────────────
  const timerColor = timeLeft > 15 ? '#16a34a' : timeLeft > 7 ? '#ca8a04' : '#dc2626';

  // ── Option button style ────────────────────────────────────
  const optionStyle = (i) => {
    let bg = '#f8fafc', border = '#e2e8f0', color = '#334155';

    if (revealed) {
      if (i === currentQ.correct) {
        bg = '#dcfce7'; border = '#4ade80'; color = '#166534';
      } else if (i === selected && i !== currentQ.correct) {
        bg = '#fee2e2'; border = '#f87171'; color = '#991b1b';
      }
    } else if (selected === i) {
      bg = '#ede9fe'; border = '#a5b4fc'; color = '#4f46e5';
    }

    return {
      width: '100%', padding: '14px 16px', borderRadius: '10px',
      border: `2px solid ${border}`, background: bg, color,
      fontSize: '14px', textAlign: 'left', cursor: revealed ? 'default' : 'pointer',
      fontFamily: 'inherit', fontWeight: revealed && i === currentQ.correct ? 700 : 400,
      transition: 'all 0.2s',
    };
  };

  // ─────────────────────────────────────────────────────────
  // RENDER: Setup screen
  // ─────────────────────────────────────────────────────────
  if (screen === 'setup') {
    return (
      <div style={{ maxWidth: '560px', margin: '40px auto', padding: '0 16px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px' }}>📝 Quiz Mode</h1>
        <p style={{ color: '#64748b', marginBottom: '28px', fontSize: '14px' }}>
          5 AI-generated questions · 30 seconds per question · scored instantly
        </p>

        {error && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '16px',
            background: '#fee2e2', border: '1px solid #fca5a5',
            fontSize: '13px', color: '#991b1b' }}>
            ❌ {error}
          </div>
        )}

        {/* Type toggle */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700,
            letterSpacing: '1px', marginBottom: '8px' }}>QUIZ TYPE</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['dsa', 'tech'].map(t => (
              <button key={t} onClick={() => { setType(t); setTopic(TOPICS[t][0]); }}
                style={{
                  padding: '8px 20px', borderRadius: '8px', fontSize: '14px',
                  fontWeight: 600, border: '2px solid', cursor: 'pointer',
                  borderColor: type === t ? '#6366f1' : '#e2e8f0',
                  background:  type === t ? '#ede9fe' : '#fff',
                  color:       type === t ? '#4f46e5' : '#475569',
                }}>
                {t === 'dsa' ? '💻 DSA' : '🎯 Tech'}
              </button>
            ))}
          </div>
        </div>

        {/* Topic picker */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700,
            letterSpacing: '1px', marginBottom: '8px' }}>TOPIC</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {TOPICS[type].map(t => (
              <button key={t} onClick={() => setTopic(t)}
                style={{
                  padding: '7px 16px', borderRadius: '20px', fontSize: '13px',
                  fontWeight: 500, border: '1.5px solid', cursor: 'pointer',
                  borderColor: topic === t ? '#6366f1' : '#e2e8f0',
                  background:  topic === t ? '#6366f1' : '#fff',
                  color:       topic === t ? '#fff'    : '#475569',
                  transition: 'all 0.15s',
                }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <button onClick={startQuiz}
          style={{
            width: '100%', padding: '14px', borderRadius: '10px', fontSize: '15px',
            fontWeight: 700, border: 'none', background: '#6366f1', color: '#fff',
            cursor: 'pointer',
          }}>
          Start Quiz — {topic} →
        </button>
      </div>
    );
  }

  // RENDER: Loading
  if (screen === 'loading') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '60vh', gap: '16px' }}>
        <div style={{ fontSize: '36px' }}>⚡</div>
        <div style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>
          Generating {topic} quiz...
        </div>
        <div style={{ fontSize: '13px', color: '#64748b' }}>Groq is crafting 5 questions</div>
      </div>
    );
  }

  // RENDER: Result screen
  if (screen === 'result') {
    const pct = Math.round((score / questions.length) * 100);
    const grade = pct >= 80 ? { label: 'Excellent! 🎉', color: '#16a34a', bg: '#dcfce7' }
                : pct >= 60 ? { label: 'Good job 👍',   color: '#ca8a04', bg: '#fef9c3' }
                :             { label: 'Keep grinding 💪', color: '#dc2626', bg: '#fee2e2' };

    return (
      <div style={{ maxWidth: '560px', margin: '40px auto', padding: '0 16px' }}>
        {/* Score card */}
        <div style={{ textAlign: 'center', padding: '32px', borderRadius: '16px',
          background: grade.bg, border: `2px solid ${grade.color}`, marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', fontWeight: 800, color: grade.color, marginBottom: '8px' }}>
            {pct}%
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: grade.color, marginBottom: '6px' }}>
            {grade.label}
          </div>
          <div style={{ fontSize: '14px', color: '#475569' }}>
            {score} / {questions.length} correct · {topic}
          </div>
        </div>

        {/* Review each question */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {questions.map((q, i) => {
            const ans = answers[i];
            const correct = ans?.correct;
            return (
              <div key={i} style={{
                padding: '16px', borderRadius: '12px',
                border: `1px solid ${correct ? '#bbf7d0' : '#fca5a5'}`,
                background: correct ? '#f0fdf4' : '#fff5f5',
              }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px',
                  alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>
                    {correct ? '✅' : '❌'}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b',
                    lineHeight: 1.5 }}>
                    {q.question}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#475569', marginBottom: '6px',
                  paddingLeft: '24px' }}>
                  Correct: <b style={{ color: '#16a34a' }}>{q.options[q.correct]}</b>
                  {!correct && ans?.selected != null && (
                    <> · Your answer: <b style={{ color: '#dc2626' }}>{q.options[ans.selected]}</b></>
                  )}
                  {!correct && ans?.selected == null && (
                    <> · <b style={{ color: '#dc2626' }}>Timed out</b></>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6,
                  paddingLeft: '24px', fontStyle: 'italic' }}>
                  {q.explanation}
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setScreen('setup')}
            style={{ flex: 1, padding: '12px', borderRadius: '8px', fontSize: '14px',
              fontWeight: 600, border: '1px solid #e2e8f0', background: '#fff',
              cursor: 'pointer' }}>
            Try Another Topic
          </button>
          <button onClick={() => { setScreen('setup'); setTopic(topic); setTimeout(startQuiz, 100); }}
            style={{ flex: 1, padding: '12px', borderRadius: '8px', fontSize: '14px',
              fontWeight: 700, border: 'none', background: '#6366f1', color: '#fff',
              cursor: 'pointer' }}>
            Retry {topic} →
          </button>
        </div>
      </div>
    );
  }

  // RENDER: Quiz in progress
  return (
    <div style={{ maxWidth: '620px', margin: '32px auto', padding: '0 16px' }}>

      {/* Progress bar + meta */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>
            Question {qIdx + 1} of {questions.length} · {topic}
          </span>
          {/* Timer */}
          <div style={{
            fontSize: '16px', fontWeight: 800, color: timerColor,
            background: timerColor + '18', padding: '4px 14px',
            borderRadius: '20px', border: `2px solid ${timerColor}`,
            minWidth: '56px', textAlign: 'center', transition: 'color 0.3s',
          }}>
            {timeLeft}s
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '4px', background: '#6366f1',
            width: `${((qIdx) / questions.length) * 100}%`,
            transition: 'width 0.3s',
          }} />
        </div>
      </div>

      {/* Question */}
      <div style={{
        padding: '22px', borderRadius: '14px', background: '#fff',
        border: '1px solid #e2e8f0', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
      }}>
        <div style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', lineHeight: 1.6 }}>
          {currentQ?.question}
        </div>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        {currentQ?.options.map((opt, i) => (
          <button key={i} onClick={() => submitAnswer(i)} style={optionStyle(i)}>
            <span style={{ fontWeight: 700, marginRight: '10px', color: '#94a3b8' }}>
              {['A', 'B', 'C', 'D'][i]}.
            </span>
            {opt}
            {revealed && i === currentQ.correct && (
              <span style={{ marginLeft: '8px' }}>✓</span>
            )}
            {revealed && i === selected && i !== currentQ.correct && (
              <span style={{ marginLeft: '8px' }}>✗</span>
            )}
          </button>
        ))}
      </div>

      {/* Explanation — shown after answering */}
      {revealed && (
        <div style={{
          padding: '14px 16px', borderRadius: '10px', marginBottom: '8px',
          background: answers[answers.length - 1]?.correct ? '#f0fdf4' : '#fff5f5',
          border: `1px solid ${answers[answers.length - 1]?.correct ? '#bbf7d0' : '#fca5a5'}`,
          fontSize: '13px', color: '#334155', lineHeight: 1.6,
        }}>
          <b style={{ color: '#1e293b' }}>
            {answers[answers.length - 1]?.correct ? '✅ Correct! ' : '❌ Wrong. '}
          </b>
          {currentQ?.explanation}
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
            Auto-advancing in 2.5 seconds...
          </div>
        </div>
      )}

      {/* Score so far */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '8px' }}>
        {answers.map((a, i) => (
          <div key={i} style={{
            width: '10px', height: '10px', borderRadius: '50%',
            background: a.correct ? '#4ade80' : '#f87171',
          }} />
        ))}
        {Array(questions.length - answers.length).fill(0).map((_, i) => (
          <div key={`empty-${i}`} style={{
            width: '10px', height: '10px', borderRadius: '50%',
            background: '#e2e8f0',
          }} />
        ))}
      </div>
    </div>
  );
}