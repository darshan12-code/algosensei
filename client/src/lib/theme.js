// client/src/lib/theme.js
// Dark and Light themes for AlgoSensei

const baseTokens = {
  fonts: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  space: {
    1: '4px', 2: '8px', 3: '12px', 4: '16px',
    5: '24px', 6: '32px', 7: '48px', 8: '64px',
  },
  radius: {
    sm: '6px', md: '10px', lg: '14px', xl: '20px',
  },
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
  },
};

export const darkTheme = {
  ...baseTokens,
  mode: 'dark',
  colors: {
    bg:          '#0a0a0f',
    bgRaised:    '#12121a',
    bgSurface:   '#1a1a25',
    bgHover:     '#22222f',
    bgActive:    '#2a2a38',
    border:      '#2a2a3a',
    borderLight: '#1e1e2e',
    textPrimary:   '#e8e8ed',
    textSecondary: '#8b8b9e',
    textMuted:     '#5a5a72',
    accent:        '#6366f1',
    accentHover:   '#818cf8',
    accentBg:      'rgba(99,102,241,0.12)',
    accentBorder:  'rgba(99,102,241,0.3)',
    green:       '#22c55e',
    greenBg:     'rgba(34,197,94,0.12)',
    greenBorder: 'rgba(34,197,94,0.3)',
    amber:       '#f59e0b',
    amberBg:     'rgba(245,158,11,0.12)',
    amberBorder: 'rgba(245,158,11,0.3)',
    red:         '#ef4444',
    redBg:       'rgba(239,68,68,0.12)',
    redBorder:   'rgba(239,68,68,0.3)',
    blue:        '#3b82f6',
    blueBg:      'rgba(59,130,246,0.12)',
     gradientBrand: 'linear-gradient(135deg, #00d4ff 0%, #0077ff 50%, #7c3aed 100%)',
  },
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.3)',
    md: '0 4px 12px rgba(0,0,0,0.4)',
    lg: '0 8px 32px rgba(0,0,0,0.5)',
  },
};

export const lightTheme = {
  ...baseTokens,
  mode: 'light',
  colors: {
    bg:          '#f5f5f7',
    bgRaised:    '#ffffff',
    bgSurface:   '#ffffff',
    bgHover:     '#f0f0f5',
    bgActive:    '#e8e8f0',
    border:      '#d8d8e8',
    borderLight: '#e8e8f2',
    textPrimary:   '#111118',
    textSecondary: '#555568',
    textMuted:     '#9090a8',
    accent:        '#6366f1',
    accentHover:   '#4f52e0',
    accentBg:      'rgba(99,102,241,0.08)',
    accentBorder:  'rgba(99,102,241,0.25)',
    green:       '#16a34a',
    greenBg:     'rgba(22,163,74,0.08)',
    greenBorder: 'rgba(22,163,74,0.25)',
    amber:       '#d97706',
    amberBg:     'rgba(217,119,6,0.08)',
    amberBorder: 'rgba(217,119,6,0.25)',
    red:         '#dc2626',
    redBg:       'rgba(220,38,38,0.08)',
    redBorder:   'rgba(220,38,38,0.25)',
    blue:        '#2563eb',
    blueBg:      'rgba(37,99,235,0.08)',
    gradientBrand: 'linear-gradient(135deg, #0077cc 0%, #0044aa 50%, #5500cc 100%)',

  },
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.08)',
    md: '0 4px 12px rgba(0,0,0,0.1)',
    lg: '0 8px 32px rgba(0,0,0,0.14)',
  },
};

// Keep legacy `theme` export as dark for backwards compatibility
export const theme = darkTheme;

export const media = {
  mobile:  `@media (max-width: ${baseTokens.breakpoints.mobile})`,
  tablet:  `@media (max-width: ${baseTokens.breakpoints.tablet})`,
  desktop: `@media (max-width: ${baseTokens.breakpoints.desktop})`,
};