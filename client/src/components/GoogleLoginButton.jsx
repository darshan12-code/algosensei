export default function GoogleLoginButton() {
  const handleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google';
  };

  return (
    <button onClick={handleLogin} style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '10px 20px', borderRadius: '8px',
      border: '1px solid #ccc', background: '#fff',
      cursor: 'pointer', fontSize: '15px', fontWeight: 500
    }}>
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        width={20} alt="Google"
      />
      Continue with Google
    </button>
  );
}