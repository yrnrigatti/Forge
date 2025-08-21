'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { sessionService } from '@/services/sessionService'
import { SessionWithDetails, UpdateSessionData } from '@/types/session'
import { SessionForm } from '@/components/sessions/SessionForm'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ErrorDisplay } from '@/components/ui/ErrorDisplay'
import { useAuth } from '@/hooks/useAuth'
import { useErrorHandler } from '@/hooks/useErrorHandler'

export default function EditSessionPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.id as string
  const { user, loading: authLoading } = useAuth()
  const { error, handleError, clearErrors } = useErrorHandler()
  
  const [session, setSession] = useState<SessionWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Proteção de rota
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirectTo=/sessions')
      return
    }
  }, [user, authLoading, router])

  // Carregar sessão
  useEffect(() => {
    if (user && sessionId) {
      loadSession()
    }
  }, [user, sessionId])

  const loadSession = async () => {
    try {
      setLoading(true)
      clearErrors()
      const sessionData = await sessionService.getSessionById(sessionId)
      setSession(sessionData)
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: UpdateSessionData) => {
    if (!session) return

    try {
      setSaving(true)
      clearErrors()
      await sessionService.updateSession(session.id, data)
      router.push(`/sessions/${session.id}`)
    } catch (err) {
      handleError(err)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/sessions')
  }

  if (authLoading || loading) {
    return (
      <div 
        className="container mx-auto p-6"
        style={{
          backgroundColor: 'var(--background)',
          color: 'var(--foreground)',
          minHeight: '100vh'
        }}
      >
        <div className="flex justify-center items-center h-64">
          <div 
            className="text-lg"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Carregando sessão...
          </div>
        </div>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div 
        className="container mx-auto p-6"
        style={{
          backgroundColor: 'var(--background)',
          color: 'var(--foreground)',
          minHeight: '100vh'
        }}
      >
        <div className="mb-6">
          <Button 
            onClick={() => router.push('/sessions')}
            variant="secondary"
          >
            ← Voltar para Sessões
          </Button>
        </div>
        
        <ErrorDisplay 
          error={error || 'Sessão não encontrada'} 
          onRetry={loadSession}
        />
      </div>
    )
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
      <div className="mb-6">
        <Button 
          onClick={() => router.push(`/sessions/${sessionId}`)}
          variant="secondary"
        >
          ← Voltar para Sessão
        </Button>
      </div>

      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
          Editar Sessão
        </h1>
        
        {session.workout && (
          <div className="mb-4 p-3 rounded-lg" style={{ background: 'var(--muted)' }}>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Treino:</p>
            <p className="font-medium" style={{ color: 'var(--foreground)' }}>
              {session.workout.name}
            </p>
          </div>
        )}

        <SessionForm
          initialData={{
            status: session.status,
            notes: session.notes || ''
          }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Atualizar Sessão"
          isLoading={saving}
          isUpdate={true}
        />
      </Card>
    </div>
  )
}