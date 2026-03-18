import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    axios.get('http://localhost:5000/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setUser(res.data))
    .catch(() => localStorage.removeItem('token'));
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return (
    <nav style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 24px', borderBottom: '1px solid #eee', background: '#fff'
    }}>
      <Link to="/" style={{ fontWeight: 700, fontSize: '18px', textDecoration: 'none', color: '#000' }}>
        AlgoSensei 🥋
      </Link>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link to="/problems"  style={{ textDecoration: 'none', color: '#333', fontSize: '14px' }}>Problems</Link>
        <Link to="/tech"      style={{ textDecoration: 'none', color: '#333', fontSize: '14px' }}>Tech</Link>
        <Link to="/visualize" style={{ textDecoration: 'none', color: '#333', fontSize: '14px' }}>Visualize</Link>
        <Link to="/quiz"      style={{ textDecoration: 'none', color: '#333', fontSize: '14px' }}>Quiz</Link>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: '#333', fontSize: '14px' }}>Dashboard</Link>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={user.image} width={32} height={32}
              style={{ borderRadius: '50%' }} alt={user.name} />
            <span style={{ fontSize: '14px' }}>{user.name.split(' ')[0]}</span>
            <button onClick={logout}
              style={{ fontSize: '13px', padding: '4px 12px', cursor: 'pointer', borderRadius: '6px' }}>
              Sign out
            </button>
          </div>
        ) : (
          <Link to="/login" style={{ textDecoration: 'none', color: '#333' }}>Login</Link>
        )}
      </div>
    </nav>
  );
}