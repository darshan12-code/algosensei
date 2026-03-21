import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

const Skeleton = styled.div`
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.bgRaised} 25%,
    ${({ theme }) => theme.colors.bgHover} 50%,
    ${({ theme }) => theme.colors.bgRaised} 75%
  );
  background-size: 800px 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: ${({ theme }) => theme.radius.md};
  height: ${({ $height }) => $height || '20px'};
  margin-bottom: 12px;
  width: ${({ $width }) => $width || '100%'};
`;

export default function SkeletonLoader({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ marginBottom: '16px' }}>
          <Skeleton $height="18px" $width={`${70 + Math.random() * 30}%`} />
          <Skeleton $height="14px" $width={`${40 + Math.random() * 40}%`} />
        </div>
      ))}
    </>
  );
}