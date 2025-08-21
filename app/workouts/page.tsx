'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { workoutService } from '@/services/workoutService'
import { sessionService } from '@/services/sessionService'
import { WorkoutWithExercises, WorkoutFilters, WorkoutSortOption } from '@/types/workout'
import { SessionWithDetails } from '@/types/session'
import { WorkoutList } from '@/components/workouts/WorkoutList'
import { ErrorDisplay } from '@/components/ui/ErrorDisplay'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

export default function WorkoutsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { error, handleError, clearErrors } = useErrorHandler()
  
  const [workouts, setWorkouts] = useState<WorkoutWithExercises[]>([])
  const [activeSessions, setActiveSessions] = useState<SessionWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null)
  const [filters, setFilters] = useState<WorkoutFilters>({
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  })

  const loadWorkouts = async (currentFilters = filters) => {
    if (!user) return
    
    try {
      setLoading(true)
      clearErrors()
      const data = await workoutService.getWorkouts(currentFilters)
      setWorkouts(data)
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  const loadActiveSessions = async () => {
    if (!user) return
    
    try {
      const sessions = await sessionService.getSessions(
        { status: 'active' },
        'created_at_desc'
      )
      setActiveSessions(sessions)
    } catch (err) {
      console.error('Erro ao carregar sessões ativas:', err)
    }
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirectTo=/workouts')
      return
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return

    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer)
    }

    if (filters.search) {
      const timer = setTimeout(() => {
        loadWorkouts(filters)
      }, 300)
      setSearchDebounceTimer(timer)
    } else {
      loadWorkouts(filters)
    }

    return () => {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer)
      }
    }
  }, [filters, user])

  useEffect(() => {
    if (user) {
      loadWorkouts()
      loadActiveSessions()
    }
  }, [user])

  const handleDeleteWorkout = async (workout: WorkoutWithExercises) => {
    if (!confirm(`Tem certeza que deseja excluir o treino "${workout.name}"?`)) {
      return
    }

    try {
      await workoutService.deleteWorkout(workout.id)
      setWorkouts(prev => prev.filter(w => w.id !== workout.id))
    } catch (err) {
      handleError(err)
    }
  }

  const updateFilter = (key: keyof WorkoutFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      sortBy: 'created_at',
      sortOrder: 'desc'
    })
  }

  useEffect(() => {
    if (user) {
      loadWorkouts()
      loadActiveSessions()
    }
  }, [user])
  
  {activeSessions.length > 0 && (
    <Card className="p-6 mb-6" style={{ borderColor: 'var(--primary)' }}>
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
        🏃‍♂️ Sessões Ativas
      </h3>
      <div className="space-y-3">
        {activeSessions.map((session) => (
          <div 
            key={session.id} 
            className="flex justify-between items-center p-3 rounded-lg"
            style={{ background: 'var(--muted)' }}
          >
            <div>
              <p className="font-medium" style={{ color: 'var(--foreground)' }}>
                {session.workout?.name}
              </p>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Iniciado em {new Date(session.created_at).toLocaleString('pt-BR')}
              </p>
            </div>
            <Button
              onClick={() => router.push(`/sessions/${session.id}`)}
              size="sm"
              style={{
                background: 'var(--primary)',
                color: 'var(--foreground)'
              }}
            >
              Continuar
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )}

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    router.push('/auth/login')
    return null
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => router.push('/')}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition-colors flex items-center justify-center flex-shrink-0"
              style={{ 
                backgroundColor: 'var(--muted)',
                color: 'var(--muted-foreground)',
                border: '1px solid var(--border)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent)'
                e.currentTarget.style.color = 'var(--accent-foreground)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--muted)'
                e.currentTarget.style.color = 'var(--muted-foreground)'
              }}
              title="Voltar ao Início"
            >
              ←
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate" style={{ color: 'var(--foreground)' }}>Meus Treinos</h1>
              <p className="text-sm sm:text-base mt-1 truncate" style={{ color: 'var(--muted-foreground)' }}>Gerencie seus treinos e rotinas</p>
            </div>
          </div>
          
          <div className="flex justify-center sm:justify-end">
            <button
              onClick={() => router.push('/workouts/new')}
              className="px-4 py-2 sm:px-6 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-base w-full sm:w-auto max-w-xs sm:max-w-none"
              style={{ 
                background: 'var(--primary)', 
                color: 'var(--foreground)' 
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#e55a2b'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary)'}
            >
              + Novo Treino
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="flex-1 max-w-md">
                <Input
                  type="text"
                  placeholder="Buscar treinos..."
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilter('sortBy', e.target.value as WorkoutSortOption)}
                  className="px-3 py-2 rounded-lg border"
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)'
                  }}
                >
                  <option value="created_at">Data de Criação</option>
                  <option value="name">Nome</option>
                  <option value="exercise_count">Número de Exercícios</option>
                </select>
                
                <button
                  onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 rounded-lg border transition-colors"
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)'
                  }}
                  title={filters.sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}
                >
                  {filters.sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
            
            {(filters.search || filters.sortBy !== 'created_at' || filters.sortOrder !== 'desc') && (
              <Button
                onClick={clearFilters}
                className="px-4 py-2 text-sm"
                style={{
                  background: 'var(--muted)',
                  color: 'var(--muted-foreground)',
                  border: '1px solid var(--border)'
                }}
              >
                Limpar Filtros
              </Button>
            )}
          </div>
          
          <div className="mt-2">
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {loading ? 'Carregando...' : `${workouts.length} treino${workouts.length !== 1 ? 's' : ''} encontrado${workouts.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        {error && (
          <ErrorDisplay
            error={error}
            className="mb-6"
          />
        )}

        <WorkoutList
          workouts={workouts}
          loading={loading}
          onWorkoutClick={(workout) => router.push(`/workouts/${workout.id}`)}
          onWorkoutEdit={(workout) => router.push(`/workouts/${workout.id}/edit`)}
          onWorkoutDelete={handleDeleteWorkout}
          onCreateNew={() => router.push('/workouts/new')}
          showActions={true}
          emptyMessage={filters.search ? 'Nenhum treino encontrado' : 'Nenhum treino cadastrado'}
          emptyDescription={filters.search ? 'Tente ajustar os filtros ou criar um novo treino.' : 'Comece criando seu primeiro treino.'}
        />
      </div>
    </div>
  )
}