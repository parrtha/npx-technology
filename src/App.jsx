
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

function App() {
  const [status, setStatus] = useState('Checking connection...')

  useEffect(() => {
    async function checkConnection() {
      const { error } = await supabase
        .from('connection_test')
        .select('*')
        .limit(1)

      if (!error) {
        setStatus('Supabase connected successfully!')
      } else if (error.code === '42P01') {
        setStatus('Supabase connected! Test table is not created yet.')
      } else {
        setStatus(`Connection check: ${error.message}`)
      }
    }

    checkConnection()
  }, [])

  return (
    <main style={{ padding: '40px', textAlign: 'center' }}>
      <h1>NPX TECHNOLOGY</h1>
      <h2>Supabase Connection Test</h2>
      <p>{status}</p>
    </main>
  )
}

export default App
