import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Problems from './pages/Problems';
import Tech from './pages/Tech';
import Chat from './pages/Chat';
import Visualize from './pages/Visualize';
import Quiz from './pages/Quiz';
import Dashboard from './pages/Dashboard';

function Home() {
  return (
    <div style={{ maxWidth: '700px', margin: '60px auto', padding: '0 16px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '12px' }}>AlgoSensei 🥋</h1>
      <p style={{ color: '#666', fontSize: '16px', marginBottom: '32px' }}>
        Your AI-powered DSA + interview prep mentor
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {[
          { href: '/problems',  label: 'DSA Problems →',    bg: '#6366f1', color: '#fff'    },
          { href: '/tech',      label: 'Tech Questions →',  bg: '#fff',    color: '#1e293b' },
          { href: '/chat',      label: 'AI Mentor →',       bg: '#fff',    color: '#1e293b' },
          { href: '/visualize', label: '🎬 Visualizer →',   bg: '#fff',    color: '#1e293b' },
          { href: '/quiz',      label: '📝 Quiz →',         bg: '#fff',    color: '#1e293b' },
          { href: '/dashboard', label: '📊 Dashboard →',    bg: '#fff',    color: '#1e293b' },
        ].map(({ href, label, bg, color }) => (
          <a key={href} href={href} style={{
            padding: '12px 22px', borderRadius: '8px', background: bg, color,
            textDecoration: 'none', fontWeight: 600, fontSize: '14px',
            border: '1px solid #e2e8f0',
          }}>
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"              element={<Home />} />
        <Route path="/login"         element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/problems"      element={<Problems />} />
        <Route path="/tech"          element={<Tech />} />
        <Route path="/chat"          element={<Chat />} />
        <Route path="/visualize"     element={<Visualize />} />
        <Route path="/quiz"          element={<Quiz />} />
        <Route path="/dashboard"     element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}