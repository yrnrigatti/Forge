'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { sessionService } from '@/services/sessionService'
import { CreateSessionData } from '@/types/session'
import { SessionForm } from '@/components/sessions/SessionForm'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { ErrorDisplay } from '@/components/ui/ErrorDisplay'

export default function NewSessionPage() {
  const [loading, setLoading] = useState(false)
  const { user, loading: authLoading } = useAuth()
  const { error, handleError, clearErrors } = useErrorHandler()
  const router = useRouter()

  const handleSubmit = async (data: CreateSessionData) => {
    if (!user) {
      handleError(new Error('Usuário não autenticado'))
      return
    }

    try {
      setLoading(true)
      clearErrors()
      
      const session = await sessionService.createSession(data)
      
      // Redirecionar para a página de detalhes da sessão criada
      router.push(`/sessions/${session.id}`)
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  // Proteção de rota
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    router.push('/auth/login?redirectTo=/sessions/new')
    return null
  }

  return (
    <div 
      className="container mx-auto p-6 max-w-2xl"
      style={{
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
        minHeight: '100vh'
      }}
    >
      {/* Header */}
      <div className="mb-6">
        <Button 
          onClick={() => router.back()}
          variant="secondary"
          className="mb-4"
        >
          ← Voltar
        </Button>
        <h1 
          className="text-3xl font-bold"
          style={{
            color: 'var(--foreground)'
          }}
        >
          Nova Sessão
        </h1>
        <p 
          className="mt-1"
          style={{
            color: 'var(--muted-foreground)'
          }}
        >
          Crie uma nova sessão de treino
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6">
          <ErrorDisplay message={error} />
        </div>
      )}

      {/* Form */}
      <Card 
        className="p-6"
        style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          color: 'var(--foreground)'
        }}
      >
        <SessionForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Criar Sessão"
          isLoading={loading}
        />
      </Card>
    </div>
  )
}