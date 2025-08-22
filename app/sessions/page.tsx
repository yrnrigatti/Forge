'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { sessionService } from '@/services/sessionService'
import { SessionWithDetails, SessionFilters, SessionSortOption } from '@/types/session'
import { SessionList } from '@/components/sessions/SessionList'
import { ErrorDisplay } from '@/components/ui/ErrorDisplay'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

export default function SessionsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { error, handleError, clearErrors } = useErrorHandler()
  
  const [sessions, setSessions] = useState<SessionWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null)
  const [filters, setFilters] = useState<SessionFilters>({
    search: '',
    status: undefined,
    workout_id: undefined,
    date_from: undefined,
    date_to: undefined
  })
  const [sortBy, setSortBy] = useState<SessionSortOption>('created_at_desc')

  // Função para carregar sessões
  const loadSessions = async (currentFilters = filters, currentSortBy = sortBy) => {
    if (!user) return
    
    try {
      setLoading(true)
      clearErrors()
      const data = await sessionService.getSessions(currentFilters, currentSortBy)
      setSessions(data)
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  // Proteção de rota no cliente
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirectTo=/sessions')
      return
    }
  }, [user, authLoading, router])

  // Carregar sessões quando o usuário estiver autenticado
  useEffect(() => {
    if (user) {
      loadSessions()
    }
  }, [user, filters, sortBy])

  // Debounce para busca
  const handleSearchChange = (value: string) => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer)
    }

    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: value }))
    }, 300)

    setSearchDebounceTimer(timer)
  }

  // Handlers para ações das sessões
  const handleSessionClick = (session: SessionWithDetails) => {
    router.push(`/sessions/${session.id}`)
  }

  const handleSessionEdit = (session: SessionWithDetails) => {
    router.push(`/sessions/${session.id}/edit`)
  }

  const handleSessionDelete = async (session: SessionWithDetails) => {
    if (!confirm('Tem certeza que deseja excluir esta sessão?')) {
      return
    }

    try {
      await sessionService.deleteSession(session.id)
      await loadSessions()
    } catch (err) {
      handleError(err)
    }
  }

  const handleSessionContinue = (session: SessionWithDetails) => {
    if (session.workout_id) {
      router.push(`/workouts/${session.workout_id}/start?sessionId=${session.id}`)
    }
  }

  const handleStatusFilterChange = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: status === 'all' ? undefined : status as 'active' | 'completed' | 'cancelled'
    }))
  }

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy as SessionSortOption)
  }

  // Loading state durante autenticação
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Não renderizar nada se não estiver autenticado (redirecionamento em andamento)
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          {/* Linha superior: título */}
          <div className="flex items-center gap-3 mb-4 sm:mb-0">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate" style={{ color: 'var(--foreground)' }}>Minhas Sessões</h1>
              <p className="text-sm sm:text-base mt-1 truncate" style={{ color: 'var(--muted-foreground)' }}>Histórico de treinos realizados</p>
            </div>
          </div>
          
          {/* Linha inferior: botão nova sessão */}
          <div className="flex justify-center sm:justify-end">
            <button
              onClick={() => router.push('/sessions/new')}
              className="px-4 py-2 sm:px-6 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-base w-full sm:w-auto max-w-xs sm:max-w-none"
              style={{ 
                background: 'var(--primary)', 
                color: 'var(--foreground)' 
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#e55a2b'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary)'}
            >
              + Nova Sessão
            </button>
          </div>
        </div>

        {/* Filtros e busca */}
        <Card className="p-6 mb-6" style={{ 
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)'
        }}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Busca */}
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Buscar</label>
                <Input
                  placeholder="Buscar por treino ou observações..."
                  onChange={(e) => handleSearchChange(e.target.value)}
                  style={{
                    backgroundColor: 'var(--input)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)'
                  }}
                />
              </div>

              {/* Filtro por status */}
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Status</label>
                <select
                  value={filters.status || 'all'}
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{
                    backgroundColor: 'var(--input)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)'
                  }}
                >
                  <option value="all">Todos</option>
                  <option value="active">Em andamento</option>
                  <option value="completed">Concluídas</option>
                  <option value="cancelled">Canceladas</option>
                </select>
              </div>

              {/* Ordenação */}
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Ordenar por</label>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{
                    backgroundColor: 'var(--input)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)'
                  }}
                >
                  <option value="created_at_desc">Mais recentes</option>
                  <option value="created_at_asc">Mais antigas</option>
                  <option value="started_at_desc">Início mais recente</option>
                  <option value="started_at_asc">Início mais antigo</option>
                  <option value="workout_name_asc">Nome do treino (A-Z)</option>
                  <option value="workout_name_desc">Nome do treino (Z-A)</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Error Display */}
        {error && (
          <div className="mb-6">
            <ErrorDisplay error={error} />
          </div>
        )}

        <SessionList
          sessions={sessions}
          loading={loading}
          error={error?.getUserFriendlyMessage() || null}
          onSessionClick={handleSessionClick}
          onSessionEdit={handleSessionEdit}
          onSessionDelete={handleSessionDelete}
          onSessionContinue={handleSessionContinue}
          showActions={true}
          emptyMessage="Nenhuma sessão encontrada"
        />
      </div>
    </div>
  )
}