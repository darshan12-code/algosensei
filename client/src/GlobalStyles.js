// client/src/GlobalStyles.js


import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── CSS Variables — update instantly on theme switch ──────── */
  :root {
    --bg:           ${({ theme }) => theme.colors.bg};
    --bg-raised:    ${({ theme }) => theme.colors.bgRaised};
    --bg-surface:   ${({ theme }) => theme.colors.bgSurface};
    --bg-hover:     ${({ theme }) => theme.colors.bgHover};
    --bg-active:    ${({ theme }) => theme.colors.bgActive};
    --border:       ${({ theme }) => theme.colors.border};
    --border-light: ${({ theme }) => theme.colors.borderLight};

    --text-primary:   ${({ theme }) => theme.colors.textPrimary};
    --text-secondary: ${({ theme }) => theme.colors.textSecondary};
    --text-muted:     ${({ theme }) => theme.colors.textMuted};

    --accent:         ${({ theme }) => theme.colors.accent};
    --accent-hover:   ${({ theme }) => theme.colors.accentHover};
    --accent-bg:      ${({ theme }) => theme.colors.accentBg};
    --accent-border:  ${({ theme }) => theme.colors.accentBorder};

    --green:        ${({ theme }) => theme.colors.green};
    --green-bg:     ${({ theme }) => theme.colors.greenBg};
    --green-border: ${({ theme }) => theme.colors.greenBorder};

    --amber:        ${({ theme }) => theme.colors.amber};
    --amber-bg:     ${({ theme }) => theme.colors.amberBg};
    --amber-border: ${({ theme }) => theme.colors.amberBorder};

    --red:          ${({ theme }) => theme.colors.red};
    --red-bg:       ${({ theme }) => theme.colors.redBg};
    --red-border:   ${({ theme }) => theme.colors.redBorder};

    --blue:         ${({ theme }) => theme.colors.blue};
    --blue-bg:      ${({ theme }) => theme.colors.blueBg};

    --shadow-sm: ${({ theme }) => theme.shadows.sm};
    --shadow-md: ${({ theme }) => theme.shadows.md};
    --shadow-lg: ${({ theme }) => theme.shadows.lg};

    --font-sans: ${({ theme }) => theme.fonts.sans};
    --font-mono: ${({ theme }) => theme.fonts.mono};

    --radius-sm: ${({ theme }) => theme.radius.sm};
    --radius-md: ${({ theme }) => theme.radius.md};
    --radius-lg: ${({ theme }) => theme.radius.lg};
    --radius-xl: ${({ theme }) => theme.radius.xl};

    --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
    --duration-fast:   150ms;
    --duration-normal: 250ms;
    --duration-slow:   400ms;

    --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
    --space-5: 24px; --space-6: 32px; --space-7: 48px; --space-8: 64px;
  }

  /* ── Base ────────────────────────────────────────────────── */
  html {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }

  body {
    font-family: ${({ theme }) => theme.fonts.sans};
    /* FIX: NO transition here — transitions were causing the 1s theme-switch lag.
       styled-components updates CSS vars synchronously; transition fought against that. */
    background: ${({ theme }) => theme.colors.bg};
    color: ${({ theme }) => theme.colors.textPrimary};
    line-height: 1.6;
    min-height: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }

  body.modal-open { overflow: hidden; }

  #root {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  a { color: inherit; text-decoration: none; }
  button { font-family: inherit; cursor: pointer; }
  input, textarea, select { font-family: inherit; }

  /* ── Scrollbar ───────────────────────────────────────────── */
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 3px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.textMuted};
  }

  /* ── Visualizer box states ───────────────────────────────── */
  .box {
    display: inline-flex; flex-direction: column;
    align-items: center; justify-content: center;
    width: 44px; height: 44px;
    border-radius: ${({ theme }) => theme.radius.sm};
    font-size: 15px; font-weight: 700;
    font-family: ${({ theme }) => theme.fonts.mono};
    border: 2px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.bgSurface};
    color: ${({ theme }) => theme.colors.textSecondary};
    transition: all 0.25s var(--ease-out);
    position: relative;
  }
  .box.hi  { background: ${({ theme }) => theme.colors.amberBg};  border-color: ${({ theme }) => theme.colors.amber};  color: ${({ theme }) => theme.colors.amber}; }
  .box.cmp { background: ${({ theme }) => theme.colors.blueBg};   border-color: ${({ theme }) => theme.colors.blue};   color: ${({ theme }) => theme.colors.blue}; }
  .box.ok  { background: ${({ theme }) => theme.colors.greenBg};  border-color: ${({ theme }) => theme.colors.green};  color: ${({ theme }) => theme.colors.green}; }
  .box.pvt { background: ${({ theme }) => theme.colors.redBg};    border-color: ${({ theme }) => theme.colors.red};    color: ${({ theme }) => theme.colors.red}; }

  /* ── Chat layout ─────────────────────────────────────────── */
  .chat-layout {
    display: flex;
    height: calc(100vh - 57px - 62px);
    overflow: hidden;
  }
  .chat-sidebar {
    width: 270px;
    flex-shrink: 0;
    border-right: 1px solid ${({ theme }) => theme.colors.borderLight};
    background: ${({ theme }) => theme.colors.bgRaised};
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .chat-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
  }
  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 24px 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    -webkit-overflow-scrolling: touch;
  }
  .chat-bubble {
    max-width: 72%;
    padding: 12px 16px;
    font-size: 14px;
    line-height: 1.65;
  }
  .chat-bubble-user {
    border-radius: 14px 14px 4px 14px;
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.mode === 'dark' ? theme.colors.bg : '#fff'};
    align-self: flex-end;
  }
  .chat-bubble-ai {
    border-radius: 14px 14px 14px 4px;
    background: ${({ theme }) => theme.colors.bgSurface};
    color: ${({ theme }) => theme.colors.textPrimary};
    border: 1px solid ${({ theme }) => theme.colors.borderLight};
  }
  .chat-empty {
    text-align: center;
    padding: 48px 24px;
    color: ${({ theme }) => theme.colors.textMuted};
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .chat-empty-icon  { font-size: 40px; }
  .chat-empty-title { font-size: 16px; font-weight: 600; color: ${({ theme }) => theme.colors.textSecondary}; }
  .chat-empty-desc  { font-size: 13px; max-width: 280px; line-height: 1.6; }
  .chat-input-area {
    padding: 14px 20px;
    border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
    background: ${({ theme }) => theme.colors.bgRaised};
    display: flex;
    gap: 10px;
    align-items: flex-end;
  }
  .chat-input {
    flex: 1;
    padding: 11px 14px;
    border-radius: ${({ theme }) => theme.radius.md};
    font-size: 14px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.bgSurface};
    color: ${({ theme }) => theme.colors.textPrimary};
    resize: none;
    font-family: inherit;
    outline: none;
    line-height: 1.5;
    max-height: 120px;
    overflow-y: auto;
  }
  .chat-input:focus { border-color: ${({ theme }) => theme.colors.accentBorder}; }
  .chat-input::placeholder { color: ${({ theme }) => theme.colors.textMuted}; }
  .chat-send-btn {
    padding: 11px 20px;
    border-radius: ${({ theme }) => theme.radius.md};
    font-size: 14px;
    font-weight: 700;
    white-space: nowrap;
    border: none;
    cursor: pointer;
  }

  /* ── Mode buttons ────────────────────────────────────────── */
  .mode-btn {
    width: 100%; text-align: left;
    padding: 10px 12px;
    border-radius: ${({ theme }) => theme.radius.sm};
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.bgSurface};
    cursor: pointer;
    transition: all 0.15s;
  }
  .mode-btn:hover { background: ${({ theme }) => theme.colors.bgHover}; }
  .mode-btn.active {
    border-color: ${({ theme }) => theme.colors.accentBorder};
    background: ${({ theme }) => theme.colors.accentBg};
  }
  .mode-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .mode-btn-label { font-size: 13px; font-weight: 600; color: ${({ theme }) => theme.colors.textPrimary}; }
  .mode-btn-desc  { font-size: 11px; color: ${({ theme }) => theme.colors.textMuted}; margin-top: 2px; }

  /* ── Typing dots ─────────────────────────────────────────── */
  .typing-dots { display: flex; gap: 4px; padding: 12px 16px; align-items: center; }
  .typing-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: ${({ theme }) => theme.colors.textMuted};
    animation: bounce 1.2s infinite;
  }
  .typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .typing-dot:nth-child(3) { animation-delay: 0.4s; }

  /* ── Markdown body ───────────────────────────────────────── */
  .markdown-body { font-size: 14px; line-height: 1.7; }
  .markdown-body p { margin: 0 0 10px; }
  .markdown-body p:last-child { margin-bottom: 0; }
  .markdown-body pre {
    background: ${({ theme }) => theme.colors.bgRaised};
    border: 1px solid ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.textPrimary};
    padding: 14px 16px; border-radius: 8px;
    overflow-x: auto; font-size: 13px; line-height: 1.6; margin: 10px 0;
  }
  .markdown-body code {
    background: ${({ theme }) => theme.colors.accentBg};
    padding: 2px 6px; border-radius: 4px; font-size: 13px;
    font-family: ${({ theme }) => theme.fonts.mono};
    color: ${({ theme }) => theme.colors.accent};
  }
  .markdown-body pre code { background: none; padding: 0; color: ${({ theme }) => theme.colors.textPrimary}; }
  .markdown-body h1 { font-size: 18px; font-weight: 700; margin: 16px 0 8px; }
  .markdown-body h2 { font-size: 15px; font-weight: 700; margin: 14px 0 6px; }
  .markdown-body h3 { font-size: 14px; font-weight: 600; margin: 12px 0 4px; }
  .markdown-body strong { font-weight: 700; }
  .markdown-body em { font-style: italic; }
  .markdown-body ul, .markdown-body ol { padding-left: 20px; margin: 6px 0; }
  .markdown-body li { margin-bottom: 4px; }
  .markdown-body blockquote {
    border-left: 3px solid ${({ theme }) => theme.colors.accentBorder};
    padding-left: 12px; margin: 8px 0;
    color: ${({ theme }) => theme.colors.textSecondary}; font-style: italic;
  }

  /* ── Code block copy button ──────────────────────────────── */
  .code-block-wrapper { position: relative; }
  .code-copy-btn {
    position: absolute; top: 8px; right: 8px;
    padding: 4px 8px; border-radius: ${({ theme }) => theme.radius.sm};
    background: ${({ theme }) => theme.colors.bgHover};
    border: 1px solid ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 11px; font-family: ${({ theme }) => theme.fonts.sans};
    opacity: 0; transition: opacity 0.15s; cursor: pointer;
  }
  .code-block-wrapper:hover .code-copy-btn { opacity: 1; }

  /* ── Chat context card / section label ───────────────────── */
  .chat-context-card {
    background: ${({ theme }) => theme.colors.bgSurface};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radius.md};
    padding: 14px;
  }
  .section-label {
    font-size: 10px; font-weight: 700; letter-spacing: 2px;
    color: ${({ theme }) => theme.colors.textMuted};
    text-transform: uppercase; margin-bottom: 8px;
  }

  /* ── Tag / Badge helpers (legacy classNames) ─────────────── */
  .tag {
    display: inline-flex; align-items: center;
    padding: 2px 8px; border-radius: 4px;
    font-size: 11px; font-weight: 600; line-height: 1.6;
  }
  .tag-accent { background: var(--accent-bg); color: var(--accent); }
  .badge-easy   { background: var(--green-bg); color: var(--green); }
  .badge-medium { background: var(--amber-bg); color: var(--amber); }
  .badge-hard   { background: var(--red-bg);   color: var(--red);   }

  /* ── Mobile chat ─────────────────────────────────────────── */
  @media (max-width: 768px) {
    .chat-layout    { flex-direction: column; height: calc(100vh - 57px); }
    .chat-sidebar   { display: none; }
    .chat-bubble    { max-width: 90%; }
  }
`;

export default GlobalStyles;