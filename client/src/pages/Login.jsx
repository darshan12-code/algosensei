import GoogleLoginButton from '../components/GoogleLoginButton';

export default function Login() {
  return (
    <div style={{
      height: '80vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '20px'
    }}>
      <h1 style={{ fontSize: '32px', fontWeight: 700 }}>AlgoSensei 🥋</h1>
      <p style={{ color: '#666', fontSize: '16px' }}>Your AI-powered DSA + interview prep mentor</p>
      <GoogleLoginButton />
    </div>
  );
}