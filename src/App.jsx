
function App() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      padding: '24px',
      background: 'var(--background)',
      color: 'var(--text-primary)',
    }}>
      <h1 style={{
        fontSize: 'clamp(36px, 6vw, 64px)',
        fontWeight: 800,
        marginBottom: '12px',
      }}>
        NPX TECHNOLOGY
      </h1>

      <p style={{
        color: 'var(--text-secondary)',
        fontSize: '18px',
      }}>
        Web Development • Software • Digital Solutions
      </p>

      <p>
        Building Digital Experiences That Matter.
      </p>
    </main>
  )
}

export default App
