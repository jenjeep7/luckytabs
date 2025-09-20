export default function PrivacyPolicy() {
  return (
    <div style={{
      maxWidth: 520,
      margin: '2.5rem auto',
      padding: '1.5rem 1.2rem',
      background: '#181b22',
      borderRadius: '14px',
      border: '1.5px solid #7DF9FF',
      boxShadow: '0 0 24px 0 rgba(125,249,255,0.10)',
      color: '#EAF6FF',
      fontSize: '1.01rem',
      lineHeight: 1.7,
      textAlign: 'left',
      fontFamily: 'Inter, system-ui, Arial, sans-serif',
    }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={() => window.history.back()}
          style={{
            marginBottom: '1.5rem',
            padding: '0.5rem 1.2rem',
            fontSize: '1rem',
            fontWeight: 600,
            borderRadius: '6px',
            border: '1px solid #7DF9FF',
            background: '#101217',
            color: '#7DF9FF',
            cursor: 'pointer',
            boxShadow: '0 0 8px 0 rgba(125,249,255,0.15)',
            transition: 'all 0.2s',
          }}
          aria-label="Go back"
        >
          ← Back
        </button>
      </div>
      <h2 style={{ textAlign: 'center', marginTop: 0, marginBottom: '1.2rem', color: '#7DF9FF', fontWeight: 900, letterSpacing: '.01em' }}>🔐 Tabsy Wins Privacy Policy</h2>
      <p>Welcome to Tabsy Wins! We’re all about smarter play, community connection, and magical experiences—but we take your privacy just as seriously as your streaks. This Privacy Policy explains how we collect, use, and protect your information when you use our app and website.</p>
      <h2>🧙‍♂️ What We Collect</h2>
      <p>We collect two types of data to help Tabsy work his magic:</p>
      <h3>1. Personal Information</h3>
      <p>Only what you choose to share, such as:</p>
      <ul>
        <li>Username or nickname</li>
        <li>Email address (for account setup, support, or tier upgrades)</li>
        <li>Profile photo or avatar (optional)</li>
      </ul>
      <h3>2. Gameplay & Usage Data</h3>
      <p>To improve predictions and community features:</p>
      <ul>
        <li>Session logs (game type, location, wins/losses)</li>
        <li>Flare scans and uploaded images</li>
        <li>Streak tracking and budget tools</li>
        <li>Device type and app usage patterns</li>
      </ul>
      <h2>🔍 How We Use Your Data</h2>
      <p>Tabsy uses your data to:</p>
      <ul>
        <li>Provide smarter predictions and personalized insights</li>
        <li>Track your play history and streaks</li>
        <li>Power community features like leaderboards and Flare sharing</li>
        <li>Improve app performance and user experience</li>
        <li>Send occasional updates or feature drops (if you opt in)</li>
      </ul>
      <p><strong>We do not sell your data. Ever.</strong></p>
      <h2>🤝 Third-Party Services</h2>
      <p>We may use trusted third-party tools for:</p>
      <ul>
        <li>Analytics (to improve the app)</li>
        <li>Image processing (for Flare scans)</li>
        <li>Payment processing (for tier upgrades)</li>
      </ul>
      <p>These services follow strict data protection standards. We never share more than necessary.</p>
      <h2>🔐 Data Security</h2>
      <p>We protect your data with:</p>
      <ul>
        <li>Encryption and secure servers</li>
        <li>Regular security audits</li>
        <li>Limited access controls</li>
      </ul>
      <p>If there’s ever a breach, we’ll notify affected users promptly and take immediate action.</p>
      <h2>🧙‍♂️ Final Word from Tabsy</h2>
      <p>Tabsy’s mission is to make pull tab play smarter, safer, and more fun. That starts with trust. We’ll always be transparent, respectful, and ready to listen.</p>
    </div>
  );
}
