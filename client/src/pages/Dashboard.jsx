import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000';

// Color for heatmap cell based on fail rate
function heatColor(failRate, attemptCount) {
  if (attemptCount === 0) return { bg: '#f1f5f9', color: '#94a3b8', label: 'No data' };
  if (failRate < 0.3)     return { bg: '#dcfce7', color: '#166534', label: 'Strong' };
  if (failRate < 0.6)     return { bg: '#fef9c3', color: '#854d0e', label: 'Review' };
  return                         { bg: '#fee2e2', color: '#991b1b', label: 'Weak' };
}

function MetricCard({ icon, label, value, sub, color = '#6366f1' }) {
  return (
    <div style={{
      padding: '18px 20px', borderRadius: '12px', background: '#fff',
      border: '1px solid #e2e8f0', flex: 1, minWidth: '120px',
    }}>
      <div style={{ fontSize: '22px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontSize: '26px', fontWeight: 800, color, marginBottom: '2px' }}>
        {value ?? '—'}
      </div>
      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{label}</div>
      {sub && <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    fetch(`${API}/api/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(d => { setData(d); setLoading(false); })
    .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '60vh', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '28px' }}>📊</div>
        <div style={{ fontSize: '15px', color: '#64748b' }}>Loading your dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '500px', margin: '60px auto', padding: '0 16px', textAlign: 'center' }}>
        <div style={{ fontSize: '14px', color: '#dc2626' }}>Error: {error}</div>
      </div>
    );
  }

  const weakest = data?.weakTopics?.[0];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '4px' }}>
          📊 Your Dashboard
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px' }}>
          Track your progress and identify weak areas
        </p>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <MetricCard
          icon="✅" label="Problems Solved"
          value={data?.solvedCount} color="#16a34a"
          sub={`${data?.sessionCount} total sessions`}
        />
        <MetricCard
          icon="🔥" label="Day Streak"
          value={data?.streak} color="#f59e0b"
          sub="consecutive days"
        />
        <MetricCard
          icon="📝" label="Quiz Accuracy"
          value={data?.quizAccuracy != null ? `${data.quizAccuracy}%` : '—'}
          color="#6366f1"
          sub={`${data?.quizCount} quizzes taken`}
        />
        <MetricCard
          icon="🎯" label="Topics Tracked"
          value={data?.weakTopics?.length ?? 0} color="#0ea5e9"
          sub="across DSA + tech"
        />
      </div>

      {/* Today's mission */}
      {weakest && (
        <div style={{
          padding: '18px 20px', borderRadius: '12px', marginBottom: '24px',
          background: 'linear-gradient(135deg, #ede9fe, #dbeafe)',
          border: '1px solid #c4b5fd',
        }}>
          <div style={{ fontSize: '11px', color: '#4f46e5', fontWeight: 700,
            letterSpacing: '1px', marginBottom: '8px' }}>
            🎯 TODAY'S MISSION
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
            Practice {weakest.topic}
          </div>
          <div style={{ fontSize: '13px', color: '#4f46e5', marginBottom: '14px' }}>
            Your weakest topic — {Math.round(weakest.failRate * 100)}% fail rate
            across {weakest.attemptCount} attempts
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate(`/problems?topic=${encodeURIComponent(weakest.topic)}`)}
              style={{
                padding: '9px 18px', borderRadius: '8px', fontSize: '13px',
                fontWeight: 700, border: 'none', background: '#6366f1',
                color: '#fff', cursor: 'pointer',
              }}>
              Practice Problems →
            </button>
            <button
              onClick={() => navigate(`/quiz?topic=${encodeURIComponent(weakest.topic)}&type=${weakest.type}`)}
              style={{
                padding: '9px 18px', borderRadius: '8px', fontSize: '13px',
                fontWeight: 700, border: '1px solid #c4b5fd',
                background: '#fff', color: '#4f46e5', cursor: 'pointer',
              }}>
              Take Quiz →
            </button>
          </div>
        </div>
      )}

      {/* No data state */}
      {!weakest && (
        <div style={{
          padding: '18px 20px', borderRadius: '12px', marginBottom: '24px',
          background: '#f8fafc', border: '1px dashed #cbd5e1', textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', color: '#64748b' }}>
            Complete a quiz to see your mission here →{' '}
            <span onClick={() => navigate('/quiz')}
              style={{ color: '#6366f1', fontWeight: 600, cursor: 'pointer' }}>
              Start a quiz
            </span>
          </div>
        </div>
      )}

      {/* Weak topics heatmap */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b',
          marginBottom: '12px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center' }}>
          <span>Topic Heatmap</span>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 400 }}>
            Click a topic to practice
          </span>
        </div>

        {data?.weakTopics?.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', borderRadius: '10px',
            border: '1px dashed #e2e8f0', color: '#94a3b8', fontSize: '14px' }}>
            No quiz data yet — take a quiz to populate your heatmap
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '10px' }}>
            {data?.weakTopics?.map((t, i) => {
              const { bg, color, label } = heatColor(t.failRate, t.attemptCount);
              return (
                <div key={i}
                  onClick={() => navigate(
                    t.type === 'dsa'
                      ? `/problems?topic=${encodeURIComponent(t.topic)}`
                      : `/tech?category=${encodeURIComponent(t.topic)}`
                  )}
                  style={{
                    padding: '14px', borderRadius: '10px', background: bg,
                    border: `1px solid ${color}30`, cursor: 'pointer',
                    transition: 'transform 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div style={{ fontSize: '13px', fontWeight: 700, color, marginBottom: '4px' }}>
                    {t.topic}
                  </div>
                  <div style={{ fontSize: '11px', color, opacity: 0.8, marginBottom: '6px' }}>
                    {label} · {Math.round(t.failRate * 100)}% fail
                  </div>
                  <div style={{ height: '4px', borderRadius: '2px',
                    background: color + '30', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '2px', background: color,
                      width: `${Math.round(t.failRate * 100)}%`,
                      transition: 'width 0.5s',
                    }} />
                  </div>
                  <div style={{ fontSize: '10px', color, opacity: 0.7, marginTop: '4px' }}>
                    {t.attemptCount} attempts
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent sessions */}
      <div>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>
          Recent Sessions
        </div>

        {data?.recentSessions?.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', borderRadius: '10px',
            border: '1px dashed #e2e8f0', color: '#94a3b8', fontSize: '14px' }}>
            No sessions yet —{' '}
            <span onClick={() => navigate('/problems')}
              style={{ color: '#6366f1', fontWeight: 600, cursor: 'pointer' }}>
              start a problem
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data?.recentSessions?.map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', borderRadius: '10px',
                background: '#fff', border: '1px solid #f1f5f9',
                flexWrap: 'wrap',
              }}>
                <span style={{ fontSize: '16px' }}>
                  {s.mode === 'dsa_hint' ? '💡'
                    : s.mode === 'dsa_reveal' ? '🔓'
                    : s.mode === 'tech_explain' ? '📖'
                    : '🎤'}
                </span>
                <span style={{ flex: 1, fontSize: '14px', fontWeight: 600,
                  color: '#1e293b', minWidth: '120px' }}>
                  {s.problemId?.title || 'Tech Session'}
                </span>
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
                  background: '#f1f5f9', color: '#64748b' }}>
                  {s.mode?.replace('_', ' ')}
                </span>
                {s.solved && (
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
                    background: '#dcfce7', color: '#16a34a', fontWeight: 600 }}>
                    ✓ Solved
                  </span>
                )}
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  {new Date(s.completedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}