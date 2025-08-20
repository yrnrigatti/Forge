'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestSupabase() {
  const [status, setStatus] = useState('Testing...')

  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          setStatus(`Error: ${error.message}`)
        } else {
          setStatus('Connection successful!')
        }
      } catch (err) {
        setStatus(`Connection failed: ${err}`)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="p-8">
      <h1>Supabase Connection Test</h1>
      <p>Status: {status}</p>
      <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
      <p>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing'}</p>
    </div>
  )
}