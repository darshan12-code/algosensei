import { useState, useEffect } from 'react';
import axios from 'axios';
import ExplainModal from '../components/ExplainModal';

const API = 'http://localhost:5000';

const DIFF_COLOR = {
  Easy:   { bg: '#dcfce7', color: '#16a34a' },
  Medium: { bg: '#fef9c3', color: '#ca8a04' },
  Hard:   { bg: '#fee2e2', color: '#dc2626' },
};

export default function Tech() {
  const [questions,   setQuestions]   = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [difficulty,  setDifficulty]  = useState('');
  const [loading,     setLoading]     = useState(true);
  const [reviewed,    setReviewed]    = useState({}); // { questionId: true }
  const [modal,       setModal]       = useState(null); // { question, category }

  // Fetch categories with counts once
  useEffect(() => {
    axios.get(`${API}/api/tech/categories`)
      .then(r => setCategories(r.data))
      .catch(console.error);
  }, []);

  // Fetch questions when filters change
  useEffect(() => {
    setLoading(true);
    const params = {};
    if (activeCategory) params.category   = activeCategory;
    if (difficulty)     params.difficulty = difficulty;

    axios.get(`${API}/api/tech`, { params })
      .then(r => { setQuestions(r.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, [activeCategory, difficulty]);

  const toggleReviewed = (id) => {
    setReviewed(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{ display: 'flex', maxWidth: '1000px', margin: '0 auto', padding: '24px 16px', gap: '20px' }}>

      {/* Sidebar */}
      <div style={{ width: '200px', flexShrink: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '13px', color: '#94a3b8',
          letterSpacing: '1px', marginBottom: '10px' }}>
          CATEGORIES
        </div>

        {/* All */}
        <button onClick={() => setActiveCategory('')}
          style={{
            width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: '8px',
            border: 'none', cursor: 'pointer', fontSize: '14px', marginBottom: '2px',
            background: activeCategory === '' ? '#6366f1' : 'transparent',
            color:      activeCategory === '' ? '#fff'    : '#334155',
            fontWeight: activeCategory === '' ? 600 : 400,
          }}>
          All Questions
        </button>

        {categories.map(cat => (
          <button key={cat._id} onClick={() => setActiveCategory(cat._id)}
            style={{
              width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: '8px',
              border: 'none', cursor: 'pointer', fontSize: '14px', marginBottom: '2px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: activeCategory === cat._id ? '#6366f1' : 'transparent',
              color:      activeCategory === cat._id ? '#fff'    : '#334155',
              fontWeight: activeCategory === cat._id ? 600 : 400,
            }}>
            <span>{cat._id}</span>
            <span style={{
              fontSize: '11px',
              background: activeCategory === cat._id ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
              color: activeCategory === cat._id ? '#fff' : '#64748b',
              padding: '1px 7px', borderRadius: '20px'
            }}>
              {cat.count}
            </span>
          </button>
        ))}

        {/* Difficulty filter */}
        <div style={{ marginTop: '20px', fontWeight: 700, fontSize: '13px',
          color: '#94a3b8', letterSpacing: '1px', marginBottom: '10px' }}>
          DIFFICULTY
        </div>
        {['', 'Easy', 'Medium', 'Hard'].map(d => (
          <button key={d || 'all'} onClick={() => setDifficulty(d)}
            style={{
              width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: '8px',
              border: 'none', cursor: 'pointer', fontSize: '14px', marginBottom: '2px',
              background: difficulty === d ? '#1e293b' : 'transparent',
              color:      difficulty === d ? '#fff'    : '#334155',
            }}>
            {d || 'Any'}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: '16px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>
            Tech Questions
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            {questions.length} questions
            {activeCategory ? ` · ${activeCategory}` : ''}
            {difficulty ? ` · ${difficulty}` : ''}
          </p>
        </div>

        {loading ? (
          <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>Loading...</p>
        ) : questions.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>No questions found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {questions.map(q => (
              <div key={q._id} style={{
                padding: '16px 18px', borderRadius: '10px',
                border: `1px solid ${reviewed[q._id] ? '#bbf7d0' : '#e2e8f0'}`,
                background: reviewed[q._id] ? '#f0fdf4' : '#fff',
                transition: 'all 0.2s'
              }}>
                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between',
                  alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: '#1e293b',
                    lineHeight: 1.5, margin: 0, flex: 1 }}>
                    {q.question}
                  </p>
                  <span style={{
                    fontSize: '11px', fontWeight: 600, padding: '3px 10px',
                    borderRadius: '20px', flexShrink: 0, ...DIFF_COLOR[q.difficulty]
                  }}>
                    {q.difficulty}
                  </span>
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {q.tags?.map(tag => (
                    <span key={tag} style={{
                      fontSize: '11px', padding: '2px 8px', borderRadius: '4px',
                      background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0'
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setModal({ question: q.question, category: q.category })}
                    style={{
                      padding: '7px 16px', borderRadius: '7px', fontSize: '13px',
                      background: '#6366f1', color: '#fff', border: 'none',
                      cursor: 'pointer', fontWeight: 600
                    }}>
                    ✨ Get AI Explanation
                  </button>

                  <button onClick={() => toggleReviewed(q._id)}
                    style={{
                      padding: '7px 16px', borderRadius: '7px', fontSize: '13px',
                      background: reviewed[q._id] ? '#dcfce7' : '#f8fafc',
                      color:      reviewed[q._id] ? '#16a34a' : '#64748b',
                      border: `1px solid ${reviewed[q._id] ? '#bbf7d0' : '#e2e8f0'}`,
                      cursor: 'pointer'
                    }}>
                    {reviewed[q._id] ? '✓ Reviewed' : 'Mark Reviewed'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Explanation Modal */}
      {modal && (
        <ExplainModal
          question={modal.question}
          category={modal.category}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}