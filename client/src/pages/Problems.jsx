import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Visualizer from '../components/Visualizer';
const API = 'http://localhost:5000';

const DIFF_COLOR = {
  Easy:   { bg: '#dcfce7', color: '#16a34a' },
  Medium: { bg: '#fef9c3', color: '#ca8a04' },
  Hard:   { bg: '#fee2e2', color: '#dc2626' },
};

export default function Problems() {
  const [problems,  setProblems]  = useState([]);
  const [meta,      setMeta]      = useState({ topics: [], companies: [] });
  const [loading,   setLoading]   = useState(true);

  // filters
  const [topic,      setTopic]      = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [company,    setCompany]    = useState('');
  const [search,     setSearch]     = useState('');

  const [animating,   setAnimating]   = useState(null);  // problemId being animated
const [animData,    setAnimData]    = useState({});     // { problemId: vizData }
  const navigate = useNavigate();

  // fetch filter metadata once
  useEffect(() => {
    axios.get(`${API}/api/problems/meta`)
      .then(r => setMeta(r.data))
      .catch(console.error);
  }, []);

  // fetch problems whenever any filter changes
  useEffect(() => {
    setLoading(true);
    const params = {};
    if (topic)      params.topic      = topic;
    if (difficulty) params.difficulty = difficulty;
    if (company)    params.company    = company;
    if (search)     params.search     = search;

    axios.get(`${API}/api/problems`, { params })
      .then(r => { setProblems(r.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, [topic, difficulty, company, search]);

  const clearFilters = () => {
    setTopic(''); setDifficulty(''); setCompany(''); setSearch('');
  };

  const hasFilters = topic || difficulty || company || search;
  const animateProblem = async (problem) => {
  const token = localStorage.getItem('token');
  if (!token) { alert('Please log in'); return; }

  // Toggle off if already showing
  if (animData[problem._id]) {
    setAnimData(prev => { const n = {...prev}; delete n[problem._id]; return n; });
    return;
  }

  setAnimating(problem._id);
  try {
    const res = await fetch(`${API}/api/animate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        input: `${problem.title}: ${problem.description}`
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setAnimData(prev => ({ ...prev, [problem._id]: data }));
    }
  } catch (err) {
    console.error('Animate error:', err);
  } finally {
    setAnimating(null);
  }
};
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>

      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>
          DSA Problems
        </h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          {problems.length} problems · Filter by topic, difficulty, or company
        </p>
      </div>

      {/* Search */}
      <input
        placeholder="Search problems..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%', padding: '10px 14px', fontSize: '14px',
          border: '1px solid #ddd', borderRadius: '8px',
          marginBottom: '12px', boxSizing: 'border-box'
        }}
      />

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>

        {/* Topic pills */}
        {['', ...meta.topics].map(t => (
          <button key={t || 'all'} onClick={() => setTopic(t)}
            style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '13px',
              cursor: 'pointer', border: '1px solid',
              background: topic === t ? '#1e293b' : '#f8fafc',
              color:      topic === t ? '#fff'     : '#475569',
              borderColor: topic === t ? '#1e293b' : '#e2e8f0',
              fontWeight: topic === t ? 600 : 400,
            }}>
            {t || 'All Topics'}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>

        {/* Difficulty */}
        {['', 'Easy', 'Medium', 'Hard'].map(d => (
          <button key={d || 'all-diff'} onClick={() => setDifficulty(d)}
            style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '13px',
              cursor: 'pointer', border: '1px solid',
              background: difficulty === d ? '#1e293b' : '#f8fafc',
              color:      difficulty === d ? '#fff'    : '#475569',
              borderColor: difficulty === d ? '#1e293b' : '#e2e8f0',
            }}>
            {d || 'Any Difficulty'}
          </button>
        ))}

        {/* Company */}
        <select value={company} onChange={e => setCompany(e.target.value)}
          style={{
            padding: '6px 12px', borderRadius: '8px', fontSize: '13px',
            border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer'
          }}>
          <option value="">All Companies</option>
          {meta.companies.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Clear filters */}
        {hasFilters && (
          <button onClick={clearFilters}
            style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '13px',
              cursor: 'pointer', border: '1px solid #fca5a5',
              background: '#fff', color: '#dc2626'
            }}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* Problem List */}
      {loading ? (
        <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>Loading...</p>
      ) : problems.length === 0 ? (
        <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>No problems match your filters.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {problems.map(p => (
            <div key={p._id} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '14px 16px', borderRadius: '10px',
              border: '1px solid #e2e8f0', background: '#fff',
              flexWrap: 'wrap'
            }}>
                
              {/* LeetCode number */}
              <span style={{ fontSize: '13px', color: '#94a3b8', minWidth: '36px', fontFamily: 'monospace' }}>
                #{p.leetcodeNum}
              </span>
                {animData[p._id] && (
                    <div style={{ padding: '0 16px 16px' }}>
                        <Visualizer data={animData[p._id]} />
                    </div>
                )}
              {/* Title */}
              <span style={{ fontWeight: 600, fontSize: '14px', flex: 1, minWidth: '160px' }}>
                {p.title}
              </span>

              {/* Difficulty badge */}
              <span style={{
                fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px',
                ...DIFF_COLOR[p.difficulty]
              }}>
                {p.difficulty}
              </span>

              {/* Topic tags */}
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {p.topics.map(t => (
                  <span key={t} style={{
                    fontSize: '11px', padding: '2px 8px', borderRadius: '4px',
                    background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0'
                  }}>
                    {t}
                  </span>
                ))}
              </div>

              {/* Company dots */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {p.companies.slice(0, 4).map(c => (
                  <span key={c} title={c} style={{
                    width: '22px', height: '22px', borderRadius: '50%',
                    background: '#6366f1', color: '#fff',
                    fontSize: '9px', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {c[0]}
                  </span>
                ))}
              </div>

              {/* Start with AI button */}
              <button
                onClick={() => navigate(`/chat?problemId=${p._id}`)}
                style={{
                  padding: '6px 14px', borderRadius: '6px', fontSize: '13px',
                  background: '#6366f1', color: '#fff', border: 'none',
                  cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap'
                }}>
                Start with AI →
              </button>
              <button
                    onClick={() => animateProblem(p)}
                    disabled={animating === p._id}
                    style={{
                        padding: '6px 14px', borderRadius: '6px', fontSize: '13px',
                        background: animData[p._id] ? '#ede9fe' : '#f8fafc',
                        color: animData[p._id] ? '#4f46e5' : '#475569',
                        border: '1px solid #e2e8f0',
                        cursor: animating === p._id ? 'wait' : 'pointer',
                    }}>
                    {animating === p._id ? '⚡...' : animData[p._id] ? '🎬 Hide' : '🎬 Animate'}
                </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}