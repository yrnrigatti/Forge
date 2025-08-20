import React, { useState } from 'react'
import { MUSCLE_GROUPS, EXERCISE_TYPES } from '@/types/exercise'
import { ExerciseFilters } from '@/services/exerciseService'

interface ExerciseFiltersProps {
  filters: ExerciseFilters
  onFiltersChange: (filters: ExerciseFilters) => void
  onClearFilters: () => void
  exerciseCount?: number
  className?: string
}

export function ExerciseFiltersComponent({
  filters,
  onFiltersChange,
  onClearFilters,
  exerciseCount,
  className = ''
}: ExerciseFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchInput, setSearchInput] = useState(filters.search || '')

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    onFiltersChange({ ...filters, search: value || undefined })
  }

  const handleMuscleGroupChange = (value: string) => {
    onFiltersChange({ ...filters, muscleGroup: value || undefined })
  }

  const handleTypeChange = (value: string) => {
    onFiltersChange({ ...filters, type: value || undefined })
  }

  const activeFilterCount = [filters.muscleGroup, filters.type, filters.search]
    .filter(Boolean).length

  const muscleGroupOptions = Object.entries(MUSCLE_GROUPS).map(([key, value]) => ({
    value: key,
    label: value
  }))

  const typeOptions = Object.entries(EXERCISE_TYPES).map(([key, value]) => ({
    value: key,
    label: value
  }))

  return (
    <div 
      className={`rounded-lg shadow-sm ${className}`}
      style={{
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)',
        color: 'var(--foreground)'
      }}
    >
      {/* Header com busca principal */}
      <div 
        className="p-4"
        style={{
          borderBottom: '1px solid var(--border)'
        }}
      >
        <div className="flex items-center space-x-4">
          {/* Campo de busca */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar exercícios por nome..."
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary)'
                  e.target.style.boxShadow = '0 0 0 2px rgba(255, 107, 53, 0.2)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border)'
                  e.target.style.boxShadow = 'none'
                }}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg 
                  className="h-5 w-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Botão de filtros avançados */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: activeFilterCount > 0 ? 'rgba(255, 107, 53, 0.1)' : 'var(--background)',
              border: activeFilterCount > 0 ? '1px solid var(--primary)' : '1px solid var(--border)',
              color: activeFilterCount > 0 ? 'var(--primary)' : 'var(--foreground)'
            }}
            onMouseEnter={(e) => {
              if (activeFilterCount === 0) {
                e.currentTarget.style.backgroundColor = 'var(--accent)'
              }
            }}
            onMouseLeave={(e) => {
              if (activeFilterCount === 0) {
                e.currentTarget.style.backgroundColor = 'var(--background)'
              }
            }}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v4.586l-4-2v-2.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filtros</span>
            {activeFilterCount > 0 && (
              <span 
                className="text-xs rounded-full px-2 py-1 min-w-[20px] text-center"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'white'
                }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Botão limpar filtros */}
          {activeFilterCount > 0 && (
            <button
              onClick={onClearFilters}
              className="text-sm transition-colors"
              style={{
                color: 'var(--muted-foreground)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--foreground)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--muted-foreground)'
              }}
            >
              Limpar
            </button>
          )}
        </div>

        {/* Contador de resultados */}
        {exerciseCount !== undefined && (
          <div 
            className="mt-2 text-sm"
            style={{
              color: 'var(--muted-foreground)'
            }}
          >
            {exerciseCount === 0 ? (
              'Nenhum exercício encontrado'
            ) : exerciseCount === 1 ? (
              '1 exercício encontrado'
            ) : (
              `${exerciseCount} exercícios encontrados`
            )}
          </div>
        )}
      </div>

      {/* Filtros avançados (expansível) */}
      {isExpanded && (
        <div 
          className="p-4"
          style={{
            backgroundColor: 'var(--accent)'
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtro por grupo muscular */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{
                  color: 'var(--foreground)'
                }}
              >
                Grupo Muscular
              </label>
              <select
                value={filters.muscleGroup || ''}
                onChange={(e) => handleMuscleGroupChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary)'
                  e.target.style.boxShadow = '0 0 0 2px rgba(255, 107, 53, 0.2)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border)'
                  e.target.style.boxShadow = 'none'
                }}
              >
                <option value="">Todos os grupos</option>
                {muscleGroupOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por tipo */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{
                  color: 'var(--foreground)'
                }}
              >
                Tipo de Exercício
              </label>
              <select
                value={filters.type || ''}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary)'
                  e.target.style.boxShadow = '0 0 0 2px rgba(255, 107, 53, 0.2)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border)'
                  e.target.style.boxShadow = 'none'
                }}
              >
                <option value="">Todos os tipos</option>
                {typeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}