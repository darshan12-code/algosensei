import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', color: 'var(--text-muted)', fontSize: '14px', gap: '8px'
      }}>
        <span>⚡</span> Loading...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
}