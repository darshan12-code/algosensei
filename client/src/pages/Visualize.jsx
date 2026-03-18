import { useState } from 'react';
import Visualizer from '../components/Visualizer';
import { PRESETS, getFallbackAnimation } from '../lib/animations';

const API = 'http://localhost:5000';

const PRESET_BUTTONS = [
  { key: 'bubbleSort',        label: '🫧 Bubble Sort' },
  { key: 'binarySearch',      label: '🔍 Binary Search' },
  { key: 'twoSum',            label: '➕ Two Sum' },
  { key: 'validParentheses',  label: '🔲 Valid Parentheses' },
  { key: 'reverseLinkedList', label: '↩ Reverse Linked List' },
];

export default function Visualize() {
  const [vizData,   setVizData]   = useState(null);
  const [input,     setInput]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [activeKey, setActiveKey] = useState('');

  const loadPreset = (key) => {
    setActiveKey(key);
    setError('');
    setVizData(PRESETS[key]());
  };

  const generateAnimation = async () => {
    if (!input.trim()) return;
    const token = localStorage.getItem('token');
    if (!token) { alert('Please log in first'); return; }

    setLoading(true);
    setError('');
    setActiveKey('');

    try {
      const res = await fetch(`${API}/api/animate`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ input }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Generation failed');

      setVizData(data);
    } catch (err) {
      setError(`AI generation failed: ${err.message}. Showing closest pre-built animation.`);
      // Graceful fallback — match by keyword
      setVizData(getFallbackAnimation(input));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px' }}>
          🎬 Algorithm Visualizer
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px' }}>
          Watch DSA algorithms animate step by step. Choose a preset or paste any problem.
        </p>
      </div>

      {/* Preset buttons */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700,
          letterSpacing: '1px', marginBottom: '10px' }}>
          PRE-BUILT ANIMATIONS
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {PRESET_BUTTONS.map(({ key, label }) => (
            <button key={key} onClick={() => loadPreset(key)}
              style={{
                padding: '8px 16px', borderRadius: '8px', fontSize: '13px',
                fontWeight: 600, cursor: 'pointer', border: '1px solid',
                borderColor: activeKey === key ? '#6366f1' : '#e2e8f0',
                background:  activeKey === key ? '#ede9fe' : '#fff',
                color:       activeKey === key ? '#4f46e5' : '#475569',
                transition: 'all 0.15s',
              }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
        <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
        <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>OR</span>
        <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
      </div>

      {/* AI Generator */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700,
          letterSpacing: '1px', marginBottom: '10px' }}>
          AI ANIMATION GENERATOR
        </div>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={`Paste a problem description or algorithm name, e.g:\n"Find two numbers in an array that sum to a target"\n"Sliding window maximum"\n"Merge two sorted linked lists"`}
          rows={4}
          style={{
            width: '100%', padding: '12px 14px', fontSize: '14px',
            border: '1px solid #e2e8f0', borderRadius: '10px',
            fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box',
            lineHeight: 1.6, outline: 'none',
          }}
        />
        <button
          onClick={generateAnimation}
          disabled={loading || !input.trim()}
          style={{
            marginTop: '10px', padding: '10px 24px', borderRadius: '8px',
            fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer',
            background: (loading || !input.trim()) ? '#e2e8f0' : '#6366f1',
            color:      (loading || !input.trim()) ? '#94a3b8' : '#fff',
            transition: 'all 0.15s',
          }}>
          {loading ? '⚡ Generating...' : '✨ Animate It'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '16px',
          background: '#fff7ed', border: '1px solid #fed7aa',
          fontSize: '13px', color: '#92400e' }}>
          ⚠️ {error}
        </div>
      )}

      {/* AI metadata */}
      {vizData?.conceptExplain && (
        <div style={{ marginBottom: '16px', padding: '14px 16px', borderRadius: '10px',
          background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700,
            letterSpacing: '1px', marginBottom: '6px' }}>
            💡 CORE CONCEPT
          </div>
          <p style={{ fontSize: '13px', color: '#334155', margin: 0, lineHeight: 1.6 }}>
            {vizData.conceptExplain}
          </p>
          {vizData.interviewTip && (
            <p style={{ fontSize: '13px', color: '#64748b', margin: '8px 0 0',
              lineHeight: 1.6, fontStyle: 'italic' }}>
              🎤 Interview tip: {vizData.interviewTip}
            </p>
          )}
        </div>
      )}

      {/* Visualizer */}
      {vizData && <Visualizer data={vizData} />}

      {/* Empty state */}
      {!vizData && !loading && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎬</div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
            Pick a preset or paste a problem above
          </div>
          <div style={{ fontSize: '13px' }}>
            Animations run step-by-step with explanations at each stage
          </div>
        </div>
      )}
    </div>
  );
}