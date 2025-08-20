import { useState, useCallback, useMemo } from 'react'
import { WorkoutFilters, WorkoutSortOption } from '@/types/workout'

interface UseWorkoutFiltersReturn {
  filters: WorkoutFilters
  sortBy: WorkoutSortOption
  setFilters: (filters: WorkoutFilters) => void
  setSortBy: (sortBy: WorkoutSortOption) => void
  updateFilter: (key: keyof WorkoutFilters, value: string | undefined) => void
  clearFilters: () => void
  hasActiveFilters: boolean
  activeFilterCount: number
}

export function useWorkoutFilters(
  initialFilters: WorkoutFilters = {},
  initialSortBy: WorkoutSortOption = 'created_at_desc'
): UseWorkoutFiltersReturn {
  const [filters, setFilters] = useState<WorkoutFilters>(initialFilters)
  const [sortBy, setSortBy] = useState<WorkoutSortOption>(initialSortBy)

  const updateFilter = useCallback((key: keyof WorkoutFilters, value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  const hasActiveFilters = useMemo(() => {
    return Boolean(filters.search || filters.dateFrom || filters.dateTo)
  }, [filters])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.search) count++
    if (filters.dateFrom) count++
    if (filters.dateTo) count++
    return count
  }, [filters])

  return {
    filters,
    sortBy,
    setFilters,
    setSortBy,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    activeFilterCount
  }
}