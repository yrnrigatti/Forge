import { useState, useCallback, useMemo } from 'react'
import { ExerciseFilters } from '@/services/exerciseService'
import { MUSCLE_GROUPS, EXERCISE_TYPES } from '@/types/exercise'

interface UseExerciseFiltersReturn {
  filters: ExerciseFilters
  setFilters: (filters: ExerciseFilters) => void
  updateFilter: (key: keyof ExerciseFilters, value: string | undefined) => void
  clearFilters: () => void
  hasActiveFilters: boolean
  activeFilterCount: number
}

export function useExerciseFilters(initialFilters: ExerciseFilters = {}): UseExerciseFiltersReturn {
  const [filters, setFilters] = useState<ExerciseFilters>(initialFilters)

  const updateFilter = useCallback((key: keyof ExerciseFilters, value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  const hasActiveFilters = useMemo(() => {
    return Boolean(filters.muscleGroup || filters.type || filters.search)
  }, [filters])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.muscleGroup) count++
    if (filters.type) count++
    if (filters.search) count++
    return count
  }, [filters])

  return {
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    activeFilterCount
  }
}