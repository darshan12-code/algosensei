// src/components/Visualizer.jsx
// Key fixes in this version:
//
// 1. normalizeStep() — runs on every step before rendering, fixes AI data quality bugs:
//    - Tree nodes with pixel x/y → converted to grid coords automatically
//    - visitedNodes like [12, 123] → split into [1,2], [1,2,3]
//    - arr like [715364] (one big number) → split into [7,1,5,3,6,4]
//    - treeNodes where left/right is an object (nested) → flattened to just the id
//
// 2. Tree renderer now uses a proper auto-layout algorithm instead of
//    trusting AI-provided x/y coordinates (which are always wrong).

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
  display: flex; justify-content: space-between; align-items: flex-start;
  gap: 12px; flex-wrap: wrap;
`;
const VizTitle = styled.div`font-size: 14px; font-weight: 700; color: ${({ theme }) => theme.colors.textPrimary};`;
const ComplexityBadges = styled.div`display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px;`;
const StepCount = styled.div`
  font-size: 12px; font-family: ${({ theme }) => theme.fonts.mono};
  color: ${({ theme }) => theme.colors.textMuted}; white-space: nowrap;
`;
const Canvas = styled.div`
  padding: 24px 18px; min-height: 160px;
  display: flex; align-items: center; justify-content: center;
  overflow-x: auto;
`;
const ExplainBox = styled(motion.div)`
  padding: 12px 18px; font-size: 13px; line-height: 1.65;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: ${({ theme }) => theme.colors.bgRaised};
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
  min-height: 52px;
`;
const Controls = styled.div`
  padding: 12px 18px; border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
