import { useState, useEffect, useRef } from 'react';

export default function Visualizer({ data }) {
  const [stepIdx,  setStepIdx]  = useState(0);
  const [playing,  setPlaying]  = useState(false);
  const intervalRef = useRef(null);

  const { title, vizType, timeComplexity, spaceComplexity, steps = [] } = data || {};
  const step = steps[stepIdx] || {};

  // Reset when data changes
  useEffect(() => {
    setStepIdx(0);
    setPlaying(false);
  }, [data]);

  // Play / pause interval
  useEffect(() => {
    if (!playing) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setStepIdx(s => {
        if (s >= steps.length - 1) { setPlaying(false); return s; }
        return s + 1;
      });
    }, 700);
    return () => clearInterval(intervalRef.current);
  }, [playing, steps.length]);

  if (!data || steps.length === 0) return null;

  const prev  = () => { setPlaying(false); setStepIdx(s => Math.max(0, s - 1)); };
  const next  = () => { setPlaying(false); setStepIdx(s => Math.min(steps.length - 1, s + 1)); };
  const reset = () => { setPlaying(false); setStepIdx(0); };

  // Determine box class for an index
  const boxClass = (i) => {
    if (step.sorted?.includes(i))    return 'box ok';
    if (step.highlight?.includes(i)) return 'box hi';
    if (step.compare?.includes(i))   return 'box cmp';
    return 'box';
  };

  return (
    <div style={{
      border: '1px solid #e2e8f0', borderRadius: '14px',
      background: '#fff', overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 18px', borderBottom: '1px solid #f1f5f9',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '8px', background: '#f8fafc'
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>{title}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            Time: <b>{timeComplexity}</b> · Space: <b>{spaceComplexity}</b>
          </div>
        </div>
        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
          Step {stepIdx + 1} / {steps.length}
        </div>
      </div>

      {/* Canvas */}
      <div style={{ padding: '24px 20px', minHeight: '120px' }}>
        {/* ── Array / Bars ── */}
        {(vizType === 'array' || vizType === 'bars' || vizType === 'slidingwindow') && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap',
            justifyContent: 'center', alignItems: 'flex-end' }}>
            {step.arr?.map((val, i) => {
              const ptr = Object.entries(step.pointers || {}).find(([, v]) => v === i);
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '4px' }}>
                  {ptr && (
                    <div style={{ fontSize: '10px', fontWeight: 700,
                      color: '#6366f1', letterSpacing: '0.5px' }}>
                      {ptr[0]}
                    </div>
                  )}
                  <div className={boxClass(i)}>
                    {val}
                    <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '1px' }}>{i}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── HashMap ── */}
        {vizType === 'hashmap' && (
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* Array row */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700,
                letterSpacing: '1px' }}>ARRAY</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {step.arr?.map((val, i) => {
                  const ptr = Object.entries(step.pointers || {}).find(([, v]) => v === i);
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: '4px' }}>
                      {ptr && (
                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#6366f1' }}>
                          {ptr[0]}
                        </div>
                      )}
                      <div className={boxClass(i)}>
                        {val}
                        <div style={{ fontSize: '9px', color: '#94a3b8' }}>{i}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* HashMap */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700,
                letterSpacing: '1px' }}>HASHMAP</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '120px' }}>
                {Object.keys(step.mapState || {}).length === 0 ? (
                  <div style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic',
                    padding: '8px', textAlign: 'center' }}>empty</div>
                ) : (
                  Object.entries(step.mapState || {}).map(([k, v]) => (
                    <div key={k} className="map-entry">
                      <span style={{ color: '#6366f1' }}>{k}</span>
                      <span style={{ color: '#94a3b8' }}>→</span>
                      <span>{v}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Stack ── */}
        {vizType === 'stack' && (
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center',
            alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* String being scanned */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700,
                letterSpacing: '1px' }}>STRING</div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {step.arr?.map((ch, i) => (
                  <div key={i} className={boxClass(i)} style={{ width: '36px', height: '36px' }}>
                    {ch}
                  </div>
                ))}
              </div>
            </div>

            {/* Stack */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700,
                letterSpacing: '1px' }}>STACK (top →)</div>
              <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '4px', minWidth: '80px' }}>
                {Object.keys(step.mapState || {}).length === 0 ? (
                  <div style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic',
                    padding: '8px 14px', textAlign: 'center', border: '2px dashed #e2e8f0',
                    borderRadius: '7px' }}>empty</div>
                ) : (
                  Object.values(step.mapState || {}).map((val, i) => (
                    <div key={i} className={`stack-frame ${i === Object.keys(step.mapState).length - 1 ? 'hi' : ''}`}>
                      {val}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step explanation */}
      <div style={{
        margin: '0 16px 16px', padding: '12px 14px', borderRadius: '8px',
        background: '#f8fafc', border: '1px solid #e2e8f0',
        fontSize: '13px', lineHeight: 1.6, color: '#334155', minHeight: '42px'
      }}>
        {step.explain || '—'}
      </div>

      {/* Dot progress */}
      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center',
        padding: '0 16px 12px', flexWrap: 'wrap' }}>
        {steps.map((_, i) => (
          <div key={i} onClick={() => { setPlaying(false); setStepIdx(i); }}
            style={{
              width: i === stepIdx ? '18px' : '7px',
              height: '7px', borderRadius: '4px', cursor: 'pointer',
              background: i === stepIdx ? '#6366f1' : i < stepIdx ? '#a5b4fc' : '#e2e8f0',
              transition: 'all 0.2s',
            }} />
        ))}
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex', gap: '8px', justifyContent: 'center',
        padding: '0 16px 18px'
      }}>
        <button onClick={reset} style={btnStyle('#f1f5f9', '#475569')}>↩ Reset</button>
        <button onClick={prev}  disabled={stepIdx === 0}
          style={btnStyle('#f1f5f9', stepIdx === 0 ? '#cbd5e1' : '#475569')}>
          ← Prev
        </button>
        <button onClick={() => setPlaying(p => !p)}
          style={btnStyle(playing ? '#fef9c3' : '#6366f1', playing ? '#92400e' : '#fff', playing)}>
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>
        <button onClick={next} disabled={stepIdx === steps.length - 1}
          style={btnStyle('#f1f5f9', stepIdx === steps.length - 1 ? '#cbd5e1' : '#475569')}>
          Next →
        </button>
      </div>
    </div>
  );
}

function btnStyle(bg, color, isPlay = false) {
  return {
    padding: '8px 16px', borderRadius: '8px', fontSize: '13px',
    fontWeight: 600, border: isPlay ? 'none' : '1px solid #e2e8f0',
    background: bg, color, cursor: 'pointer', transition: 'all 0.15s'
  };
}