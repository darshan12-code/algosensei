// client/src/components/Visualizer.jsx


import { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import Tooltip from './Tooltip';
import { Badge, AIBadge } from './ui.jsx';

/* ── Styled components ───────────────────────────────────── */
const Container = styled.div`
  background: ${({ theme }) => theme.colors.bgSurface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  overflow: hidden;
  margin-top: 16px;
`;

const VizHeader = styled.div`
  padding: 14px 18px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
`;

const VizTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const ComplexityBadges = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 4px;
`;

const StepCount = styled.div`
  font-size: 12px;
  font-family: ${({ theme }) => theme.fonts.mono};
  color: ${({ theme }) => theme.colors.textMuted};
  white-space: nowrap;
`;

const Canvas = styled.div`
  padding: 24px 18px;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-x: auto;
`;

const ExplainBox = styled(motion.div)`
  padding: 12px 18px;
  font-size: 13px;
  line-height: 1.65;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: ${({ theme }) => theme.colors.bgRaised};
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
  min-height: 52px;
`;

const Controls = styled.div`
  padding: 12px 18px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const CtrlBtn = styled.button`
  padding: 6px 14px;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ $active, theme }) => $active ? theme.colors.accentBg : theme.colors.bgHover};
  color: ${({ $active, theme }) => $active ? theme.colors.accent : theme.colors.textSecondary};
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover { border-color: ${({ theme }) => theme.colors.accentBorder}; color: ${({ theme }) => theme.colors.accent}; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

const SpeedRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  max-width: 200px;
`;

const SpeedLabel = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
  min-width: 14px;
`;

// FIX: slider now controls "stepsPerSecond" (1–10), not raw ms.
// Left (min=1) = slow = 1000ms delay. Right (max=10) = fast = 100ms delay.
const SpeedSlider = styled.input`
  flex: 1;
  accent-color: ${({ theme }) => theme.colors.accent};
  cursor: pointer;
`;

const SpeedText = styled.span`
  font-size: 11px;
  font-family: ${({ theme }) => theme.fonts.mono};
  color: ${({ theme }) => theme.colors.textMuted};
  min-width: 32px;
  text-align: right;
`;

const Dots = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-left: auto;
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $active, $done, theme }) =>
    $active ? theme.colors.accent : $done ? theme.colors.textMuted : theme.colors.bgHover};
  cursor: pointer;
  transition: background 0.2s;
`;

// Box classes applied via GlobalStyles — defined here for reference:
// .box       → base
// .box.hi    → highlight (amber)
// .box.cmp   → compare (blue)
// .box.ok    → sorted/done (green)
// .box.pvt   → pivot (red)

/* ── Component ──────────────────────────────────────────── */
export default function Visualizer({ data, isAIGenerated }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  // FIX: stepsPerSecond (1=slow/left … 10=fast/right)
  // Converts to ms: delay = 1100 - (sps * 100)  → sps=1 → 1000ms, sps=10 → 100ms
  const [stepsPerSec, setStepsPerSec] = useState(1); // default: 1 step/s
  const intervalRef = useRef(null);

  const { title, vizType, timeComplexity, spaceComplexity, steps = [] } = data || {};
  const step = steps[stepIdx] || {};

  // Convert stepsPerSec to interval ms
  const intervalMs = Math.round(1100 - stepsPerSec * 100);

  useEffect(() => { setStepIdx(0); setPlaying(false); }, [data]);

  const advance = useCallback(() => {
    setStepIdx(s => {
      if (s >= steps.length - 1) { setPlaying(false); return s; }
      return s + 1;
    });
  }, [steps.length]);

  useEffect(() => {
    if (!playing) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(advance, intervalMs);
    return () => clearInterval(intervalRef.current);
  }, [playing, intervalMs, advance]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft')  { setPlaying(false); setStepIdx(s => Math.max(0, s - 1)); }
      if (e.key === 'ArrowRight') { setPlaying(false); setStepIdx(s => Math.min(steps.length - 1, s + 1)); }
      if (e.key === ' ')          { e.preventDefault(); setPlaying(p => !p); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [steps.length]);

  if (!data || steps.length === 0) return null;

  const boxClass = (i) => {
    if (step.sorted?.includes(i))    return 'box ok';
    if (step.highlight?.includes(i)) return 'box hi';
    if (step.compare?.includes(i))   return 'box cmp';
    if (step.pivot === i)            return 'box pvt';
    return 'box';
  };

  const renderCanvas = () => {
    const type = vizType || 'array';

    if (type === 'bars') {
      const maxVal = Math.max(...(step.arr || [1]));
      return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '120px', width: '100%', justifyContent: 'center' }}>
          {step.arr?.map((val, i) => {
            const color = step.sorted?.includes(i) ? '#22c55e' : step.highlight?.includes(i) ? '#fbbf24' : step.compare?.includes(i) ? '#60a5fa' : '#6366f1';
            return (
              <motion.div
                key={i} layout
                style={{
                  flex: 1, maxWidth: '40px', borderRadius: '4px 4px 0 0',
                  background: color,
                  height: `${Math.max((val / maxVal) * 100, 6)}%`,
                  transition: 'height 0.35s ease, background 0.35s ease',
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '4px',
                }}
              >
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', opacity: 0.8 }}>{val}</span>
              </motion.div>
            );
          })}
        </div>
      );
    }

    if (type === 'hashmap') {
      return (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', color: 'var(--text-muted)' }}>ARRAY</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {step.arr?.map((val, i) => {
                const ptr = Object.entries(step.pointers || {}).find(([, v]) => v === i);
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    {ptr && <div style={{ fontSize: '9px', fontWeight: 700, color: '#6366f1' }}>{ptr[0]}</div>}
                    <div className={boxClass(i)}>{val}<div style={{ fontSize: '8px', color: '#94a3b8' }}>{i}</div></div>
                  </div>
                );
              })}
            </div>
          </div>
          {Object.keys(step.mapState || {}).length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', color: 'var(--text-muted)' }}>MAP</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {Object.entries(step.mapState).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: '6px', padding: '4px 10px', borderRadius: '6px', background: 'rgba(99,102,241,0.12)', fontSize: '12px', fontWeight: 600, fontFamily: 'monospace' }}>
                    <span style={{ color: '#818cf8' }}>{k}</span>
                    <span style={{ color: 'var(--text-muted)' }}>→</span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (type === 'stack') {
      const stackEntries = Object.entries(step.mapState || {});
      return (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', color: 'var(--text-muted)' }}>INPUT</div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {step.arr?.map((val, i) => <div key={i} className={boxClass(i)}>{val}</div>)}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', color: 'var(--text-muted)' }}>STACK</div>
            <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '3px', minHeight: '60px', justifyContent: 'flex-start' }}>
              {stackEntries.map(([k, v]) => (
                <div key={k} style={{ padding: '6px 16px', borderRadius: '6px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', fontSize: '13px', fontWeight: 700, textAlign: 'center', fontFamily: 'monospace' }}>{v}</div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Default: array / sliding window
    return (
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-end' }}>
        {step.arr?.map((val, i) => {
          const ptr = Object.entries(step.pointers || {}).find(([, v]) => v === i);
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              {ptr && <div style={{ fontSize: '10px', fontWeight: 700, color: '#6366f1' }}>{ptr[0]}</div>}
              <div className={boxClass(i)}>
                {val}
                <div style={{ fontSize: '8px', color: '#94a3b8', marginTop: '1px' }}>{i}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Container>
      <VizHeader>
        <div>
          <VizTitle>{title}</VizTitle>
          <ComplexityBadges>
            <Badge>Time: {timeComplexity}</Badge>
            <Badge>Space: {spaceComplexity}</Badge>
            {isAIGenerated && <AIBadge>✨ AI</AIBadge>}
          </ComplexityBadges>
        </div>
        <StepCount>Step {stepIdx + 1} / {steps.length}</StepCount>
      </VizHeader>

      <Canvas>{renderCanvas()}</Canvas>

      <AnimatePresence mode="wait">
        <ExplainBox key={stepIdx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {step.explain}
        </ExplainBox>
      </AnimatePresence>

      <Controls>
        <Tooltip text="Restart">
          <CtrlBtn onClick={() => { setPlaying(false); setStepIdx(0); }}>↩</CtrlBtn>
        </Tooltip>
        <Tooltip text="Previous (← key)">
          <CtrlBtn onClick={() => { setPlaying(false); setStepIdx(s => Math.max(0, s - 1)); }} disabled={stepIdx === 0}>◀</CtrlBtn>
        </Tooltip>
        <Tooltip text={playing ? 'Pause (Space)' : 'Play (Space)'}>
          <CtrlBtn $active={playing} onClick={() => setPlaying(p => !p)}>
            {playing ? '⏸' : '▶'}
          </CtrlBtn>
        </Tooltip>
        <Tooltip text="Next (→ key)">
          <CtrlBtn onClick={() => { setPlaying(false); setStepIdx(s => Math.min(steps.length - 1, s + 1)); }} disabled={stepIdx === steps.length - 1}>▶</CtrlBtn>
        </Tooltip>

        {/* FIX: left = slow (🐢), right = fast (⚡) */}
        <Tooltip text="Speed: left = slow, right = fast">
          <SpeedRow>
            <SpeedLabel>🐢</SpeedLabel>
            <SpeedSlider
              type="range"
              min={1}
              max={10}
              step={1}
              value={stepsPerSec}
              onChange={e => setStepsPerSec(+e.target.value)}
            />
            <SpeedLabel>⚡</SpeedLabel>
          </SpeedRow>
        </Tooltip>
        <SpeedText>{stepsPerSec}×</SpeedText>

        <Dots>
          {steps.map((_, i) => (
            <Dot key={i} $active={i === stepIdx} $done={i < stepIdx} onClick={() => { setPlaying(false); setStepIdx(i); }} />
          ))}
        </Dots>
      </Controls>
    </Container>
  );
}