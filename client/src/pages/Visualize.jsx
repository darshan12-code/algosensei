// src/pages/Visualize.jsx
// Redesigned: problems grouped by category, each problem shows multiple
// approach tabs (e.g. "HashMap O(n)" vs "Brute Force O(n²)").

import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import Visualizer from '../components/Visualizer.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';
import { PROBLEMS, getFallbackAnimation } from '../lib/animations.js';
import { apiFetch } from '../lib/api.js';
import {
  PageLayout, PageTitle, PageSubtitle, SectionLabel,
  Btn, Badge, OrDivider, AlertBox, ConceptCard, Textarea, Input,
} from '../components/ui.jsx';

/* ── Styled components ──────────────────────────────────── */
const CategoryTabs = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 20px;
`;

const CatTab = styled.button`
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.accentBorder : theme.colors.border};
  background: ${({ $active, theme }) => $active ? theme.colors.accentBg : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.accent : theme.colors.textSecondary};
  font-size: 12px;
  font-weight: ${({ $active }) => $active ? 700 : 400};
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
  &:hover { border-color: ${({ theme }) => theme.colors.accentBorder}; color: ${({ theme }) => theme.colors.accent}; }
`;

const ProblemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
  margin-bottom: 24px;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ProblemCard = styled(motion.button)`
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.accentBorder : theme.colors.border};
  background: ${({ $active, theme }) => $active ? theme.colors.accentBg : theme.colors.bgSurface};
  color: ${({ $active, theme }) => $active ? theme.colors.accent : theme.colors.textSecondary};
  font-size: 13px;
  font-weight: ${({ $active }) => $active ? 700 : 400};
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
  display: flex;
  flex-direction: column;
  gap: 4px;
  &:hover { border-color: ${({ theme }) => theme.colors.accentBorder}; color: ${({ theme }) => theme.colors.accent}; }
`;

const ProblemDiff = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: ${({ $diff, theme }) =>
    $diff === 'Easy'   ? theme.colors.green :
    $diff === 'Medium' ? theme.colors.amber :
    theme.colors.red};
`;

const ApproachBar = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
  padding: 12px 16px;
  background: ${({ theme }) => theme.colors.bgRaised};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.radius.md};
`;

const ApproachTab = styled.button`
  padding: 5px 12px;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.accentBorder : theme.colors.border};
  background: ${({ $active, theme }) => $active ? theme.colors.accent : 'transparent'};
  color: ${({ $active, theme }) => $active ? (theme.mode === 'dark' ? theme.colors.bg : '#fff') : theme.colors.textSecondary};
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  &:hover { border-color: ${({ theme }) => theme.colors.accentBorder}; }
`;

const ExplainStep = styled(motion.div)`
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  padding: 10px 14px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.bgSurface};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  font-size: 13px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const StepNum = styled.span`
  min-width: 22px; height: 22px; border-radius: 50%;
  background: ${({ theme }) => theme.colors.accentBg};
  color: ${({ theme }) => theme.colors.accent};
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; flex-shrink: 0;
`;

const ComplexityRow = styled.div`
  display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px;
`;

