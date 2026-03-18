import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const TABS = ['Quick Answer', 'Deep Dive', 'Follow-ups', 'Avoid Saying'];

export default function ExplainModal({ question, category, onClose, onAskMore }) {
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [activeTab,  setActiveTab]  = useState(0);

  // Fetch explanation when modal mounts
  useState(() => {
    setLoading(true);
    fetch('http://localhost:5000/api/tech/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, category })
    })
    .then(r => r.json())
    .then(d => { setData(d); setLoading(false); })
    .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '16px'
    }}>
      <div style={{
        background: '#fff', borderRadius: '14px', width: '100%',
        maxWidth: '680px', maxHeight: '85vh', overflow: 'hidden',
        display: 'flex', flexDirection: 'column'
      }}>

        {/* Header */}
        <div style={{
          padding: '18px 22px', borderBottom: '1px solid #e2e8f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#6366f1', fontWeight: 600,
              letterSpacing: '1px', marginBottom: '4px' }}>
              {category?.toUpperCase()}
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b', lineHeight: 1.4 }}>
              {question}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: '20px',
            cursor: 'pointer', color: '#94a3b8', flexShrink: 0
          }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '2px', padding: '10px 16px',
          borderBottom: '1px solid #e2e8f0', background: '#f8fafc'
        }}>
          {TABS.map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(i)}
              style={{
                padding: '7px 14px', borderRadius: '8px', fontSize: '13px',
                border: 'none', cursor: 'pointer', fontWeight: 500,
                background: activeTab === i ? '#fff' : 'transparent',
                color:      activeTab === i ? '#1e293b' : '#64748b',
                boxShadow:  activeTab === i ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 22px' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6366f1' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚡</div>
              <div style={{ fontSize: '14px' }}>Groq is thinking...</div>
            </div>
          )}

          {error && (
            <div style={{ color: '#dc2626', padding: '20px', background: '#fef2f2',
              borderRadius: '8px', fontSize: '14px' }}>
              Error: {error}
            </div>
          )}

          {data && !loading && (
            <>
              {activeTab === 0 && (
                <div>
                  <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#334155' }}>
                    {data.quickAnswer}
                  </p>
                </div>
              )}
              {activeTab === 1 && (
                <div style={{ fontSize: '14px', lineHeight: 1.8, color: '#334155' }}>
                  <ReactMarkdown>{data.deepDive}</ReactMarkdown>
                </div>
              )}
              {activeTab === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {data.followUps?.map((q, i) => (
                    <div key={i} style={{
                      padding: '12px 16px', borderRadius: '8px',
                      border: '1px solid #e2e8f0', background: '#f8fafc',
                      fontSize: '14px', color: '#334155'
                    }}>
                      <span style={{ color: '#6366f1', fontWeight: 700, marginRight: '8px' }}>
                        {i + 1}.
                      </span>
                      {q}
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 3 && (
                <div>
                  <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#334155',
                    padding: '14px 16px', background: '#fff7ed',
                    border: '1px solid #fed7aa', borderRadius: '8px' }}>
                    ⚠️ {data.avoidSaying}
                  </p>
                </div>
              )}

              {/* Analogy — always shown below tabs */}
              {data.analogy && (
                <div style={{
                  marginTop: '20px', padding: '14px 16px', borderRadius: '8px',
                  background: '#f0fdf4', border: '1px solid #bbf7d0'
                }}>
                  <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700,
                    letterSpacing: '1px', marginBottom: '6px' }}>
                    💡 ANALOGY
                  </div>
                  <p style={{ fontSize: '14px', color: '#334155', lineHeight: 1.6, margin: 0 }}>
                    {data.analogy}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {data && (
          <div style={{
            padding: '14px 22px', borderTop: '1px solid #e2e8f0',
            display: 'flex', justifyContent: 'flex-end', gap: '10px'
          }}>
            <button onClick={onClose}
              style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '14px',
                border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}>
              Close
            </button>
            {onAskMore && (
              <button
                onClick={() => { onClose(); onAskMore(question); }}
                style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '14px',
                  background: '#6366f1', color: '#fff', border: 'none',
                  cursor: 'pointer', fontWeight: 600 }}>
                Ask AI more →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}