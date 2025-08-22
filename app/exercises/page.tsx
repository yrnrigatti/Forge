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
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

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
        <LoadingSpinner size="xl" text="Carregando..." />
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
        <div className="mb-6">
          {/* Linha superior: título */}
          <div className="flex items-center gap-3 mb-4 sm:mb-0">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate" style={{ color: 'var(--foreground)' }}>Meus Exercícios</h1>
              <p className="text-sm sm:text-base mt-1 truncate" style={{ color: 'var(--muted-foreground)' }}>Gerencie sua biblioteca de exercícios</p>
            </div>
          </div>
          
          {/* Linha inferior: botão novo exercício (centralizado no mobile) */}
          <div className="flex justify-center sm:justify-end">
            <button
              onClick={() => router.push('/exercises/new')}
              className="px-4 py-2 sm:px-6 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-base w-full sm:w-auto max-w-xs sm:max-w-none"
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
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" text="Carregando exercícios..." />
          </div>
        )}

        {/* Lista de exercícios */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercises.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4" style={{ color: 'var(--secondary)' }}>🏃‍♂️</div>
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