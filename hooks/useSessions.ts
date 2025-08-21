import { useState, useEffect, useCallback } from 'react'
import { SessionWithDetails, SessionFilters, SessionSortOption } from '@/types/session'
import { sessionService } from '@/services/sessionService'
import { useAuth } from './useAuth'

interface UseSessionsReturn {
  sessions: SessionWithDetails[]
  loading: boolean
  error: string | null
  refreshSessions: () => Promise<void>
  createSession: (workoutId: string) => Promise<SessionWithDetails | null>
  deleteSession: (id: string) => Promise<boolean>
  startWorkout: (workoutId: string) => Promise<SessionWithDetails | null>
}

export function useSessions(
  filters: SessionFilters = {},
  sortBy: SessionSortOption = 'created_at_desc'
): UseSessionsReturn {
  const [sessions, setSessions] = useState<SessionWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchSessions = useCallback(async () => {
    if (!user) {
      setSessions([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await sessionService.getSessions(filters, sortBy)
      setSessions(data)
    } catch (error) {
      console.error('Erro ao buscar sessões:', error)
      setError('Erro ao carregar sessões')
    } finally {
      setLoading(false)
    }
  }, [user, filters, sortBy])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const refreshSessions = useCallback(async () => {
    await fetchSessions()
  }, [fetchSessions])

  const createSession = useCallback(async (workoutId: string): Promise<SessionWithDetails | null> => {
    try {
      const newSession = await sessionService.createSession({
        workout_id: workoutId,
        status: 'active'
      })
      await refreshSessions()
      return newSession
    } catch (error) {
      console.error('Erro ao criar sessão:', error)
      setError('Erro ao criar sessão')
      return null
    }
  }, [refreshSessions])

  const deleteSession = useCallback(async (id: string): Promise<boolean> => {
    try {
      await sessionService.deleteSession(id)
      await refreshSessions()
      return true
    } catch (error) {
      console.error('Erro ao deletar sessão:', error)
      setError('Erro ao deletar sessão')
      return false
    }
  }, [refreshSessions])

  const startWorkout = useCallback(async (workoutId: string): Promise<SessionWithDetails | null> => {
    try {
      const session = await sessionService.startWorkout(workoutId)
      await refreshSessions()
      return session
    } catch (error) {
      console.error('Erro ao iniciar treino:', error)
      setError('Erro ao iniciar treino')
      return null
    }
  }, [refreshSessions])

  return {
    sessions,
    loading,
    error,
    refreshSessions,
    createSession,
    deleteSession,
    startWorkout
  }
}