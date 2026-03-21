// client/src/pages/Visualize.jsx
import { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Visualizer from '../components/Visualizer.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';
import { PRESETS, getFallbackAnimation } from '../lib/animations.js';
import { apiFetch } from '../lib/api.js';
import {
  PageLayout, PageTitle, PageSubtitle, SectionLabel,
  Btn, Badge, OrDivider, AlertBox, ConceptCard, Textarea,
} from '../components/ui.jsx';

/* ── Local styled components ────────────────────────────── */
const PresetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 8px;
  margin-bottom: 24px;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const PresetBtn = styled(motion.button)`
  padding: 11px 14px;
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
  align-items: center;
  gap: 6px;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accentBorder};
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const ExplainStep = styled(motion.div)`
  display: flex;
  gap: 12px;
  margin-bottom: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.bgSurface};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  font-size: 13px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const StepNum = styled.span`
  min-width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.accentBg};
  color: ${({ theme }) => theme.colors.accent};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
`;

const ComplexityRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 12px;
`;

const ComplexityChip = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  background: ${({ theme }) => theme.colors.bgSurface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 12px;
  font-family: ${({ theme }) => theme.fonts.mono};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

/* ── Data ───────────────────────────────────────────────── */
const PRESET_BUTTONS = [
  { key: 'bubbleSort',            label: '🫧 Bubble Sort',           diff: 'Easy' },
  { key: 'selectionSort',         label: '📌 Selection Sort',         diff: 'Easy' },
  { key: 'insertionSort',         label: '📥 Insertion Sort',         diff: 'Easy' },
  { key: 'binarySearch',          label: '🔍 Binary Search',          diff: 'Easy' },
  { key: 'twoSum',                label: '➕ Two Sum',                diff: 'Easy' },
  { key: 'validParentheses',      label: '🔲 Valid Parentheses',      diff: 'Medium' },
  { key: 'reverseLinkedList',     label: '↩ Reverse Linked List',     diff: 'Easy' },
  { key: 'medianTwoSortedArrays', label: '⚖️ Median Two Arrays',     diff: 'Hard' },
];

/* ── Component ──────────────────────────────────────────── */
export default function Visualize() {
  const [vizData,       setVizData]       = useState(null);
  const [input,         setInput]         = useState('');
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');
  const [activeKey,     setActiveKey]     = useState('');
  const [isAI,          setIsAI]          = useState(false);
  const [aiExplanation, setAiExplanation] = useState(null);

  const loadPreset = (key) => {
    setActiveKey(key); setError(''); setIsAI(false); setAiExplanation(null);
    if (PRESETS[key]) setVizData(PRESETS[key]());
  };

  const generateAnimation = async () => {
    if (!input.trim()) return;
    setLoading(true); setError(''); setActiveKey(''); setIsAI(true); setAiExplanation(null);

    try {
      const data = await apiFetch('/api/animate', { method: 'POST', body: JSON.stringify({ input }) });
      if (!data.steps?.length) throw new Error('No animation steps generated');
      setVizData(data);
    } catch {
      setError('Animation not available for this problem. Showing explanation instead:');
      setIsAI(false);
      try {
        const exp = await apiFetch('/api/animate/explain', { method: 'POST', body: JSON.stringify({ input }) });
        setAiExplanation(exp);
      } catch {
        setVizData(getFallbackAnimation(input));
        setError('Could not generate animation or explanation. Showing closest match.');
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
        Step through DSA algorithms visually. Use ← → or Space to control playback.
      </PageSubtitle>

      <SectionLabel>Pre-built Animations</SectionLabel>
      <PresetGrid>
        {PRESET_BUTTONS.map(({ key, label, diff }) => (
          <PresetBtn
            key={key}
            $active={activeKey === key}
            onClick={() => loadPreset(key)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {label}
            {diff === 'Hard' && (
              <Badge $color="red" style={{ fontSize: 9, padding: '1px 5px' }}>HARD</Badge>
            )}
          </PresetBtn>
        ))}
      </PresetGrid>

      <OrDivider>OR</OrDivider>

      <SectionLabel>AI Animation Generator</SectionLabel>
      <Textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        rows={4}
        placeholder={'Paste a problem or algorithm name:\n"Find two numbers that sum to target"\n"Sliding window maximum"'}
      />
      <Btn
        $variant="primary"
        onClick={generateAnimation}
        disabled={loading || !input.trim()}
        style={{ marginTop: 10 }}
      >
        {loading ? '⚡ Generating…' : '✨ Animate It'}
      </Btn>

      {error && <AlertBox $type="warning" style={{ marginTop: 14 }}>⚠️ {error}</AlertBox>}

      {/* AI text explanation fallback */}
      {aiExplanation && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 20 }}>
          <ConceptCard>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', color: 'var(--green)', marginBottom: 8 }}>
              💡 CORE IDEA
            </div>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7 }}>{aiExplanation.concept}</p>
          </ConceptCard>

          {aiExplanation.steps?.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <SectionLabel>📋 Algorithm Walkthrough</SectionLabel>
              {aiExplanation.steps.map((step, i) => (
                <ExplainStep
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <StepNum>{i + 1}</StepNum>
                  <span>{step}</span>
                </ExplainStep>
              ))}
            </div>
          )}

          {(aiExplanation.timeComplexity || aiExplanation.spaceComplexity) && (
            <ComplexityRow>
              {aiExplanation.timeComplexity && (
                <ComplexityChip>⏱ Time: {aiExplanation.timeComplexity}</ComplexityChip>
              )}
              {aiExplanation.spaceComplexity && (
                <ComplexityChip>💾 Space: {aiExplanation.spaceComplexity}</ComplexityChip>
              )}
            </ComplexityRow>
          )}

          {aiExplanation.interviewTip && (
            <AlertBox $type="warning" style={{ marginTop: 12 }}>
              🎤 <strong>Interview tip:</strong> {aiExplanation.interviewTip}
            </AlertBox>
          )}
        </motion.div>
      )}

      {loading && <div style={{ marginTop: 24 }}><SkeletonLoader count={3} /></div>}

      {vizData?.conceptExplain && (
        <ConceptCard>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', color: 'var(--green)', marginBottom: 6 }}>
            💡 CORE CONCEPT
          </div>
          <p style={{ margin: 0 }}>{vizData.conceptExplain}</p>
          {vizData.interviewTip && (
            <p style={{ color: 'var(--text-muted)', marginTop: 8, fontStyle: 'italic', fontSize: 13 }}>
              🎤 {vizData.interviewTip}
            </p>
          )}
        </ConceptCard>
      )}

      {vizData && <div style={{ marginTop: 16 }}><Visualizer data={vizData} isAIGenerated={isAI} /></div>}

      {!vizData && !loading && !aiExplanation && (
        <div style={{ textAlign: 'center', padding: '56px 24px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎬</div>
          <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
            Pick a preset or paste a problem above
          </div>
          <div style={{ fontSize: 13 }}>Use keyboard: ← → to step, Space to play/pause</div>
        </div>
      )}
    </PageLayout>
  );
}