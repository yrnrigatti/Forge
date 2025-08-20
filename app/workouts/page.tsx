'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { workoutService } from '@/services/workoutService'
import { WorkoutWithExercises, WorkoutFilters, WorkoutSortBy } from '@/types/workout'
import { WorkoutList } from '@/components/workouts/WorkoutList'
import { ErrorDisplay } from '@/components/ui/ErrorDisplay'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function WorkoutsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { error, handleError, clearErrors } = useErrorHandler()
  
  const [workouts, setWorkouts] = useState<WorkoutWithExercises[]>([])
  const [loading, setLoading] = useState(true)
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null)
  const [filters, setFilters] = useState<WorkoutFilters>({
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  })

  // Função para carregar treinos
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

  // Proteção de rota no cliente
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirectTo=/workouts')
      return
    }
  }, [user, authLoading, router])

  // Carregar treinos quando os filtros mudarem (com debounce para busca)
  useEffect(() => {
    if (!user) return

    // Limpar timer anterior
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer)
    }

    // Se há busca por texto, aplicar debounce
    if (filters.search) {
      const timer = setTimeout(() => {
        loadWorkouts(filters)
      }, 300) // 300ms de debounce
      setSearchDebounceTimer(timer)
    } else {
      // Para outros filtros, aplicar imediatamente
      loadWorkouts(filters)
    }

    return () => {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer)
      }
    }
  }, [filters, user])

  // Carregar treinos inicialmente
  useEffect(() => {
    if (user) {
      loadWorkouts()
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
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="w-10 h-10 rounded-lg transition-colors flex items-center justify-center"
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
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Meus Treinos</h1>
              <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>Gerencie seus treinos e rotinas</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/workouts/new')}
            className="px-6 py-2 rounded-lg font-medium transition-colors"
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

        {/* Filtros */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Busca */}
              <div className="flex-1 max-w-md">
                <Input
                  type="text"
                  placeholder="Buscar treinos..."
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="w-full"
                />
              </div>
              
              {/* Ordenação */}
              <div className="flex gap-2">
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilter('sortBy', e.target.value as WorkoutSortBy)}
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
            
            {/* Limpar filtros */}
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
          
          {/* Contador de resultados */}
          <div className="mt-2">
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {loading ? 'Carregando...' : `${workouts.length} treino${workouts.length !== 1 ? 's' : ''} encontrado${workouts.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        {/* Exibição de erros */}
        {error && (
          <ErrorDisplay
            error={error}
            className="mb-6"
          />
        )}

        {/* Lista de treinos */}
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