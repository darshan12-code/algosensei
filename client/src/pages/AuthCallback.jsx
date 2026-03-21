import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Page = styled(motion.div)`
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 15px;
`;

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      navigate('/');
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <Page initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ fontSize: '32px' }}>⚡</div>
      <div>Logging you in...</div>
    </Page>
  );
}