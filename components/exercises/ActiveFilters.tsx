import React from 'react'
import { ExerciseFilters } from '@/services/exerciseService'
import { MUSCLE_GROUPS, EXERCISE_TYPES } from '@/types/exercise'

interface ActiveFiltersProps {
  filters: ExerciseFilters
  onRemoveFilter: (key: keyof ExerciseFilters) => void
  onClearAll: () => void
  className?: string
}

export function ActiveFilters({
  filters,
  onRemoveFilter,
  onClearAll,
  className = ''
}: ActiveFiltersProps) {
  const activeFilters = []

  if (filters.search) {
    activeFilters.push({
      key: 'search' as keyof ExerciseFilters,
      label: `Busca: "${filters.search}"`,
      value: filters.search
    })
  }

  if (filters.muscleGroup) {
    activeFilters.push({
      key: 'muscleGroup' as keyof ExerciseFilters,
      label: `Grupo: ${MUSCLE_GROUPS[filters.muscleGroup as keyof typeof MUSCLE_GROUPS]}`,
      value: filters.muscleGroup
    })
  }

  if (filters.type) {
    activeFilters.push({
      key: 'type' as keyof ExerciseFilters,
      label: `Tipo: ${EXERCISE_TYPES[filters.type as keyof typeof EXERCISE_TYPES]}`,
      value: filters.type
    })
  }

  if (activeFilters.length === 0) {
    return null
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-sm text-gray-600 font-medium">Filtros ativos:</span>
      
      {activeFilters.map((filter) => (
        <span
          key={filter.key}
          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
        >
          {filter.label}
          <button
            onClick={() => onRemoveFilter(filter.key)}
            className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
            aria-label={`Remover filtro ${filter.label}`}
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      ))}
      
      {activeFilters.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Limpar todos
        </button>
      )}
    </div>
  )
}