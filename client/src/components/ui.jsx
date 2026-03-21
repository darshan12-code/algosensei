// client/src/components/ui.jsx

import styled from 'styled-components';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ════════════════════════════════════════════════════════════
   LAYOUT
   ════════════════════════════════════════════════════════════ */

export const PageLayout = styled.div`
  max-width: ${({ $wide }) => $wide ? '1100px' : '880px'};
  margin: 0 auto;
  padding: 28px 16px 100px;
  width: 100%;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: 20px 12px 90px;
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: 16px 10px 80px;
  }
`;

export const TwoColLayout = styled.div`
  display: flex;
  gap: 24px;
  width: 100%;
  align-items: flex-start;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    flex-direction: column;
    gap: 0;
  }
`;

/** Raw aside — used by CollapsibleSidebar internally */
export const SidebarInner = styled.aside`
  width: 200px;
  flex-shrink: 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    width: 100%;
  }
`;

export const MainContent = styled.div`
  flex: 1;
  min-width: 0;
`;

/* ── Mobile sidebar toggle button ─────────────────────────── */
const SidebarToggle = styled.button`
  display: none;
  width: 100%;
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ $open, theme }) => $open ? theme.colors.accentBorder : theme.colors.border};
  background: ${({ $open, theme }) => $open ? theme.colors.accentBg : theme.colors.bgSurface};
  color: ${({ $open, theme }) => $open ? theme.colors.accent : theme.colors.textSecondary};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  margin-bottom: 8px;
  align-items: center;
  gap: 8px;
  transition: all 0.15s;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: flex;
  }
`;

const SidebarBody = styled(motion.div)`
  overflow: hidden;

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    /* Always visible on desktop — override AnimatePresence height */
    height: auto !important;
    opacity: 1 !important;
  }
`;

/**
 * CollapsibleSidebar — replaces raw <Sidebar> on Problems and Tech pages.
 * On desktop: always visible, no toggle.
 * On mobile (≤768px): collapsed by default with a toggle button.
 *
 * Usage:
 *   <CollapsibleSidebar label="Filters (3 active)">
 *     ... filter buttons ...
 *   </CollapsibleSidebar>
 */
export function CollapsibleSidebar({ children, label = 'Filters' }) {
  const [open, setOpen] = useState(false);

  return (
    <SidebarInner>
      {/* Toggle button — only visible on mobile via CSS */}
      <SidebarToggle $open={open} onClick={() => setOpen(v => !v)}>
        <span>🔽</span>
        {open ? `Hide ${label}` : `Show ${label}`}
        <span style={{ marginLeft: 'auto' }}>{open ? '▲' : '▼'}</span>
      </SidebarToggle>

      {/* On desktop: always rendered. On mobile: animate open/close */}
      <AnimatePresence initial={false}>
        <SidebarBody
          key="sidebar-body"
          initial={false}
          animate={{ height: 'auto', opacity: 1 }}
          style={{
            // On mobile, control via JS. On desktop, always auto.
          }}
        >
          {/* We use a plain wrapper that CSS controls on desktop */}
          <MobileSidebarContent $open={open}>
            {children}
          </MobileSidebarContent>
        </SidebarBody>
      </AnimatePresence>
    </SidebarInner>
  );
}

const MobileSidebarContent = styled.div`
  /* Desktop: always visible */
  display: block;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    /* Mobile: hide/show based on $open */
    display: ${({ $open }) => $open ? 'block' : 'none'};
    padding-bottom: 12px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
    margin-bottom: 16px;
  }
`;

/* Keep raw Sidebar for backwards compatibility where it's already used */
export const Sidebar = SidebarInner;

/* ════════════════════════════════════════════════════════════
   PAGE HEADER
   ════════════════════════════════════════════════════════════ */

export const PageTitle = styled(motion.h1)`
  font-size: clamp(22px, 4vw, 28px);
  font-weight: 800;
  letter-spacing: -0.5px;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 4px;
`;

