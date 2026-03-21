// client/src/pages/Problems.jsx
// Fix: uses CollapsibleSidebar instead of raw Sidebar for mobile expand/collapse
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import Visualizer from '../components/Visualizer.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';
import { apiFetch } from '../lib/api.js';
import { PRESETS } from '../lib/animations.js';
import {
  PageLayout, TwoColLayout, CollapsibleSidebar, MainContent,
  PageTitle, PageSubtitle, SectionLabel,
  Btn, DiffBadge, FilterBtn, FilterCount,
  ProgressBar, ProgressFill, EmptyBox, Input,
} from '../components/ui.jsx';

const useDebounce = (value, delay) => {
  const [d, setD] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setD(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return d;
};

const getPresetForProblem = (problem) => {
  const t = (problem.title || '').toLowerCase();
  if (t.includes('bubble sort'))       return PRESETS.bubbleSort();
  if (t.includes('binary search'))     return PRESETS.binarySearch();
  if (t.includes('two sum'))           return PRESETS.twoSum();
  if (t.includes('valid parentheses')) return PRESETS.validParentheses();
  if (t.includes('reverse linked'))    return PRESETS.reverseLinkedList();
  if (t.includes('insertion sort'))    return PRESETS.insertionSort();
  if (t.includes('selection sort'))    return PRESETS.selectionSort();
  if (t.includes('median') && t.includes('sorted')) return PRESETS.medianTwoSortedArrays?.();
  return null;
};

/* ── Local styled components ─────────────────────────────── */
const ProblemRow = styled(motion.div)`
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.bgRaised};
  margin-bottom: 8px;
  overflow: hidden;
  transition: border-color 0.15s;
  &:hover { border-color: ${({ theme }) => theme.colors.border}; }
`;

const ProblemHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 16px;
  cursor: pointer;
  user-select: none;
  &:hover { background: ${({ theme }) => theme.colors.bgSurface}; }
`;

const ProblemNum = styled.span`
  font-size: 12px;
  font-weight: 700;
  font-family: ${({ theme }) => theme.fonts.mono};
  color: ${({ theme }) => theme.colors.textMuted};
  min-width: 36px;
`;

const ProblemTitle = styled.span`
  font-size: 14px;
  font-weight: 600;
  flex: 1;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const SolvedMark = styled.span`
  color: ${({ theme }) => theme.colors.green};
  font-size: 13px;
  flex-shrink: 0;
`;

const ExpandBody = styled(motion.div)`
  padding: 0 16px 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
  overflow: hidden;
`;

const TopicTag = styled.span`
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.accentBg};
  color: ${({ theme }) => theme.colors.accent};
`;

const ExampleBox = styled.div`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 12px;
  background: ${({ theme }) => theme.colors.bgActive};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 10px 14px;
  border-radius: 8px;
  margin-bottom: 10px;
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow-x: auto;
`;

export default function Problems() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [problems,  setProblems]  = useState([]);
  const [meta,      setMeta]      = useState({ topics: [], companies: [] });
  const [solvedIds, setSolvedIds] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [animData,  setAnimData]  = useState({});
  const [animating, setAnimating] = useState(null);
  const [expanded,  setExpanded]  = useState(null);
  const [total,     setTotal]     = useState(0);
  const [visible,   setVisible]   = useState(20);

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchInput, 300);

  const topic      = searchParams.get('topic')      || '';
  const difficulty = searchParams.get('difficulty') || '';
  const company    = searchParams.get('company')    || '';

  const setParam = useCallback((key, val) => {
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      if (val) p.set(key, val); else p.delete(key);
      return p;
    });
  }, [setSearchParams]);

  useEffect(() => { setParam('search', debouncedSearch); }, [debouncedSearch]); // eslint-disable-line

  useEffect(() => {
    apiFetch('/api/problems/meta').then(setMeta).catch(console.error);
    apiFetch('/api/problems/solved').then(setSolvedIds).catch(() => {});
  }, []);

  useEffect(() => { setVisible(20); }, [topic, difficulty, company, debouncedSearch]);

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (topic)           qs.set('topic', topic);
    if (difficulty)      qs.set('difficulty', difficulty);
    if (company)         qs.set('company', company);
    if (debouncedSearch) qs.set('search', debouncedSearch);

    apiFetch(`/api/problems?${qs}`)
      .then(d => { setProblems(d.problems || d); setTotal(d.total || (d.problems || d).length); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [topic, difficulty, company, debouncedSearch]);

  const animateProblem = async (problem) => {
    if (animData[problem._id]) {
      setAnimData(p => { const n = { ...p }; delete n[problem._id]; return n; });
      return;
    }
    setAnimating(problem._id);
    try {
      const preset = getPresetForProblem(problem);
      if (preset) { setAnimData(p => ({ ...p, [problem._id]: preset })); return; }
      const d = await apiFetch('/api/animate', { method: 'POST', body: JSON.stringify({ input: `${problem.title}: ${problem.description || ''}` }) });
      setAnimData(p => ({ ...p, [problem._id]: d }));
    } catch (err) { alert('Animation failed: ' + err.message); }
    finally { setAnimating(null); }
  };

  const solvedCount = problems.filter(p => solvedIds.includes(p._id)).length;
  const visibleProblems = problems.slice(0, visible);

  const activeFilterCount = [topic, difficulty, company].filter(Boolean).length;

  return (
    <PageLayout $wide>
      <TwoColLayout>
        {/* ── Collapsible Sidebar (fix #1) ── */}
        <CollapsibleSidebar label={`Filters${activeFilterCount ? ` (${activeFilterCount})` : ''}`}>
          <SectionLabel>Topics</SectionLabel>
          <FilterBtn $active={!topic} onClick={() => setParam('topic', '')}>
            All <FilterCount>{total}</FilterCount>
          </FilterBtn>
          {meta.topics.map(t => (
            <FilterBtn key={t} $active={topic === t} onClick={() => setParam('topic', t)}>{t}</FilterBtn>
          ))}

          <SectionLabel style={{ marginTop: 16 }}>Difficulty</SectionLabel>
          {['', 'Easy', 'Medium', 'Hard'].map(d => (
            <FilterBtn key={d || 'all'} $active={difficulty === d} onClick={() => setParam('difficulty', d)}>
              {d || 'Any'}
            </FilterBtn>
          ))}

          <SectionLabel style={{ marginTop: 16 }}>Company</SectionLabel>
          <FilterBtn $active={!company} onClick={() => setParam('company', '')}>Any</FilterBtn>
          {meta.companies.slice(0, 10).map(c => (
            <FilterBtn key={c} $active={company === c} onClick={() => setParam('company', c)}>{c}</FilterBtn>
          ))}
        </CollapsibleSidebar>

        {/* ── Content ── */}
        <MainContent>
          <PageTitle initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            DSA Problems
          </PageTitle>
          <PageSubtitle>{problems.length} problems · {solvedCount} solved</PageSubtitle>

          <Input
            placeholder="Search problems…"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />

          {!loading && (
            <ProgressBar>
              <ProgressFill
                initial={{ width: 0 }}
                animate={{ width: `${total > 0 ? (solvedCount / total) * 100 : 0}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
            </ProgressBar>
          )}

          {loading ? <SkeletonLoader count={8} /> : (
            <>
              {visibleProblems.map((p, i) => (
                <ProblemRow
                  key={p._id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                >
                  <ProblemHeader onClick={() => setExpanded(e => e === p._id ? null : p._id)}>
                    <ProblemNum>#{p.leetcodeNum}</ProblemNum>
                    <ProblemTitle>{p.title}</ProblemTitle>
                    {solvedIds.includes(p._id) && <SolvedMark title="Solved">✓</SolvedMark>}
                    <DiffBadge difficulty={p.difficulty} />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 4 }}>
                      {expanded === p._id ? '▲' : '▼'}
                    </span>
                  </ProblemHeader>

                  <AnimatePresence>
                    {expanded === p._id && (
                      <ExpandBody
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                      >
                        <div style={{ paddingTop: 14 }}>
                          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 10 }}>
                            {p.description}
                          </p>
                          {p.examples?.[0] && <ExampleBox>{p.examples[0]}</ExampleBox>}
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
                            {p.topics?.map(t => <TopicTag key={t}>{t}</TopicTag>)}
                          </div>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <Btn $variant="primary" onClick={() => navigate(`/chat?problemId=${p._id}`)}>
                              🤖 Start with AI
                            </Btn>
                            <Btn onClick={() => animateProblem(p)} disabled={animating === p._id}>
                              {animating === p._id ? '⚡ Generating…' : animData[p._id] ? '✕ Hide' : '🎬 Animate'}
                            </Btn>
                          </div>
                          {animData[p._id] && (
                            <div style={{ marginTop: 16 }}>
                              <Visualizer data={animData[p._id]} />
                            </div>
                          )}
                        </div>
                      </ExpandBody>
                    )}
                  </AnimatePresence>
                </ProblemRow>
              ))}

              {visible < problems.length && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginTop: 20 }}>
                  <Btn onClick={() => setVisible(v => v + 20)}>
                    Show more ({problems.length - visible} remaining) ↓
                  </Btn>
                </div>
              )}

              {problems.length === 0 && (
                <EmptyBox>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
                  No problems match your filters.
                </EmptyBox>
              )}
            </>
          )}
        </MainContent>
      </TwoColLayout>
    </PageLayout>
  );
}