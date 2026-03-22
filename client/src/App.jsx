// client/src/App.jsx
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { darkTheme, lightTheme } from './lib/theme.js';
import GlobalStyles from './GlobalStyles.js';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import AIChatBot from './components/AIChatBot.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import AuthCallback from './pages/AuthCallback.jsx';
import Problems from './pages/Problems.jsx';
import Tech from './pages/Tech.jsx';
import Chat from './pages/Chat.jsx';
import Visualize from './pages/Visualize.jsx';
import Quiz from './pages/Quiz.jsx';
import Dashboard from './pages/Dashboard.jsx';

/* ── Styled components for Home page ──────────────────────── */
const HeroSection = styled.div`
  max-width: 800px;
  margin: 80px auto 0;
  padding: 0 16px;
  text-align: center;
  position: relative;

  /* Ambient glow */
  &::before {
    content: '';
    position: absolute;
    top: -80px;
    left: 50%;
    transform: translateX(-50%);
    width: 600px;
    height: 400px;
    background: radial-gradient(ellipse, ${({ theme }) => theme.colors.accentBg} 0%, transparent 70%);
    pointer-events: none;
    z-index: -1;
  }

  @media (max-width: 600px) {
    margin-top: 40px;
  }
`;

const HeroBadge = styled(motion.span)`
  display: inline-block;
  padding: 5px 16px;
  border-radius: 20px;
  background: ${({ theme }) => theme.colors.accentBg};
  border: 1px solid ${({ theme }) => theme.colors.accentBorder};
  color: ${({ theme }) => theme.colors.accent};
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  margin-bottom: 20px;
`;

const HeroTitle = styled(motion.h1)`
  font-size: clamp(32px, 6vw, 56px);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -1px;
  margin-bottom: 16px;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.textPrimary} 0%,
    ${({ theme }) => theme.colors.accent} 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const HeroSub = styled.p`
  font-size: 18px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 40px;
  line-height: 1.7;
  max-width: 540px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 600px) {
    font-size: 15px;
  }
`;

const HeroActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 80px;
`;

const HeroBtn = styled(Link)`
  padding: 13px 26px;
  border-radius: ${({ theme }) => theme.radius.md};
  font-weight: 600;
  font-size: 15px;
  transition: all 0.2s;
  background: ${({ $primary, theme }) => $primary ? theme.colors.accent : theme.colors.bgSurface};
  color: ${({ $primary, theme }) => $primary ? (theme.mode === 'dark' ? theme.colors.bg : '#fff') : theme.colors.textPrimary};
  border: 1px solid ${({ $primary, theme }) => $primary ? 'transparent' : theme.colors.border};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
    background: ${({ $primary, theme }) => $primary ? theme.colors.accentHover : theme.colors.bgHover};
  }
  &:active { transform: translateY(0); }
`;

const FeaturesGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 16px 100px; /* 100px for footer clearance */

  @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 480px) { grid-template-columns: 1fr; }
`;

const FeatureCard = styled(motion.create(Link))`
  padding: 24px;
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.bgSurface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: all 0.2s;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.accentBg}, transparent);
    opacity: 0;
    transition: opacity 0.3s;
  }
  &:hover::before { opacity: 1; }
  &:hover {
    border-color: ${({ theme }) => theme.colors.accentBorder};
    transform: translateY(-3px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
  &:active { transform: translateY(0); }
`;

const FeatureIcon = styled.div`font-size: 28px; margin-bottom: 12px; position: relative;`;
const FeatureTitle = styled.h3`
  font-size: 15px; font-weight: 700; margin-bottom: 6px;
  color: ${({ theme }) => theme.colors.textPrimary};
  position: relative;
`;
const FeatureDesc = styled.p`
  font-size: 13px; color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.55; position: relative;
`;

/* ── Data ─────────────────────────────────────────────────── */
const FEATURES = [
  { icon: '📚', title: '100+ DSA Problems',      desc: 'Curated from top companies, filterable by topic and difficulty', href: '/problems' },
  { icon: '🤖', title: 'AI Chat Mentor',          desc: '6 modes: Socratic hints, full solutions, mock interviews',       href: '/chat'     },
  { icon: '🎬', title: 'Algorithm Visualizer',    desc: '14+ pre-built animations plus AI-generated visualizations',       href: '/visualize'},
  { icon: '📝', title: 'Timed Quizzes',           desc: 'AI-generated MCQs with instant feedback and weak topic tracking', href: '/quiz'     },
  { icon: '🎯', title: 'Tech Questions',          desc: '120+ interview questions across 7 categories',                    href: '/tech'     },
  { icon: '📊', title: 'Progress Dashboard',      desc: 'Streak tracking, accuracy stats, and weakness heatmap',           href: '/dashboard'},
];

const stagger = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const fadeUp = {
  hidden:  { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

function Home() {
  return (
    <>
      <HeroSection>
        <HeroBadge initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          AI-Powered Interview Prep
        </HeroBadge>
        <HeroTitle initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          Master DSA &amp; Technical Interviews
        </HeroTitle>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <HeroSub>
            Practice 100+ problems, get AI-powered explanations, visualize algorithms,
            and track your progress — all in one place.
          </HeroSub>
          <HeroActions>
            <HeroBtn to="/problems" $primary>Start Practicing →</HeroBtn>
            <HeroBtn to="/chat">AI Mentor →</HeroBtn>
          </HeroActions>
        </motion.div>
      </HeroSection>

      <FeaturesGrid variants={stagger} initial="hidden" animate="visible">
        {FEATURES.map(f => (
          <FeatureCard key={f.href} to={f.href} variants={fadeUp}>
            <FeatureIcon>{f.icon}</FeatureIcon>
            <FeatureTitle>{f.title}</FeatureTitle>
            <FeatureDesc>{f.desc}</FeatureDesc>
          </FeatureCard>
        ))}
      </FeaturesGrid>
    </>
  );
}

/* ── App ──────────────────────────────────────────────────── */
export default function App() {
  const [isDark, setIsDark] = useState(true);

  return (
    <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <GlobalStyles />
      <AuthProvider>
        <BrowserRouter>
         
          <Navbar isDark={isDark} onToggleTheme={() => setIsDark(d => !d)} />

        
          <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden',height: 0 }}>
            <Routes>
              {/* Public */}
              <Route path="/"              element={<Home />} />
              <Route path="/login"         element={<Login />} />
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* Protected */}
              <Route path="/problems"  element={<ProtectedRoute><Problems /></ProtectedRoute>} />
              <Route path="/tech"      element={<ProtectedRoute><Tech /></ProtectedRoute>} />
              <Route path="/chat"      element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/visualize" element={<ProtectedRoute><Visualize /></ProtectedRoute>} />
              <Route path="/quiz"      element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            </Routes>
          </main>

          <Footer />
          <AIChatBot />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}