const ComplexityChip = styled.span`
  padding: 4px 12px; border-radius: 20px;
  background: ${({ theme }) => theme.colors.bgSurface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 12px; font-family: ${({ theme }) => theme.fonts.mono};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

/* ── Categories from PROBLEMS data ─────────────────────── */
const ALL_CATEGORIES = ['All', ...Array.from(new Set(PROBLEMS.map(p => p.category)))];

/* ── Component ──────────────────────────────────────────── */
export default function Visualize() {
  const [activeCategory,  setActiveCategory]  = useState('All');
  const [activeProblemId, setActiveProblemId] = useState(null);
  const [approachIdx,     setApproachIdx]     = useState(0);
  const [search,          setSearch]          = useState('');

  // AI input state
  const [input,         setInput]         = useState('');
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');
  const [aiVizData,     setAiVizData]     = useState(null);
  const [aiExplanation, setAiExplanation] = useState(null);

  const filteredProblems = useMemo(() => {
    return PROBLEMS.filter(p => {
      const matchCat  = activeCategory === 'All' || p.category === activeCategory;
      const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, search]);

  const activeProblem  = PROBLEMS.find(p => p.id === activeProblemId);
  const activeApproach = activeProblem?.approaches[approachIdx];

  const selectProblem = (id) => {
    setActiveProblemId(id);
    setApproachIdx(0);
    setAiVizData(null);
    setAiExplanation(null);
    setError('');
  };

  const generateAnimation = async () => {
    if (!input.trim()) return;
    setLoading(true); setError(''); setActiveProblemId(null); setAiVizData(null); setAiExplanation(null);

    try {
      const data = await apiFetch('/api/animate', { method: 'POST', body: JSON.stringify({ input }) });
      if (!data.steps?.length) throw new Error('No steps');
      setAiVizData(data);
    } catch {
      setError('AI animation unavailable for this problem. Showing text explanation:');
      try {
        const exp = await apiFetch('/api/animate/explain', { method: 'POST', body: JSON.stringify({ input }) });
        setAiExplanation(exp);
      } catch {
        setAiVizData(getFallbackAnimation(input));
        setError('Showing closest matching preset.');
        setAiExplanation(null);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <PageTitle initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        🎬 Algorithm Visualizer
      </PageTitle>
      <PageSubtitle>
        Multiple approaches per problem · ← → or Space to step · Switch approaches with the tabs
      </PageSubtitle>

      {/* ── Category filter ── */}
      <SectionLabel>Browse by Category</SectionLabel>
      <CategoryTabs>
        {ALL_CATEGORIES.map(cat => (
          <CatTab
            key={cat}
            $active={activeCategory === cat}
            onClick={() => { setActiveCategory(cat); setActiveProblemId(null); }}
          >
            {cat}
          </CatTab>
        ))}
      </CategoryTabs>

      {/* ── Search ── */}
      <Input
        placeholder="Search problems…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 16 }}
      />

      {/* ── Problem grid ── */}
      <ProblemGrid>
        {filteredProblems.map(p => (
          <ProblemCard
            key={p.id}
            $active={activeProblemId === p.id}
            onClick={() => selectProblem(p.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <span>{p.title}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ProblemDiff $diff={p.difficulty}>{p.difficulty}</ProblemDiff>
              {p.approaches.length > 1 && (
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  {p.approaches.length} approaches
                </span>
              )}
            </div>
          </ProblemCard>
        ))}
      </ProblemGrid>

      {/* ── Active problem: approach switcher + visualizer ── */}
      <AnimatePresence mode="wait">
        {activeProblem && (
          <motion.div
            key={activeProblemId}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {/* Approach tabs — only show if multiple */}
            {activeProblem.approaches.length > 1 && (
              <ApproachBar>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', alignSelf: 'center', marginRight: 4 }}>
                  APPROACH:
                </span>
                {activeProblem.approaches.map((a, idx) => (
                  <ApproachTab
                    key={idx}
                    $active={approachIdx === idx}
                    onClick={() => setApproachIdx(idx)}
                  >
                    {a.label}
                  </ApproachTab>
                ))}
              </ApproachBar>
            )}

            {/* Complexity badges */}
            {activeApproach && (
              <ComplexityRow>
                <ComplexityChip>⏱ {activeApproach.timeComplexity}</ComplexityChip>
                <ComplexityChip>💾 {activeApproach.spaceComplexity}</ComplexityChip>
              </ComplexityRow>
            )}

            {/* Visualizer */}
            {activeApproach && (
              <Visualizer data={activeApproach} isAIGenerated={false} />
            )}

            {/* Concept + tip */}
            {activeApproach?.conceptExplain && (
              <ConceptCard style={{ marginTop: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', color: 'var(--green)', marginBottom: 6 }}>
                  💡 CORE CONCEPT
                </div>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7 }}>{activeApproach.conceptExplain}</p>
                {activeApproach.interviewTip && (
                  <p style={{ color: 'var(--text-muted)', marginTop: 10, fontStyle: 'italic', fontSize: 13 }}>
                    🎤 {activeApproach.interviewTip}
                  </p>
                )}
              </ConceptCard>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Empty state ── */}
      {!activeProblem && !aiVizData && !aiExplanation && !loading && (
        <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>☝️</div>
          <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-secondary)' }}>Pick a problem above</div>
          <div style={{ fontSize: 13 }}>Or use AI input below for any algorithm</div>
        </div>
      )}

      <OrDivider>OR — AI ANIMATE ANYTHING</OrDivider>

      {/* ── AI input ── */}
      <SectionLabel>AI Animation Generator</SectionLabel>
      <Textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        rows={3}
        placeholder={'Type any algorithm or problem:\n"Trapping Rain Water"\n"Coin Change bottom-up DP"\n"Dijkstra shortest path"'}
      />
      <Btn
        $variant="primary"
        onClick={generateAnimation}
        disabled={loading || !input.trim()}
        style={{ marginTop: 10 }}
      >
        {loading ? '⚡ Generating…' : '✨ Animate It'}
      </Btn>

      {error && <AlertBox $type="warning" style={{ marginTop: 12 }}>⚠️ {error}</AlertBox>}

      {loading && <div style={{ marginTop: 24 }}><SkeletonLoader count={3} /></div>}

      {aiExplanation && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 18 }}>
          <ConceptCard>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', color: 'var(--green)', marginBottom: 8 }}>
              💡 CORE IDEA
            </div>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7 }}>{aiExplanation.concept}</p>
          </ConceptCard>
          {aiExplanation.steps?.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <SectionLabel>📋 Walkthrough</SectionLabel>
              {aiExplanation.steps.map((step, i) => (
                <ExplainStep key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <StepNum>{i + 1}</StepNum>
                  <span>{step}</span>
                </ExplainStep>
              ))}
            </div>
          )}
          {(aiExplanation.timeComplexity || aiExplanation.spaceComplexity) && (
            <ComplexityRow>
              {aiExplanation.timeComplexity && <ComplexityChip>⏱ {aiExplanation.timeComplexity}</ComplexityChip>}
              {aiExplanation.spaceComplexity && <ComplexityChip>💾 {aiExplanation.spaceComplexity}</ComplexityChip>}
            </ComplexityRow>
          )}
          {aiExplanation.interviewTip && (
            <AlertBox $type="warning" style={{ marginTop: 10 }}>
              🎤 <strong>Interview tip:</strong> {aiExplanation.interviewTip}
            </AlertBox>
          )}
        </motion.div>
      )}

      {aiVizData && (
        <div style={{ marginTop: 16 }}>
          {aiVizData.conceptExplain && (
            <ConceptCard style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', color: 'var(--green)', marginBottom: 6 }}>💡 CONCEPT</div>
              <p style={{ margin: 0, fontSize: 13 }}>{aiVizData.conceptExplain}</p>
            </ConceptCard>
          )}
          <Visualizer data={aiVizData} isAIGenerated />
        </div>
      )}
    </PageLayout>
  );
}