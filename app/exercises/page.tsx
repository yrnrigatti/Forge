'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { exerciseService } from '@/services/exerciseService'
import { Exercise } from '@/types/exercise'
import { ExerciseCard } from '@/components/exercises/ExerciseCard'
import { ExerciseFiltersComponent } from '@/components/exercises/ExerciseFilters'
import { ActiveFilters } from '@/components/exercises/ActiveFilters'
import { ErrorDisplay } from '@/components/ui/ErrorDisplay'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { useExerciseFilters } from '@/hooks/useExerciseFilters'
import { useAuth } from '@/hooks/useAuth'

export default function ExercisesPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { error, handleError, clearErrors } = useErrorHandler()
  const { filters, updateFilter, clearFilters } = useExerciseFilters()
  
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  // Função para carregar exercícios (movida para dentro do componente)
  const loadExercises = async (currentFilters = filters) => {
    if (!user) return // Não carregar se não estiver autenticado
    
    try {
      setLoading(true)
      clearErrors()
      const data = await exerciseService.getExercises(currentFilters)
      setExercises(data)
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  // Proteção de rota no cliente
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirectTo=/exercises')
      return
    }
  }, [user, authLoading, router])

  // Carregar exercícios quando os filtros mudarem (com debounce para busca)
  useEffect(() => {
    if (!user) return

    // Limpar timer anterior
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer)
    }

    // Se há busca por texto, aplicar debounce
    if (filters.search) {
      const timer = setTimeout(() => {
        loadExercises(filters)
      }, 300) // 300ms de debounce
      setSearchDebounceTimer(timer)
    } else {
      // Para outros filtros, aplicar imediatamente
      loadExercises(filters)
    }

    return () => {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer)
      }
    }
  }, [filters, user])

  // Carregar exercícios inicialmente
  useEffect(() => {
    if (user) {
      loadExercises()
    }
  }, [user])

  const handleDeleteExercise = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este exercício?')) {
      return
    }

    try {
      await exerciseService.deleteExercise(id)
      setExercises(prev => prev.filter(exercise => exercise.id !== id))
    } catch (err) {
      handleError(err)
    }
  }

  const handleRemoveFilter = (key: keyof typeof filters) => {
    updateFilter(key, undefined)
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
              <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Meus Exercícios</h1>
              <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>Gerencie sua biblioteca de exercícios</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/exercises/new')}
            className="px-6 py-2 rounded-lg font-medium transition-colors"
            style={{ 
              background: 'var(--primary)', 
              color: 'var(--foreground)' 
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#e55a2b'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary)'}
          >
            + Novo Exercício
          </button>
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <ExerciseFiltersComponent
            filters={filters}
            onFiltersChange={(newFilters) => {
              Object.entries(newFilters).forEach(([key, value]) => {
                updateFilter(key as keyof typeof filters, value)
              })
            }}
            onClearFilters={clearFilters}
            exerciseCount={exercises.length}
          />
        </div>

        {/* Filtros ativos */}
        <ActiveFilters
          filters={filters}
          onRemoveFilter={handleRemoveFilter}
          onClearAll={clearFilters}
          className="mb-6"
        />

        {/* Exibição de erros */}
        {error && (
          <ErrorDisplay
            error={error}
            className="mb-6"
          />
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--primary)' }}></div>
            <span className="ml-2" style={{ color: 'var(--secondary)' }}>Carregando exercícios...</span>
          </div>
        )}

        {/* Lista de exercícios */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercises.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4" style={{ color: 'var(--secondary)' }}>💪</div>
                <h3 className="text-xl font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  {Object.keys(filters).some(key => filters[key as keyof typeof filters]) 
                    ? 'Nenhum exercício encontrado'
                    : 'Nenhum exercício cadastrado'
                  }
                </h3>
                <p className="mb-6" style={{ color: 'var(--secondary)' }}>
                  {Object.keys(filters).some(key => filters[key as keyof typeof filters])
                    ? 'Tente ajustar os filtros ou criar um novo exercício.'
                    : 'Comece criando seu primeiro exercício.'
                  }
                </p>
                <button
                  onClick={() => router.push('/exercises/new')}
                  className="px-6 py-3 rounded-lg font-medium transition-colors"
                  style={{ 
                    background: 'var(--primary)', 
                    color: 'var(--foreground)' 
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#e55a2b'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary)'}
                >
                  Criar Primeiro Exercício
                </button>
              </div>
            ) : (
              exercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onEdit={() => router.push(`/exercises/${exercise.id}/edit`)}
                  onDelete={() => handleDeleteExercise(exercise.id)}
                  onClick={() => router.push(`/exercises/${exercise.id}`)}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}