export const PageSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 20px;
`;

export const SectionLabel = styled.div`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  margin-bottom: 10px;
`;

/* ════════════════════════════════════════════════════════════
   BUTTON  (canonical — replaces Quiz.jsx Btn, ExplainModal Btn, etc.)
   ════════════════════════════════════════════════════════════ */

export const Btn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: ${({ $size }) =>
    $size === 'sm' ? '5px 11px' :
    $size === 'lg' ? '13px 26px' :
    '8px 16px'};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ $size }) => $size === 'sm' ? '12px' : $size === 'lg' ? '15px' : '13px'};
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  border: 1px solid transparent;
  width: ${({ $full }) => $full ? '100%' : 'auto'};

  background: ${({ $variant, theme }) =>
    $variant === 'primary'  ? theme.colors.accent :
    $variant === 'success'  ? theme.colors.greenBg :
    $variant === 'danger'   ? theme.colors.redBg :
    $variant === 'ghost'    ? 'transparent' :
    theme.colors.bgSurface};

  color: ${({ $variant, theme }) =>
    $variant === 'primary'  ? (theme.mode === 'dark' ? theme.colors.bg : '#fff') :
    $variant === 'success'  ? theme.colors.green :
    $variant === 'danger'   ? theme.colors.red :
    $variant === 'ghost'    ? theme.colors.textSecondary :
    theme.colors.textSecondary};

  border-color: ${({ $variant, theme }) =>
    $variant === 'primary'  ? theme.colors.accent :
    $variant === 'success'  ? theme.colors.greenBorder :
    $variant === 'danger'   ? theme.colors.redBorder :
    $variant === 'ghost'    ? 'transparent' :
    theme.colors.border};

  &:hover:not(:disabled) {
    opacity: ${({ $variant }) => $variant === 'primary' ? 0.88 : 1};
    background: ${({ $variant, theme }) =>
      $variant === 'primary'  ? theme.colors.accentHover :
      $variant === 'success'  ? 'rgba(34,197,94,0.2)' :
      $variant === 'danger'   ? 'rgba(239,68,68,0.2)' :
      $variant === 'ghost'    ? theme.colors.bgHover :
      theme.colors.bgHover};
    color: ${({ $variant, theme }) =>
      $variant === 'ghost' ? theme.colors.textPrimary : 'inherit'};
    border-color: ${({ $variant, theme }) =>
      $variant === 'ghost' ? theme.colors.border : 'inherit'};
  }
  &:active:not(:disabled) { transform: scale(0.97); }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
`;

/* ════════════════════════════════════════════════════════════
   BADGES
   ════════════════════════════════════════════════════════════ */

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 9px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.2px;

  background: ${({ $color, theme }) =>
    $color === 'green'  ? theme.colors.greenBg :
    $color === 'amber'  ? theme.colors.amberBg :
    $color === 'red'    ? theme.colors.redBg :
    $color === 'blue'   ? theme.colors.blueBg :
    $color === 'accent' ? theme.colors.accentBg :
    theme.colors.bgHover};

  color: ${({ $color, theme }) =>
    $color === 'green'  ? theme.colors.green :
    $color === 'amber'  ? theme.colors.amber :
    $color === 'red'    ? theme.colors.red :
    $color === 'blue'   ? theme.colors.blue :
    $color === 'accent' ? theme.colors.accent :
    theme.colors.textSecondary};

  border: 1px solid ${({ $color, theme }) =>
    $color === 'green'  ? theme.colors.greenBorder :
    $color === 'amber'  ? theme.colors.amberBorder :
    $color === 'red'    ? theme.colors.redBorder :
    $color === 'blue'   ? `${theme.colors.blue}44` :
    $color === 'accent' ? theme.colors.accentBorder :
    theme.colors.border};
`;

export function DiffBadge({ difficulty, ...props }) {
  const map = { Easy: 'green', Medium: 'amber', Hard: 'red' };
  return <Badge $color={map[difficulty] || 'accent'} {...props}>{difficulty}</Badge>;
}

export const AIBadge = styled(Badge).attrs({ $color: 'accent' })`
  font-size: 10px;
  font-weight: 700;
`;

/* ════════════════════════════════════════════════════════════
   CARD
   ════════════════════════════════════════════════════════════ */

export const Card = styled.div`
  background: ${({ theme }) => theme.colors.bgSurface};
  border: 1px solid ${({ $highlighted, theme }) =>
    $highlighted ? theme.colors.accentBorder : theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ $p }) => $p || '18px'};
  transition: border-color 0.15s, box-shadow 0.15s;

  ${({ $hoverable, theme }) => $hoverable && `
    cursor: pointer;
    &:hover {
      border-color: ${theme.colors.accentBorder};
      box-shadow: ${theme.shadows.md};
    }
  `}
`;

export const RaisedCard = styled(Card)`
  background: ${({ theme }) => theme.colors.bgRaised};
  border-color: ${({ theme }) => theme.colors.borderLight};
`;

/* ════════════════════════════════════════════════════════════
   INPUTS
   ════════════════════════════════════════════════════════════ */

export const Input = styled.input`
  width: 100%;
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bgSurface};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
  margin-bottom: 12px;

  &:focus { border-color: ${({ theme }) => theme.colors.accentBorder}; }
  &::placeholder { color: ${({ theme }) => theme.colors.textMuted}; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

export const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bgSurface};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 13px;
  font-family: inherit;
  line-height: 1.6;
  resize: vertical;
  outline: none;
  transition: border-color 0.15s;

  &:focus { border-color: ${({ theme }) => theme.colors.accentBorder}; }
  &::placeholder { color: ${({ theme }) => theme.colors.textMuted}; }
