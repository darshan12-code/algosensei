// src/components/Tooltip.jsx
import { useState } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
`;

const Tip = styled.div`
  position: absolute;
  bottom: calc(100% + 8px);
  /* Default: centre over element */
  left: 50%;
  transform: translateX(-50%);
  background: ${({ theme }) => theme.colors.bgActive};
  color: ${({ theme }) => theme.colors.textPrimary};
  border: 1px solid ${({ theme }) => theme.colors.accentBorder};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 6px 11px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
  width: max-content;
  max-width: 200px;
  white-space: normal;
  text-align: center;
  z-index: 9999;
  pointer-events: none;
  box-shadow: ${({ theme }) => theme.shadows.md};
  /* No framer-motion — plain CSS opacity transition, zero layout jank */
  opacity: 0;
  transition: opacity 0.12s ease;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: ${({ theme }) => theme.colors.bgActive};
  }
`;

const WrapperHoverable = styled(Wrapper)`
  &:hover ${Tip},
  &:focus-within ${Tip} {
    opacity: 1;
  }
`;

export default function Tooltip({ children, text }) {
  if (!text) return <>{children}</>;

  return (
    <WrapperHoverable>
      {children}
      <Tip role="tooltip">{text}</Tip>
    </WrapperHoverable>
  );
}