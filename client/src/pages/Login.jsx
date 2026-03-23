// src/pages/Login.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext.jsx';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import GoogleLoginButton from '../components/GoogleLoginButton.jsx';

const Page = styled.div`
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 16px;
`;

const Card = styled(motion.div)`
  background: ${({ theme }) => theme.colors.bgSurface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.xl};
  padding: 48px 40px;
  width: 100%;
  max-width: 400px;
  text-align: center;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: 32px 24px;
  }
`;

const Logo = styled.div`font-size: 48px; margin-bottom: 16px;`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.5px;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #e8e8ed, #6366f1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  margin-bottom: 32px;
  line-height: 1.6;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
`;

const DemoBtn = styled.button`
  width: 100%;
  padding: 11px 20px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.accentBorder};
    color: ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => theme.colors.accentBg};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DemoNote = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 2px;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 24px 0;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.border};
  }
`;

const Features = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
  margin-top: 24px;
`;

const FeatureRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const LoadingPage = styled.div`
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 14px;
  gap: 10px;
`;

const Spinner = styled(motion.span)`
  font-size: 24px;
  display: inline-block;
`;

const FEATURES = [
  ['📚', '100+ curated DSA problems'],
  ['🤖', 'AI mentor with 6 coaching modes'],
  ['🎬', '14+ algorithm visualizations'],
  ['📊', 'Streak tracking & weak topic heatmap'],
];

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Login() {
  const { user, loading, setUser } = useAuthContext();
  const navigate    = useNavigate();
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError,   setDemoError]   = useState('');

  useEffect(() => {
    if (!loading && user) navigate('/', { replace: true });
  }, [user, loading, navigate]);

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setDemoError('');
    try {
      const res  = await fetch(`${BASE}/auth/demo`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Demo login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user',  JSON.stringify(data.user));

      // Update auth context so the rest of the app recognises the demo user
      setUser(data.user);
      navigate('/', { replace: true });
    } catch (err) {
      setDemoError(err.message);
    } finally {
      setDemoLoading(false);
    }
  };

  if (loading) {
    return (
      <LoadingPage>
        <Spinner
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
        >
          ⚡
        </Spinner>
        <span>Checking session…</span>
      </LoadingPage>
    );
  }

  return (
    <Page>
      <Card
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <Logo>🥋</Logo>
        <Title>AlgoSensei</Title>
        <Subtitle>Your AI-powered DSA and technical interview prep mentor.</Subtitle>

        <ButtonGroup>
          <GoogleLoginButton />
          <DemoBtn onClick={handleDemoLogin} disabled={demoLoading || loading}>
            {demoLoading ? '⏳ Signing in…' : '🎭 Try Demo — No login required'}
          </DemoBtn>
          {demoError && (
            <DemoNote style={{ color: 'var(--red)' }}>⚠ {demoError}</DemoNote>
          )}
          <DemoNote>Read-only · expires in 2 hours · no account needed</DemoNote>
        </ButtonGroup>

        <Divider>what you get</Divider>

        <Features>
          {FEATURES.map(([icon, text]) => (
            <FeatureRow key={text}>
              <span style={{ fontSize: '16px' }}>{icon}</span>
              {text}
            </FeatureRow>
          ))}
        </Features>
      </Card>
    </Page>
  );
}