`;

/* ════════════════════════════════════════════════════════════
   FILTER SIDEBAR
   ════════════════════════════════════════════════════════════ */

export const FilterBtn = styled.button`
  width: 100%;
  text-align: left;
  padding: 7px 10px;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: none;
  background: ${({ $active, theme }) => $active ? theme.colors.accentBg : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.accent : theme.colors.textSecondary};
  font-size: 13px;
  font-weight: ${({ $active }) => $active ? 600 : 400};
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1px;

  &:hover {
    background: ${({ theme }) => theme.colors.bgHover};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const FilterCount = styled.span`
  font-size: 11px;
  font-family: ${({ theme }) => theme.fonts.mono};
  color: ${({ theme }) => theme.colors.textMuted};
  background: ${({ theme }) => theme.colors.bgHover};
  padding: 1px 6px;
  border-radius: 10px;
`;

/* ════════════════════════════════════════════════════════════
   PROGRESS BAR
   ════════════════════════════════════════════════════════════ */

export const ProgressBar = styled.div`
  height: 4px;
  background: ${({ theme }) => theme.colors.bgHover};
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 18px;
`;

export const ProgressFill = styled(motion.div)`
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg,
    ${({ theme }) => theme.colors.accent},
    ${({ theme }) => theme.colors.accentHover}
  );
`;

/* ════════════════════════════════════════════════════════════
   EMPTY STATE
   ════════════════════════════════════════════════════════════ */

export const EmptyBox = styled.div`
  text-align: center;
  padding: ${({ $compact }) => $compact ? '28px 16px' : '56px 24px'};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 14px;
  line-height: 1.7;
`;

/* ════════════════════════════════════════════════════════════
   SKELETON LOADER (dedup from SkeletonLoader.jsx — that file is kept
   but re-exports from here to avoid two different implementations)
   ════════════════════════════════════════════════════════════ */

export const SkeletonLine = styled.div`
  height: ${({ $h }) => $h || '16px'};
  width: ${({ $w }) => $w || '100%'};
  border-radius: ${({ theme }) => theme.radius.sm};
  margin-bottom: ${({ $mb }) => $mb || '10px'};
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.bgRaised} 25%,
    ${({ theme }) => theme.colors.bgHover} 50%,
    ${({ theme }) => theme.colors.bgRaised} 75%
  );
  background-size: 400px 100%;
  animation: shimmer 1.5s infinite;
`;

/* ════════════════════════════════════════════════════════════
   ALERT / INFO BOX  (replaces inline error divs in Quiz, Problems, etc.)
   ════════════════════════════════════════════════════════════ */

export const AlertBox = styled.div`
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 13px;
  line-height: 1.6;
  border: 1px solid ${({ $type, theme }) =>
    $type === 'success' ? theme.colors.greenBorder :
    $type === 'error'   ? theme.colors.redBorder :
    $type === 'info'    ? theme.colors.accentBorder :
    theme.colors.amberBorder};
  background: ${({ $type, theme }) =>
    $type === 'success' ? theme.colors.greenBg :
    $type === 'error'   ? theme.colors.redBg :
    $type === 'info'    ? theme.colors.accentBg :
    theme.colors.amberBg};
  color: ${({ $type, theme }) =>
    $type === 'success' ? theme.colors.green :
    $type === 'error'   ? theme.colors.red :
    $type === 'info'    ? theme.colors.accent :
    theme.colors.amber};
`;

/* ════════════════════════════════════════════════════════════
   DIVIDER
   ════════════════════════════════════════════════════════════ */

export const OrDivider = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 24px 0;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;

  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.border};
  }
`;

/* ════════════════════════════════════════════════════════════
   CONCEPT CARD (Visualize page + Visualizer component)
   ════════════════════════════════════════════════════════════ */

export const ConceptCard = styled.div`
  margin-top: 16px;
  padding: 16px;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.greenBg};
  border: 1px solid ${({ theme }) => theme.colors.greenBorder};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
`;

/* ════════════════════════════════════════════════════════════
   LOADING SPINNER (replaces multiple inline "⚡ rotating" patterns)
   ════════════════════════════════════════════════════════════ */

export function Spinner({ size = 28, label = '' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
        style={{ fontSize: size }}
      >
        ⚡
      </motion.div>
      {label && <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</div>}
    </div>
  );
}