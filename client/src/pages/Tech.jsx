// client/src/pages/Tech.jsx
// Fix: uses CollapsibleSidebar for mobile expand/collapse
// Fix: ExplainModal now constrained via fixed component (no more horizontal scroll)
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import ExplainModal from '../components/ExplainModal.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';
import { apiFetch } from '../lib/api.js';
import {
  PageLayout, TwoColLayout, CollapsibleSidebar, MainContent,
  PageTitle, PageSubtitle, SectionLabel,
  Btn, DiffBadge, AIBadge, FilterBtn, FilterCount,
  EmptyBox, Input,
} from '../components/ui.jsx';

/* ── Local styled components ─────────────────────────────── */
const QuestionCard = styled(motion.div)`
  background: ${({ $reviewed, theme }) => $reviewed ? theme.colors.greenBg : theme.colors.bgSurface};
  border: 1px solid ${({ $reviewed, theme }) => $reviewed ? theme.colors.greenBorder : theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 16px;
  margin-bottom: 10px;
  transition: border-color 0.15s;
  &:hover { border-color: ${({ theme }) => theme.colors.accentBorder}; }
`;

const TagChip = styled.span`
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.bgHover};
  color: ${({ theme }) => theme.colors.textMuted};
`;

export default function Tech() {
  const [questions,      setQuestions]      = useState([]);
  const [categories,     setCategories]     = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [difficulty,     setDifficulty]     = useState('');
  const [search,         setSearch]         = useState('');
  const [loading,        setLoading]        = useState(true);
  const [visible,        setVisible]        = useState(15);
  const [reviewed,       setReviewed]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('reviewed') || '{}'); } catch { return {}; }
  });
  const [modal,      setModal]      = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => { setVisible(15); }, [activeCategory, difficulty, search]);

  useEffect(() => {
    apiFetch('/api/tech/categories').then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (activeCategory) qs.set('category', activeCategory);
    if (difficulty)     qs.set('difficulty', difficulty);
    apiFetch(`/api/tech?${qs}`)
      .then(setQuestions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeCategory, difficulty]);

  const filtered = questions.filter(q =>
    !search || q.question.toLowerCase().includes(search.toLowerCase())
  );
  const visibleFiltered = filtered.slice(0, visible);

  const toggleReviewed = (id) => {
    const next = { ...reviewed, [id]: !reviewed[id] };
    setReviewed(next);
    localStorage.setItem('reviewed', JSON.stringify(next));
  };

  const generateQuestion = async () => {
    if (!activeCategory) return;
    setGenerating(true);
    try {
      const q = await apiFetch('/api/tech/generate', {
        method: 'POST',
        body: JSON.stringify({ category: activeCategory }),
      });
      setQuestions(prev => [q, ...prev]);
    } catch (err) { alert(err.message); }
    finally { setGenerating(false); }
  };

  const activeFilterCount = [activeCategory, difficulty].filter(Boolean).length;

  return (
    <PageLayout $wide>
      <TwoColLayout>
        {/* ── Collapsible Sidebar (fix #1) ── */}
        <CollapsibleSidebar label={`Filters${activeFilterCount ? ` (${activeFilterCount})` : ''}`}>
          <SectionLabel>Categories</SectionLabel>
          <FilterBtn $active={!activeCategory} onClick={() => setActiveCategory('')}>
            All Questions
          </FilterBtn>
          {categories.map(cat => (
            <FilterBtn key={cat._id} $active={activeCategory === cat._id} onClick={() => setActiveCategory(cat._id)}>
              <span>{cat._id}</span>
              <FilterCount>{cat.count}</FilterCount>
            </FilterBtn>
          ))}

          <SectionLabel style={{ marginTop: 16 }}>Difficulty</SectionLabel>
          {['', 'Easy', 'Medium', 'Hard'].map(d => (
            <FilterBtn key={d || 'all'} $active={difficulty === d} onClick={() => setDifficulty(d)}>
              {d || 'Any'}
            </FilterBtn>
          ))}
        </CollapsibleSidebar>

        {/* ── Content ── */}
        <MainContent>
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <PageTitle>Tech Questions</PageTitle>
            <PageSubtitle>
              {filtered.length} questions
              {activeCategory ? ` · ${activeCategory}` : ''}
              {difficulty ? ` · ${difficulty}` : ''}
            </PageSubtitle>
          </motion.div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <Input
              placeholder="Search questions…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ marginBottom: 0 }}
            />
            {activeCategory && (
              <Btn $variant="primary" onClick={generateQuestion} disabled={generating} style={{ flexShrink: 0 }}>
                {generating ? '⚡…' : '+ AI Generate'}
              </Btn>
            )}
          </div>

          {loading ? (
            <SkeletonLoader count={5} />
          ) : filtered.length === 0 ? (
            <EmptyBox>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🎯</div>
              No questions found.
            </EmptyBox>
          ) : (
            <>
              {visibleFiltered.map((q, i) => (
                <QuestionCard
                  key={q._id}
                  $reviewed={reviewed[q._id]}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.55, flex: 1, color: 'var(--text-primary)' }}>
                      {q.question}
                    </p>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      {q.isCustom && <AIBadge>AI</AIBadge>}
                      <DiffBadge difficulty={q.difficulty} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
                    {q.tags?.map(tag => <TagChip key={tag}>{tag}</TagChip>)}
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Btn $variant="primary" onClick={() => setModal({ question: q.question, category: q.category })}>
                      ✨ AI Explanation
                    </Btn>
                    <Btn
                      $variant={reviewed[q._id] ? 'success' : 'secondary'}
                      onClick={() => toggleReviewed(q._id)}
                    >
                      {reviewed[q._id] ? '✓ Reviewed' : 'Mark Reviewed'}
                    </Btn>
                  </div>
                </QuestionCard>
              ))}

              {visible < filtered.length && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                  <Btn onClick={() => setVisible(v => v + 15)}>
                    Load {Math.min(15, filtered.length - visible)} more ↓
                  </Btn>
                </div>
              )}
            </>
          )}
        </MainContent>
      </TwoColLayout>

      {/* Fix #2: ExplainModal is now constrained to 95vw max, no horizontal scroll */}
      <AnimatePresence>
        {modal && (
          <ExplainModal
            question={modal.question}
            category={modal.category}
            onClose={() => setModal(null)}
          />
        )}
      </AnimatePresence>
    </PageLayout>
  );
}