`;
const CtrlBtn = styled.button`
  padding: 6px 14px; border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ $active, theme }) => $active ? theme.colors.accentBg : theme.colors.bgHover};
  color: ${({ $active, theme }) => $active ? theme.colors.accent : theme.colors.textSecondary};
  font-size: 13px; cursor: pointer; transition: all 0.15s;
  display: flex; align-items: center; justify-content: center;
  &:hover { border-color: ${({ theme }) => theme.colors.accentBorder}; color: ${({ theme }) => theme.colors.accent}; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;
const SpeedRow = styled.div`display: flex; align-items: center; gap: 6px; flex: 1; max-width: 200px;`;
const SpeedLabel = styled.span`font-size: 11px; color: ${({ theme }) => theme.colors.textMuted}; min-width: 14px;`;
const SpeedSlider = styled.input`flex: 1; accent-color: ${({ theme }) => theme.colors.accent}; cursor: pointer;`;
const SpeedText = styled.span`
  font-size: 11px; font-family: ${({ theme }) => theme.fonts.mono};
  color: ${({ theme }) => theme.colors.textMuted}; min-width: 32px; text-align: right;
`;
const Dots = styled.div`display: flex; gap: 4px; flex-wrap: wrap; margin-left: auto;`;
const Dot = styled.div`
  width: 8px; height: 8px; border-radius: 50%;
  background: ${({ $active, $done, theme }) =>
    $active ? theme.colors.accent : $done ? theme.colors.textMuted : theme.colors.bgHover};
  cursor: pointer; transition: background 0.2s;
`;

/* ═══════════════════════════════════════════════════════════
   DATA NORMALIZATION — fixes ALL known AI output bugs
   ═══════════════════════════════════════════════════════════

   Bug catalogue (all seen in real console logs):
   A. arr: [715364]          — AI concatenated [7,1,5,3,6,4] into one number
   B. visitedNodes: [12,123] — AI concatenated node IDs [1,2], [1,2,3]
   C. sorted: ["012345"]     — AI put a string of indices instead of number array
   D. treeNodes[i].left = { id:2, val:9, ... } — nested object instead of id number
   E. treeNodes with val:0 at x:0,y:0 — AI placeholder nodes that don't exist yet
   F. x,y are pixel coords (100,150) instead of grid coords (1,2) — always wrong
   G. "Construct Binary Tree" — left/right nested objects are DEEPLY nested (3 levels)
   H. "Best Time to Buy and Sell" — vizType:'array' but has buy/sell pointers → needs twoptr
   ═══════════════════════════════════════════════════════════ */

// Fix B & C: arrays of IDs that got concatenated into numbers like [12, 123, 12345]
function fixIdArray(arr) {
  if (!Array.isArray(arr)) return [];
  const result = [];
  for (const item of arr) {
    if (typeof item === 'string') {
      // e.g. "012345" → [0,1,2,3,4,5]
      item.split('').forEach(d => { const n = Number(d); if (!isNaN(n)) result.push(n); });
    } else if (typeof item === 'number' && item > 9) {
      // e.g. 12345 → [1,2,3,4,5]
      String(item).split('').forEach(d => result.push(Number(d)));
    } else {
      result.push(item);
    }
  }
  return [...new Set(result)];
}

// Fix A: arr:[715364] → [7,1,5,3,6,4]
function fixArr(arr) {
  if (!Array.isArray(arr)) return arr;
  if (arr.length === 1 && typeof arr[0] === 'number' && arr[0] > 99) {
    return String(arr[0]).split('').map(Number);
  }
  return arr;
}

// Fix D & G: recursively extract all real nodes from deeply nested treeNodes structure.
// AI sometimes nests the entire subtree inside left/right instead of using IDs.
// e.g. node.left = { id:2, val:9, left: { id:4, ... }, right: null }
// We flatten this into a flat array of { id, val, left:id|null, right:id|null }
function flattenTreeNodes(nodes) {
  if (!Array.isArray(nodes)) return [];

  const collected = new Map(); // id → flat node

  function extractNode(n) {
    if (!n || typeof n !== 'object' || n.id == null) return;
    // Already processed
    if (collected.has(n.id)) {
      // Update left/right if this version has them and stored version doesn't
      const stored = collected.get(n.id);
      if (stored.left == null && n.left != null) stored.left = typeof n.left === 'object' ? n.left?.id ?? null : n.left;
      if (stored.right == null && n.right != null) stored.right = typeof n.right === 'object' ? n.right?.id ?? null : n.right;
      // Recurse into children even if parent was already seen
      if (n.left  && typeof n.left  === 'object') extractNode(n.left);
      if (n.right && typeof n.right === 'object') extractNode(n.right);
      return;
    }
    const leftId  = n.left  == null ? null : typeof n.left  === 'object' ? n.left?.id  ?? null : n.left;
    const rightId = n.right == null ? null : typeof n.right === 'object' ? n.right?.id ?? null : n.right;
    collected.set(n.id, { id: n.id, val: n.val, left: leftId, right: rightId });
    // Recurse into children
    if (n.left  && typeof n.left  === 'object') extractNode(n.left);
    if (n.right && typeof n.right === 'object') extractNode(n.right);
  }

  nodes.forEach(extractNode);
  return [...collected.values()];
}

// Fix E: remove placeholder nodes (val=0, no children, at position 0,0)
// These are "slots" the AI allocates before filling the tree in later steps.
// Keep them if they're real zero-value nodes (have children or non-zero position).
function filterPlaceholders(nodes) {
  if (!Array.isArray(nodes)) return nodes;
  // Count how many val=0 nodes exist
  const zeroCount = nodes.filter(n => n.val === 0 && n.left == null && n.right == null).length;
  // If more than half the nodes are val=0 with no children, filter them out
  if (zeroCount > nodes.length / 2) {
    return nodes.filter(n => !(n.val === 0 && n.left == null && n.right == null));
  }
  return nodes;
}

// Fix F + layout: compute correct x,y positions via inorder traversal.
// Ignores AI-provided x,y entirely.
function computeTreeLayout(nodes) {
  if (!nodes?.length) return { positions: {}, nodeMap: {} };

  // Build nodeMap (already flat from flattenTreeNodes)
  const nodeMap = {};
  nodes.forEach(n => { nodeMap[n.id] = n; });

  // Find root = node whose id doesn't appear as anyone's left or right child
  const childIds = new Set();
  nodes.forEach(n => {
    if (n.left  != null) childIds.add(n.left);
    if (n.right != null) childIds.add(n.right);
  });
  const rootId = nodes.map(n => n.id).find(id => !childIds.has(id));
  if (rootId == null) return { positions: {}, nodeMap };

  // Assign x via inorder traversal (gives natural BST-style spacing)
  const positions = {};
  let xCounter = 0;

  function inorder(id, depth) {
    if (id == null || !nodeMap[id]) return;
    inorder(nodeMap[id].left, depth + 1);
    positions[id] = { x: xCounter, y: depth };
    xCounter++;
    inorder(nodeMap[id].right, depth + 1);
  }
  inorder(rootId, 0);

  return { positions, nodeMap };
}

// Detect if vizType should be overridden based on step data
// Fix H: array + buy/sell pointers → should be twoptr
function fixVizType(vizType, steps) {
  if (!steps?.length) return vizType;
  const firstStep = steps[0];
  if (vizType === 'array' && firstStep?.pointers) {
    const pKeys = Object.keys(firstStep.pointers);
    if (pKeys.includes('buy') || pKeys.includes('sell') ||
        pKeys.includes('L')   || pKeys.includes('R')   ||
        pKeys.includes('maxReach')) {
      return 'twoptr';
    }
  }
  return vizType;
}

// Master normalizer — runs on every step before rendering
function normalizeStep(step) {
  if (!step) return step;
  const s = { ...step };

  // Fix concatenated ID arrays (visitedNodes, highlight, compare, sorted)
  if (s.visitedNodes) s.visitedNodes = fixIdArray(s.visitedNodes);
  if (s.highlight)    s.highlight    = fixIdArray(s.highlight);
  if (s.compare)      s.compare      = fixIdArray(s.compare);
  if (s.sorted)       s.sorted       = Array.isArray(s.sorted) ? fixIdArray(s.sorted) : [];

  // Fix concatenated arr
  if (s.arr) s.arr = fixArr(s.arr);

  // Fix treeNodes: flatten nested objects, remove placeholders
  if (s.treeNodes != null) {
    if (s.treeNodes === 'same') {
      // keep as-is, resolved in renderer
    } else if (Array.isArray(s.treeNodes)) {
      let nodes = flattenTreeNodes(s.treeNodes);
      nodes = filterPlaceholders(nodes);
      s.treeNodes = nodes;
    }
  }

  return s;
}

/* ═══════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function Visualizer({ data, isAIGenerated }) {
  const [stepIdx,     setStepIdx]     = useState(0);
  const [playing,     setPlaying]     = useState(false);
  const [stepsPerSec, setStepsPerSec] = useState(1);
  const intervalRef = useRef(null);

  const { title, vizType: rawVizType, timeComplexity, spaceComplexity, steps = [] } = data || {};

  // Fix H: override vizType if AI chose wrong type based on step data shape
  const vizType = fixVizType(rawVizType, steps);
  const normalizedSteps = steps.map(s => normalizeStep(s));
  const step = normalizedSteps[stepIdx] || {};

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

  if (!data) return <div style={{ padding: 20, color: 'var(--red)', fontSize: 13 }}>⚠️ No data received by Visualizer</div>;
  if (steps.length === 0) return <div style={{ padding: 20, color: 'var(--amber)', fontSize: 13 }}>⚠️ Data received but 0 steps — vizType: {vizType}</div>;

  const boxClass = (i) => {
    if (step.sorted?.includes(i))    return 'box ok';
    if (step.highlight?.includes(i)) return 'box hi';
    if (step.compare?.includes(i))   return 'box cmp';
    if (step.pivot === i)            return 'box pvt';
    return 'box';
  };

  const renderCanvas = () => {
    const type = vizType || 'array';

    /* ── BARS ─────────────────────────────────────── */
    if (type === 'bars') {
      const arr = step.arr || [];
      const maxVal = Math.max(...arr, 1);
      return (
        <div style={{ display:'flex', alignItems:'flex-end', gap:'4px', height:'120px', width:'100%', justifyContent:'center' }}>
          {arr.map((val, i) => {
            const color = step.sorted?.includes(i) ? '#22c55e'
              : step.highlight?.includes(i) ? '#fbbf24'
              : step.compare?.includes(i)   ? '#60a5fa'
              : '#6366f1';
            return (
              <motion.div key={i} layout style={{
                flex:1, maxWidth:'40px', borderRadius:'4px 4px 0 0', background:color,
                height:`${Math.max((val/maxVal)*100,6)}%`,
                transition:'height 0.35s ease, background 0.35s ease',
                display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop:'4px',
              }}>
                <span style={{ fontSize:'10px', fontWeight:700, color:'#fff', opacity:0.8 }}>{val}</span>
              </motion.div>
            );
          })}
        </div>
      );
    }

    /* ── TREE ─────────────────────────────────────── */
    if (type === 'tree') {
      // Resolve treeNodes — carry forward from previous step if 'same'
      const resolveNodes = () => {
        if (Array.isArray(step.treeNodes) && step.treeNodes.length > 0) return step.treeNodes;
        for (let i = stepIdx - 1; i >= 0; i--) {
          const prev = normalizedSteps[i]?.treeNodes;
          if (Array.isArray(prev) && prev.length > 0) return prev;
        }
        return [];
      };
      const rawNodes = resolveNodes();
      if (!rawNodes.length) return <div style={{ color:'var(--text-muted)', fontSize:13 }}>No tree nodes in this step</div>;

      const { positions, nodeMap } = computeTreeLayout(rawNodes);
      if (!positions || !nodeMap) return null;

      // SVG dimensions based on tree width/height
      const maxX = Math.max(...Object.values(positions).map(p => p.x), 1);
      const maxY = Math.max(...Object.values(positions).map(p => p.y), 0);
      const cellW = Math.max(44, Math.min(60, 340 / (maxX + 1)));
      const cellH = 60;
      const W = (maxX + 1) * cellW + 20;
      const H = (maxY + 1) * cellH + 30;
      const gx = x => x * cellW + 10;
      const gy = y => y * cellH + 30;

      const activeId   = step.activeNode;
      const visitedIds = new Set(step.visitedNodes || []);

      return (
        <div style={{ width:'100%', overflowX:'auto' }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', maxWidth: Math.min(W * 2, 520), display:'block', margin:'0 auto' }}>
            {/* Draw edges */}
            {Object.values(nodeMap).map(node => {
              const pos = positions[node.id];
              if (!pos) return null;
              return ['left','right'].map(dir => {
                const childId = node[dir];
                const childPos = childId && positions[childId];
                if (!childPos) return null;
                return (
                  <line key={`e-${node.id}-${dir}`}
                    x1={gx(pos.x)} y1={gy(pos.y) + 16}
                    x2={gx(childPos.x)} y2={gy(childPos.y) - 16}
                    stroke="var(--border)" strokeWidth="1.5"
                  />
                );
              });
            })}
            {/* Draw nodes */}
            {Object.values(nodeMap).map(node => {
              const pos = positions[node.id];
              if (!pos) return null;
              const isActive  = activeId === node.id;
              const isVisited = visitedIds.has(node.id);
              // Filter out placeholder nodes (val=0 at x=0,y=0 — AI sometimes adds these)
              if (node.val === 0 && rawNodes.filter(n => n.val === 0).length > rawNodes.length / 2) return null;

              return (
                <g key={node.id}>
                  <motion.circle
                    cx={gx(pos.x)} cy={gy(pos.y)} r="16"
                    fill={isActive ? '#6366f1' : isVisited ? 'rgba(34,197,94,0.25)' : 'var(--bg-surface)'}
                    stroke={isActive ? '#818cf8' : isVisited ? '#22c55e' : 'var(--border)'}
                    strokeWidth="2"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                  <text
                    x={gx(pos.x)} y={gy(pos.y) + 5}
                    textAnchor="middle"
                    fill={isActive ? '#fff' : isVisited ? '#22c55e' : 'var(--text-primary)'}
                    fontSize="13" fontWeight="700" fontFamily="monospace"
                  >
                    {node.val}
                  </text>
                </g>
              );
            })}
          </svg>
          {/* Output array (for traversal problems) */}
          {step.arr?.length > 0 && (
            <div style={{ display:'flex', gap:'4px', justifyContent:'center', marginTop:'8px', flexWrap:'wrap' }}>
              <span style={{ fontSize:'11px', color:'var(--text-muted)', alignSelf:'center', marginRight:'4px' }}>Output:</span>
              {step.arr.map((v,i) => (
                <div key={i} style={{ width:'28px', height:'28px', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'4px', background:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.4)', fontSize:'12px', fontWeight:700, fontFamily:'monospace', color:'#22c55e' }}>{v}</div>
              ))}
            </div>
          )}
        </div>
      );
    }

    /* ── TWO POINTERS ──────────────────────────── */
    if (type === 'twoptr') {
      const arr = step.arr || [];
      const infoEntries = Object.entries(step.mapState || {});
      return (
        <div style={{ display:'flex', flexDirection:'column', gap:'16px', width:'100%' }}>
          <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', justifyContent:'center', alignItems:'flex-end' }}>
            {arr.map((val, i) => {
              const isL   = step.pointers?.L === i || step.pointers?.left  === i || step.pointers?.buy  === i;
              const isR   = step.pointers?.R === i || step.pointers?.right === i || step.pointers?.sell === i;
              const isI   = step.pointers?.i === i;
              const isMR  = step.pointers?.maxReach === i;
              const label = isL ? (step.pointers?.buy !== undefined ? 'buy' : 'L')
                          : isR ? (step.pointers?.sell !== undefined ? 'sell' : 'R')
                          : isI ? 'i' : isMR ? '★' : null;
              return (
                <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
                  {label && <div style={{ fontSize:'10px', fontWeight:800, color: isL ? '#3b82f6' : isR ? '#ef4444' : '#6366f1' }}>{label}</div>}
                  <div className={boxClass(i)}>{val}<div style={{ fontSize:'8px', color:'#94a3b8', marginTop:'1px' }}>{i}</div></div>
                </div>
              );
            })}
          </div>
          {infoEntries.length > 0 && (
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', justifyContent:'center' }}>
              {infoEntries.map(([k,v]) => (
                <div key={k} style={{ padding:'6px 12px', borderRadius:'8px', background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.25)', fontSize:'12px', fontWeight:600, fontFamily:'monospace' }}>
                  <span style={{ color:'#818cf8' }}>{k}</span><span style={{ color:'var(--text-muted)', margin:'0 4px' }}>:</span><span>{String(v)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    /* ── DP TABLE ──────────────────────────────── */
    if (type === 'dp') {
      if (step.dpTable2d) {
        const s1 = step.s1 ? ['', ...step.s1.split('')] : [];
        const s2 = step.s2 ? ['', ...step.s2.split('')] : [];
        return (
          <div style={{ overflowX:'auto', width:'100%' }}>
            <table style={{ borderCollapse:'collapse', margin:'0 auto', fontSize:'13px', fontFamily:'monospace' }}>
              <thead>
                <tr>
                  <th style={{ padding:'4px 10px', color:'var(--text-muted)' }}></th>
                  {s2.map((c,j) => <th key={j} style={{ padding:'4px 10px', color:'#6366f1', fontWeight:700 }}>{c||'ε'}</th>)}
                </tr>
              </thead>
              <tbody>
                {step.dpTable2d.map((row,i) => (
                  <tr key={i}>
                    <td style={{ padding:'4px 10px', color:'#6366f1', fontWeight:700 }}>{s1[i]||'ε'}</td>
                    {row.map((cell,j) => {
                      const isHi = (step.highlight2d||[]).some(([r,c])=>r===i&&c===j);
                      return (
                        <td key={j} style={{
                          padding:'6px 12px', textAlign:'center',
                          background: isHi?'rgba(99,102,241,0.2)':(i===0||j===0)?'rgba(255,255,255,0.03)':'var(--bg-surface)',
                          border:'1px solid var(--border)',
                          color: isHi?'#818cf8':'var(--text-primary)',
                          fontWeight: isHi?800:400, borderRadius:'4px',
                        }}>{cell}</td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      const table = step.dpTable || [];
      return (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px', alignItems:'center', width:'100%' }}>
          <div style={{ display:'flex', gap:'2px', flexWrap:'wrap', justifyContent:'center' }}>
            {table.map((val,i) => {
              const isHi = (step.highlight||[]).includes(i);
              return (
                <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'2px' }}>
                  <div style={{ fontSize:'9px', color:'var(--text-muted)' }}>dp[{i}]</div>
                  <motion.div
                    layout
                    style={{
                      width:'44px', height:'44px', display:'flex', alignItems:'center', justifyContent:'center',
                      borderRadius:'6px', fontSize:'15px', fontWeight:800, fontFamily:'monospace',
                      background: isHi?'rgba(99,102,241,0.2)':val>0?'rgba(34,197,94,0.12)':'var(--bg-surface)',
                      border:`2px solid ${isHi?'#6366f1':val>0?'#22c55e':'var(--border)'}`,
                      color: isHi?'#818cf8':val>0?'#22c55e':'var(--text-muted)',
                      transition:'all 0.3s ease',
                    }}
                  >
                    {val >= 99 ? '∞' : val}
                  </motion.div>
                  <div style={{ fontSize:'9px', color:'var(--text-muted)' }}>{i}</div>
                </div>
              );
            })}
          </div>
          {step.n !== undefined && <div style={{ fontSize:'12px', color:'var(--text-secondary)', fontFamily:'monospace' }}>n = {step.n}</div>}
        </div>
      );
    }

    /* ── GRID ──────────────────────────────────── */
    if (type === 'grid') {
      const grid = step.grid || [];
      if (!grid.length) return <div style={{ color:'var(--text-muted)', fontSize:13 }}>No grid data in this step</div>;
      const activeCell     = step.activeCell;
      const highlightCells = step.highlightCells || [];
      const isHi    = (r,c) => highlightCells.some(([hr,hc]) => hr===r && hc===c);
      const isActive = (r,c) => activeCell && activeCell[0]===r && activeCell[1]===c;
      return (
        <div style={{ overflowX:'auto', width:'100%' }}>
          <table style={{ borderCollapse:'separate', borderSpacing:'3px', margin:'0 auto', fontFamily:'monospace' }}>
            <tbody>
              {grid.map((row,r) => (
                <tr key={r}>
                  {row.map((cell,c) => (
                    <motion.td
                      key={c}
                      layout
                      style={{
                        width:'40px', height:'40px', textAlign:'center', fontSize:'13px', fontWeight:700,
                        borderRadius:'6px', border:'2px solid',
                        borderColor: isActive(r,c)?'#f59e0b':isHi(r,c)?'#6366f1':'var(--border)',
                        background:  isActive(r,c)?'rgba(245,158,11,0.2)':isHi(r,c)?'rgba(99,102,241,0.2)':
                          cell===1?'rgba(34,197,94,0.1)':cell===0?'var(--bg-raised)':'var(--bg-surface)',
                        color: isActive(r,c)?'#f59e0b':isHi(r,c)?'#818cf8':cell===1?'#22c55e':'var(--text-primary)',
                        transition:'all 0.3s ease',
                      }}
                    >
                      {cell}
                    </motion.td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {activeCell && (
            <div style={{ textAlign:'center', marginTop:'8px', fontSize:'12px', color:'var(--text-muted)', fontFamily:'monospace' }}>
              [{activeCell[0]},{activeCell[1]}] = {grid[activeCell[0]]?.[activeCell[1]]}
            </div>
          )}
        </div>
      );
    }

    /* ── HISTOGRAM ─────────────────────────────── */
    if (type === 'histogram') {
      const bars  = step.bars || [];
      const stack = step.stack || [];
      const maxH  = Math.max(...bars, 1);
      return (
        <div style={{ display:'flex', flexDirection:'column', gap:'16px', width:'100%', alignItems:'center' }}>
          <div style={{ width:'100%', maxWidth:'360px' }}>
            <div style={{ display:'flex', alignItems:'flex-end', gap:'3px', height:'100px', justifyContent:'center' }}>
              {bars.map((h,i) => {
                const isActive = step.activeBar === i;
                const inStack  = stack.includes(i);
                const color    = isActive?'#f59e0b':inStack?'#6366f1':'#374151';
                return (
                  <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', flex:1, maxWidth:'36px' }}>
                    <motion.div layout style={{
                      width:'100%', borderRadius:'3px 3px 0 0', background:color,
                      height:`${Math.max((h/maxH)*90,4)}px`,
                      border: isActive?'2px solid #f59e0b':'2px solid transparent',
                      transition:'all 0.3s ease',
                      display:'flex', alignItems:'flex-end', justifyContent:'center', paddingBottom:'2px',
                    }}>
                      <span style={{ fontSize:'10px', fontWeight:700, color:'#fff' }}>{h}</span>
                    </motion.div>
                    <div style={{ fontSize:'9px', color:inStack?'#818cf8':'var(--text-muted)', fontWeight:inStack?700:400 }}>{i}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'6px', width:'100%', maxWidth:'360px' }}>
            <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'1px', color:'var(--text-muted)' }}>
              STACK · maxArea: {step.maxArea ?? 0}
            </div>
            <div style={{ display:'flex', gap:'4px', flexWrap:'wrap', justifyContent:'center' }}>
              {stack.length === 0
                ? <div style={{ padding:'4px 12px', borderRadius:'6px', background:'var(--bg-hover)', color:'var(--text-muted)', fontSize:'12px' }}>empty</div>
                : stack.map((idx,si) => (
                  <motion.div key={`${si}-${idx}`} initial={{ scale:0.8,opacity:0 }} animate={{ scale:1,opacity:1 }}
                    style={{ padding:'4px 10px', borderRadius:'6px', background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.4)', fontSize:'12px', fontWeight:700, fontFamily:'monospace', color:'#818cf8' }}>
                    {idx}(h={bars[idx]})
                  </motion.div>
                ))
              }
            </div>
          </div>
        </div>
      );
    }

    /* ── HASHMAP ───────────────────────────────── */
    if (type === 'hashmap') {
      const arr = step.arr || [];
      return (
        <div style={{ display:'flex', gap:'24px', flexWrap:'wrap', justifyContent:'center' }}>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px' }}>
            <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'1px', color:'var(--text-muted)' }}>ARRAY</div>
            <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', justifyContent:'center' }}>
              {arr.map((val,i) => {
                const ptr = Object.entries(step.pointers||{}).find(([,v])=>v===i);
                return (
                  <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
                    {ptr && <div style={{ fontSize:'9px', fontWeight:700, color:'#6366f1' }}>{ptr[0]}</div>}
                    <div className={boxClass(i)}>{val}<div style={{ fontSize:'8px', color:'#94a3b8' }}>{i}</div></div>
                  </div>
                );
              })}
            </div>
          </div>
          {Object.keys(step.mapState||{}).length > 0 && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px' }}>
              <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'1px', color:'var(--text-muted)' }}>MAP</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                {Object.entries(step.mapState).map(([k,v]) => (
                  <div key={k} style={{ display:'flex', gap:'6px', padding:'4px 10px', borderRadius:'6px', background:'rgba(99,102,241,0.12)', fontSize:'12px', fontWeight:600, fontFamily:'monospace' }}>
                    <span style={{ color:'#818cf8' }}>{k}</span><span style={{ color:'var(--text-muted)' }}>→</span><span>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    /* ── STACK ─────────────────────────────────── */
    if (type === 'stack') {
      const arr = step.arr || [];
      const stackEntries = Object.entries(step.mapState||{});
      return (
        <div style={{ display:'flex', gap:'24px', flexWrap:'wrap', justifyContent:'center' }}>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px' }}>
            <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'1px', color:'var(--text-muted)' }}>INPUT</div>
            <div style={{ display:'flex', gap:'4px', flexWrap:'wrap' }}>
              {arr.map((val,i) => <div key={i} className={boxClass(i)}>{val}</div>)}
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'6px' }}>
            <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'1px', color:'var(--text-muted)' }}>STACK</div>
            <div style={{ display:'flex', flexDirection:'column-reverse', gap:'3px', minHeight:'60px', justifyContent:'flex-start' }}>
              {stackEntries.length === 0
                ? <div style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'monospace', padding:'4px 8px' }}>empty</div>
                : stackEntries.map(([k,v]) => (
                  <motion.div key={k} layout style={{ padding:'6px 16px', borderRadius:'6px', background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.3)', fontSize:'13px', fontWeight:700, textAlign:'center', fontFamily:'monospace' }}>{v}</motion.div>
                ))
              }
            </div>
          </div>
        </div>
      );
    }

    /* ── LINKED LIST ───────────────────────────── */
    if (type === 'linkedlist') {
      const nodes = step.nodes || step.arr?.map((v,i) => ({ val:v, id:i })) || [];
      const connections = step.connections || nodes.map((_,i) => i < nodes.length-1 ? i+1 : null);
      const curr = step.pointers?.curr ?? -1;
      const prev = step.pointers?.prev ?? -1;
      const head = step.pointers?.head ?? 0;
      return (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'12px', width:'100%' }}>
          <div style={{ display:'flex', alignItems:'center', flexWrap:'wrap', justifyContent:'center', gap:0 }}>
            {nodes.map((node,i) => {
              const isCurr = curr === i;
              const isPrev = prev === i;
              const isHead = head === i;
              const isOk   = step.sorted?.includes(i);
              const borderColor = isOk?'#22c55e':isCurr?'#f59e0b':isPrev?'#6366f1':'var(--border)';
              return (
                <div key={i} style={{ display:'flex', alignItems:'center' }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
                    {(isCurr||isPrev||isHead) && (
                      <div style={{ fontSize:9, fontWeight:800, color:isCurr?'#f59e0b':isPrev?'#6366f1':'#22c55e' }}>
                        {isHead?'head':isCurr?'curr':'prev'}
                      </div>
                    )}
                    <motion.div layout style={{
                      width:44, height:44, borderRadius:8,
                      border:`2px solid ${borderColor}`,
                      background: isOk?'rgba(34,197,94,0.15)':isCurr?'rgba(245,158,11,0.15)':isPrev?'rgba(99,102,241,0.15)':'var(--bg-surface)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:15, fontWeight:700, fontFamily:'monospace',
                      color: isOk?'#22c55e':isCurr?'#f59e0b':isPrev?'#818cf8':'var(--text-primary)',
                      transition:'all 0.3s ease',
                    }}>
                      {node.val ?? node}
                    </motion.div>
                  </div>
                  {i < nodes.length-1 && (
                    <div style={{ color: step.sorted?.includes(i)?'#22c55e':'var(--text-muted)', fontSize:16, padding:'0 2px', marginTop: (isCurr||isPrev||isHead)?'18px':0 }}>
                      {connections[i] === null ? '✕' : '→'}
                    </div>
                  )}
                  {i === nodes.length-1 && (
                    <div style={{ color:'var(--text-muted)', fontSize:11, padding:'0 6px', fontFamily:'monospace', marginTop:(isCurr||isPrev||isHead)?'18px':0 }}>
                      → null
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {Object.keys(step.mapState||{}).length > 0 && (
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', justifyContent:'center' }}>
              {Object.entries(step.mapState).map(([k,v]) => (
                <div key={k} style={{ padding:'4px 10px', borderRadius:6, background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.3)', fontSize:12, fontWeight:600, fontFamily:'monospace', color:'#818cf8' }}>
                  {k}: {String(v)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    /* ── DEFAULT: ARRAY ────────────────────────── */
    const arr = step.arr || [];
    if (!arr.length) return (
      <div style={{ color:'var(--text-muted)', fontSize:13, textAlign:'center' }}>
        No array data — vizType: <code>{type}</code>
      </div>
    );
    return (
      <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', justifyContent:'center', alignItems:'flex-end' }}>
        {arr.map((val,i) => {
          const ptr = Object.entries(step.pointers||{}).find(([,v])=>v===i);
          return (
            <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
              {ptr && <div style={{ fontSize:'10px', fontWeight:700, color:'#6366f1' }}>{ptr[0]}</div>}
              <div className={boxClass(i)}>
                {val}
                <div style={{ fontSize:'8px', color:'#94a3b8', marginTop:'1px' }}>{i}</div>
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
        <ExplainBox key={stepIdx} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.2 }}>
          {step.explain}
        </ExplainBox>
      </AnimatePresence>

      <Controls>
        <Tooltip text="Restart">
          <CtrlBtn onClick={() => { setPlaying(false); setStepIdx(0); }}>↩</CtrlBtn>
        </Tooltip>
        <Tooltip text="Previous (← key)">
          <CtrlBtn onClick={() => { setPlaying(false); setStepIdx(s => Math.max(0,s-1)); }} disabled={stepIdx===0}>◀</CtrlBtn>
        </Tooltip>
        <Tooltip text={playing?'Pause (Space)':'Play (Space)'}>
          <CtrlBtn $active={playing} onClick={() => setPlaying(p=>!p)}>{playing?'⏸':'▶'}</CtrlBtn>
        </Tooltip>
        <Tooltip text="Next (→ key)">
          <CtrlBtn onClick={() => { setPlaying(false); setStepIdx(s => Math.min(steps.length-1,s+1)); }} disabled={stepIdx===steps.length-1}>▶</CtrlBtn>
        </Tooltip>

        <Tooltip text="Left=slow 🐢  Right=fast ⚡">
          <SpeedRow>
            <SpeedLabel>🐢</SpeedLabel>
            <SpeedSlider type="range" min={1} max={10} step={1} value={stepsPerSec} onChange={e => setStepsPerSec(+e.target.value)} />
            <SpeedLabel>⚡</SpeedLabel>
          </SpeedRow>
        </Tooltip>
        <SpeedText>{stepsPerSec}×</SpeedText>

        <Dots>
          {steps.map((_,i) => (
            <Dot key={i} $active={i===stepIdx} $done={i<stepIdx} onClick={() => { setPlaying(false); setStepIdx(i); }} />
          ))}
        </Dots>
      </Controls>
    </Container>
  );
}