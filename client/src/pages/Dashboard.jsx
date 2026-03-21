import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { apiFetch } from '../lib/api.js';
import SkeletonLoader from '../components/SkeletonLoader.jsx';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Page = styled.div`
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 16px 80px
`;

const PageTitle = styled(motion.h1)`
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.5px;
  margin-bottom: 4px;
`;

const PageSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  margin-bottom: 32px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr 1fr;
  }
`;

const StatCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.bgSurface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: 20px;
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -1px;
  color: ${({ $color, theme }) => $color || theme.colors.textPrimary};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeatmapGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
  margin-bottom: 32px;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr 1fr;
  }
`;

const HeatCard = styled(motion.div)`
  padding: 14px;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ $bg }) => $bg};
  border: 1px solid ${({ $color }) => $color + '30'};
  cursor: pointer;
  transition: transform 0.15s;

  &:hover { transform: scale(1.02); }
`;

const SessionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SessionRow = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: ${({ theme }) => theme.colors.bgSurface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  flex-wrap: wrap;
`;



const Tag = styled.span`
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 20px;
  background: ${({ theme }) => theme.colors.bgHover};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const GreenTag = styled(Tag)`
  background: ${({ theme }) => theme.colors.greenBg};
  color: ${({ theme }) => theme.colors.green};
`;

const EmptyBox = styled.div`
  padding: 32px;
  text-align: center;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 14px;
`;

function heatColor(failRate, attempts) {
  if (attempts < 2) return { bg: 'rgba(59,130,246,0.08)', color: '#3b82f6', label: 'New' };
  if (failRate >= 0.7) return { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', label: 'Critical' };
  if (failRate >= 0.4) return { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', label: 'Weak' };
  return { bg: 'rgba(34,197,94,0.12)', color: '#22c55e', label: 'Good' };
}



const fadeUp = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  },
};
function RadialStat({ value, max, color, label }) {
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const r = 28;
  const c = 2 * Math.PI * r;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <svg width="68" height="68" viewBox="0 0 68 68">
        <circle cx="34" cy="34" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <motion.circle
          cx="34" cy="34" r={r}
          fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round" strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - pct * c }}
          transition={{ duration: 1.2, ease: [0.16,1,0.3,1] }}
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
        />
        <text x="34" y="38" textAnchor="middle" fill={color} fontSize="14" fontWeight="800">{value}</text>
      </svg>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px', textAlign: 'center' }}>{label}</div>
    </div>
  );
}
export default function Dashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch('/api/dashboard')
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Page><SkeletonLoader count={6} /></Page>;
  if (!data) return <Page><EmptyBox>Please log in to see your dashboard.</EmptyBox></Page>;

  const maxActivity = Math.max(...(data.activityDays?.map(d => d.count) || [1]), 1);

  return (
    <Page>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <PageTitle>📊 Your Dashboard</PageTitle>
        <PageSubtitle>Track your progress, identify weak spots, and keep your streak going.</PageSubtitle>
      </motion.div>

      <StatsGrid>
        {[
          { label: 'Problems Solved', value: data.solvedCount ?? 0, color: '#22c55e' },
          { label: 'Day Streak', value: `${data.streak ?? 0}${data.streak > 0 ? ' 🔥' : ''}`, color: data.streak > 0 ? '#f59e0b' : undefined },
          { label: 'Quiz Accuracy', value: data.quizAccuracy != null ? `${data.quizAccuracy}%` : '—', color: '#6366f1' },
          { label: 'Total Sessions', value: data.sessionCount ?? 0, color: '#3b82f6' },
        ].map((s, i) => (
          <StatCard key={s.label} variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: i * 0.08 }}>
            <StatValue $color={s.color}>{s.value}</StatValue>
            <StatLabel>{s.label}</StatLabel>
          </StatCard>
        ))}
      </StatsGrid>
{/* // for Problems Solved and Streak (the two most impactful stats):
<div style={{ display: 'flex', gap: '32px', justifyContent: 'center', marginBottom: '32px', flexWrap: 'wrap' }}>
  <RadialStat value={data.solvedCount ?? 0} max={100} color="#22c55e" label="SOLVED" />
  <RadialStat value={data.streak ?? 0} max={30} color="#f59e0b" label="STREAK" />
  <RadialStat value={data.quizAccuracy ?? 0} max={100} color="#6366f1" label="ACCURACY %" />
  <RadialStat value={data.sessionCount ?? 0} max={50} color="#3b82f6" label="SESSIONS" />
</div> */}
      <SectionTitle>7-Day Activity</SectionTitle>
           
        <div style={{ marginBottom: '32px', height: '120px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.activityDays || []} margin={{ top: 5, right: 0, left: -30, bottom: 0 }}>
              <defs>
                <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#5a5a72' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: '#1a1a25', border: '1px solid #2a2a3a', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#e8e8ed' }}
                itemStyle={{ color: '#818cf8' }}
              />
              <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#actGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      <div style={{ marginBottom: '32px' }} />

      <SectionTitle>
        Topic Heatmap
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 400 }}>Click to practice</span>
      </SectionTitle>
      {!data.weakTopics?.length ? (
        <EmptyBox style={{ marginBottom: '32px' }}>No quiz data yet — take a quiz to populate your heatmap</EmptyBox>
      ) : (
        <HeatmapGrid>
          {data.weakTopics.map((t, i) => {
            const { bg, color, label } = heatColor(t.failRate, t.attemptCount);
            return (
              <HeatCard
                key={i}
                $bg={bg}
                $color={color}
                onClick={() => navigate(t.type === 'dsa' ? `/problems?topic=${encodeURIComponent(t.topic)}` : `/tech?category=${encodeURIComponent(t.topic)}`)}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
              >
                <div style={{ fontSize: '13px', fontWeight: 700, color, marginBottom: '4px' }}>{t.topic}</div>
                <div style={{ fontSize: '11px', color, opacity: 0.8 }}>{label} · {Math.round(t.failRate * 100)}% fail</div>
                <div style={{ height: '4px', borderRadius: '2px', background: color + '30', overflow: 'hidden', marginTop: '8px' }}>
                  <div style={{ height: '100%', width: `${Math.round(t.failRate * 100)}%`, background: color, borderRadius: '2px', transition: 'width 0.5s' }} />
                </div>
                <div style={{ fontSize: '10px', color, opacity: 0.7, marginTop: '4px' }}>{t.attemptCount} attempts</div>
              </HeatCard>
            );
          })}
        </HeatmapGrid>
      )}

      <SectionTitle>Recent Sessions</SectionTitle>
      {!data.recentSessions?.length ? (
        <EmptyBox>No sessions yet — <span onClick={() => navigate('/problems')} style={{ color: '#6366f1', cursor: 'pointer' }}>start a problem</span></EmptyBox>
      ) : (
        <SessionList>
          {data.recentSessions.map((s, i) => (
            <SessionRow key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
              <span style={{ fontSize: '18px' }}>
                {s.mode === 'dsa_hint' ? '💡' : s.mode === 'dsa_reveal' ? '🔓' : s.mode === 'tech_explain' ? '📖' : '🎤'}
              </span>
              <span style={{ flex: 1, fontSize: '14px', fontWeight: 600, minWidth: '100px' }}>
                {s.problemId?.title || 'Tech Session'}
              </span>
              <Tag>{s.mode?.replace('_', ' ')}</Tag>
              {s.solved && <GreenTag>✓ Solved</GreenTag>}
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(s.completedAt).toLocaleDateString()}</span>
              {s.problemId && (
                <button
                  onClick={() => navigate(`/chat?problemId=${s.problemId._id}`)}
                  style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'none', color: 'inherit', cursor: 'pointer' }}
                >
                  Continue →
                </button>
              )}
            </SessionRow>
          ))}
        </SessionList>
      )}
    </Page>
  );
}