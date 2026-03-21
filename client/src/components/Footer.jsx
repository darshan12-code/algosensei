// client/src/components/Footer.jsx
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FooterBar = styled.footer`
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
  background: ${({ theme }) => theme.colors.bgRaised};
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  flex-shrink: 0; /* don't shrink inside flex column root */

  @media (max-width: 600px) {
    flex-direction: column;
    text-align: center;
    padding: 14px 16px;
    gap: 8px;
  }
`;

const BrandMark = styled(Link)`
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-decoration: none;
  transition: color 0.15s;
  &:hover { color: ${({ theme }) => theme.colors.textPrimary}; }
`;

const GradText = styled.span`
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.accent} 0%,
    ${({ theme }) => theme.colors.accentHover} 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
`;

const FooterLink = styled(Link)`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  transition: color 0.15s;
  &:hover { color: ${({ theme }) => theme.colors.accent}; }
`;

const BuilderBadge = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 20px;
  background: ${({ theme }) => theme.colors.accentBg};
  border: 1px solid ${({ theme }) => theme.colors.accentBorder};
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.accent};
  cursor: default;
`;

const NAV = [
  { to: '/problems', label: 'Problems' },
  { to: '/tech',     label: 'Tech Q&A' },
  { to: '/visualize',label: 'Visualizer' },
  { to: '/quiz',     label: 'Quiz' },
  { to: '/chat',     label: 'AI Chat' },
  { to: '/dashboard',label: 'Dashboard' },
];

export default function Footer() {
  return (
    <FooterBar>
      <BrandMark to="/">
        <GradText>AlgoSensei</GradText>
        <span style={{ fontSize: '16px' }}>🥋</span>
      </BrandMark>

      <FooterLinks>
        {NAV.map(n => (
          <FooterLink key={n.to} to={n.to}>{n.label}</FooterLink>
        ))}
      </FooterLinks>

      <BuilderBadge
        whileHover={{ scale: 1.04 }}
        title="AlgoSensei — built end-to-end by Darshan Agrawal (Full Stack Engineer)"
      >
        ⚡ Built by Darshan Agrawal
      </BuilderBadge>
    </FooterBar>
  );
}