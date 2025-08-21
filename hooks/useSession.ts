import { useState, useEffect, useCallback } from 'react'
import { SessionWithDetails } from '@/types/session'
import { sessionService } from '@/services/sessionService'
import { useAuth } from './useAuth'

interface UseSessionReturn {
  session: SessionWithDetails | null
  loading: boolean
  error: string | null
  refreshSession: () => Promise<void>
  addSet: (exerciseId: string, weight: number, reps: number, notes?: string) => Promise<boolean>
  updateSet: (setId: string, weight: number, reps: number, notes?: string) => Promise<boolean>
  removeSet: (setId: string) => Promise<boolean>
  completeSession: () => Promise<boolean>
}

export function useSession(sessionId: string): UseSessionReturn {
  const [session, setSession] = useState<SessionWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchSession = useCallback(async () => {
    if (!user || !sessionId) {
      setSession(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await sessionService.getSessionById(sessionId)
      setSession(data)
    } catch (error) {
      console.error('Erro ao buscar sessão:', error)
      setError('Sessão não encontrada')
    } finally {
      setLoading(false)
    }
  }, [user, sessionId])

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  const refreshSession = useCallback(async () => {
    await fetchSession()
  }, [fetchSession])

  const addSet = useCallback(async (exerciseId: string, weight: number, reps: number, notes?: string): Promise<boolean> => {
    if (!session) return false
  
    try {
      await sessionService.addSetToSession(session.id, {
        exercise_id: exerciseId,
        weight,
        reps,
        notes
      })
      await refreshSession()
      return true
    } catch (error) {
      console.error('Erro ao adicionar série:', error)
      setError('Erro ao adicionar série')
      return false
    }
  }, [session, refreshSession])

  const updateSet = useCallback(async (setId: string, weight: number, reps: number, notes?: string): Promise<boolean> => {
    try {
      await sessionService.updateSet(setId, { weight, reps, notes })
      await refreshSession()
      return true
    } catch (error) {
      console.error('Erro ao atualizar série:', error)
      setError('Erro ao atualizar série')
      return false
    }
  }, [refreshSession])

  const removeSet = useCallback(async (setId: string): Promise<boolean> => {
    try {
      await sessionService.removeSetFromSession(setId)
      await refreshSession()
      return true
    } catch (error) {
      console.error('Erro ao remover série:', error)
      setError('Erro ao remover série')
      return false
    }
  }, [refreshSession])

  const completeSession = useCallback(async (): Promise<boolean> => {
    if (!session) return false

    try {
      await sessionService.updateSession(session.id, {
        status: 'completed',
        ended_at: new Date().toISOString()
      })
      await refreshSession()
      return true
    } catch (error) {
      console.error('Erro ao finalizar sessão:', error)
      setError('Erro ao finalizar sessão')
      return false
    }
  }, [session, refreshSession])

  return {
    session,
    loading,
    error,
    refreshSession,
    addSet,
    updateSet,
    removeSet,
    completeSession
  }
}