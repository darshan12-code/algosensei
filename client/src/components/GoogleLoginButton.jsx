import styled from 'styled-components';
import { motion } from 'framer-motion';

const Btn = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 28px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bgSurface};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accentBorder};
    background: ${({ theme }) => theme.colors.bgHover};
  }
`;

export default function GoogleLoginButton() {
  return (
    <Btn
      onClick={() => {
        window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/auth/google`;
      }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width={20} alt="Google" />
      Continue with Google
    </Btn>
  );
}