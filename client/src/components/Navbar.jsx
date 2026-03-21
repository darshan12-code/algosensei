// client/src/components/Navbar.jsx
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '../context/AuthContext.jsx';

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  background: ${({ theme }) => theme.colors.bg}cc;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(12px);

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: 12px 16px;
  }
`;
const Brand = styled(Link)`
  font-weight: 800;
  font-size: 18px;
  letter-spacing: -0.5px;
  background: ${({ theme }) => theme.colors.gradientBrand};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;
const Links = styled.div`
  display: flex;
  gap: 2px;
  align-items: center;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  padding: 7px 12px;
  border-radius: ${({ theme }) => theme.radius.sm};
  font-size: 13px;
  font-weight: 500;
  color: ${({ $active, theme }) => $active ? theme.colors.accent : theme.colors.textSecondary};
  background: ${({ $active, theme }) => $active ? theme.colors.accentBg : 'transparent'};
  transition: all 0.15s;

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
    background: ${({ theme }) => theme.colors.bgHover};
  }
`;

const UserArea = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
`;

const AvatarWrapper = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid ${({ theme }) => theme.colors.border};
  transition: border-color 0.2s;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.accentBg};
  color: ${({ theme }) => theme.colors.accent};
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
  &:hover { border-color: ${({ theme }) => theme.colors.accent}; }
`;

const Dropdown = styled(motion.div)`
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  background: ${({ theme }) => theme.colors.bgSurface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 6px;
  min-width: 160px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  z-index: 200;
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: 9px 12px;
  text-align: left;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: ${({ theme }) => theme.colors.bgHover};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const LoginBtn = styled(Link)`
  padding: 7px 16px;
  border-radius: ${({ theme }) => theme.radius.sm};
  font-size: 13px;
  font-weight: 600;
  background: ${({ theme }) => theme.colors.accentBg};
  color: ${({ theme }) => theme.colors.accent};
  border: 1px solid ${({ theme }) => theme.colors.accentBorder};
  transition: all 0.15s;

  &:hover { background: ${({ theme }) => theme.colors.accent}; color: #fff; }
`;

const ThemeToggle = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bgSurface};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 16px;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;

  &:hover {
    background: ${({ theme }) => theme.colors.bgHover};
    color: ${({ theme }) => theme.colors.textPrimary};
    border-color: ${({ theme }) => theme.colors.accentBorder};
  }
`;

const HamburgerBtn = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 20px;
  padding: 4px;
  cursor: pointer;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: block;
  }
`;

const MobileMenu = styled(motion.div)`
  position: fixed;
  top: 57px;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.bgSurface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 99;
`;

const NAV_LINKS = [
  { to: '/',          label: 'Home' },
  { to: '/problems',  label: 'Problems' },
  { to: '/tech',      label: 'Tech' },
  { to: '/visualize', label: 'Visualize' },
  { to: '/quiz',      label: 'Quiz' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/chat',      label: 'AI Chat' },
];

const Navbar = ({ isDark, onToggleTheme }) => {
  const location = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuthContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);

  // ── NO redirect useEffect here — that was the bug ──

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  const handleDashboardNav = () => {
    navigate('/dashboard');
    setDropdownOpen(false);
  };

  return (
    <>
      <Nav>
        <Brand to="/">AlgoSensei 🥋</Brand>

        <Links>
          {NAV_LINKS.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              $active={l.to === '/' ? location.pathname === '/' : location.pathname.startsWith(l.to)}
            >
              {l.label}
            </NavLink>
          ))}
        </Links>

        <UserArea>
          <ThemeToggle
            onClick={onToggleTheme}
            whileTap={{ scale: 0.9 }}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {isDark ? '☀️' : '🌙'}
          </ThemeToggle>

          {user ? (
            <>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {user?.name?.split(' ')[0]}
              </span>
              <AvatarWrapper onClick={() => setDropdownOpen(v => !v)}>
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.target.style.display = 'none'; }}
                    referrerPolicy="no-referrer"
                  />
                ) : null}
                <span style={{
                  display: user.image ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                }}>
                  {user.name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </AvatarWrapper>

              <AnimatePresence>
                {dropdownOpen && (
                  <Dropdown
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                  >
                    <DropdownItem onClick={handleDashboardNav}>📊 Dashboard</DropdownItem>
                    <DropdownItem onClick={handleLogout}>Sign out</DropdownItem>
                  </Dropdown>
                )}
              </AnimatePresence>
            </>
          ) : (
            <LoginBtn to="/login">Login</LoginBtn>
          )}

          <HamburgerBtn onClick={() => setMobileOpen(v => !v)}>
            {mobileOpen ? '✕' : '☰'}
          </HamburgerBtn>
        </UserArea>
      </Nav>

      <AnimatePresence>
        {mobileOpen && (
          <MobileMenu
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {NAV_LINKS.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                $active={location.pathname === l.to}
                onClick={() => setMobileOpen(false)}
                style={{ display: 'block', padding: '10px 12px' }}
              >
                {l.label}
              </NavLink>
            ))}
            <button
              onClick={onToggleTheme}
              style={{
                marginTop: '8px', padding: '10px 12px', borderRadius: '6px',
                border: '1px solid var(--border)', background: 'transparent',
                color: 'var(--text-secondary)', fontSize: '13px',
                textAlign: 'left', cursor: 'pointer',
              }}
            >
              {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </MobileMenu>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;