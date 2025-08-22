'use client'

import { useState } from 'react'
import { ExerciseStats } from '@/types/session'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ExerciseProgressTableProps {
  exerciseStats: ExerciseStats[]
}

export function ExerciseProgressTable({ exerciseStats }: ExerciseProgressTableProps) {
  const [sortBy, setSortBy] = useState<keyof ExerciseStats>('total_volume')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const handleSort = (field: keyof ExerciseStats) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const sortedStats = [...exerciseStats].sort((a, b) => {
    const aValue = a[sortBy]
    const bValue = b[sortBy]
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    }
    
    return 0
  })

  const getSortIcon = (field: keyof ExerciseStats) => {
    if (sortBy !== field) return '↕️'
    return sortOrder === 'asc' ? '⬆️' : '⬇️'
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 20) return 'text-[#FF6B35]'
    if (progress >= 10) return 'text-[#E5E5E5]'
    if (progress >= 0) return 'text-[#A3A3A3]'
    return 'text-[#FF3D00]'
  }

  return (
    <Card className="forge-card">
      <CardHeader>
        <CardTitle className="text-[#E5E5E5] flex items-center gap-2">
          💪 Progresso por Exercício
        </CardTitle>
      </CardHeader>
      <CardContent>
        {exerciseStats.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-[#A3A3A3] text-lg mb-2">📊</div>
            <p className="text-[#A3A3A3]">Nenhum exercício encontrado</p>
            <p className="text-[#A3A3A3] text-sm mt-1">
              Complete algumas sessões para ver o progresso
            </p>
          </div>
        ) : (
          <>
            {/* Layout Desktop - Tabela */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2C2C2C]">
                    <th 
                      className="text-left py-3 px-2 text-[#A3A3A3] cursor-pointer hover:text-[#FF6B35] transition-colors text-sm"
                      onClick={() => handleSort('exercise_name')}
                    >
                      Exercício {getSortIcon('exercise_name')}
                    </th>
                    <th 
                      className="text-right py-3 px-1 text-[#A3A3A3] cursor-pointer hover:text-[#FF6B35] transition-colors text-sm"
                      onClick={() => handleSort('total_volume')}
                    >
                      Volume {getSortIcon('total_volume')}
                    </th>
                    <th 
                      className="text-right py-3 px-1 text-[#A3A3A3] cursor-pointer hover:text-[#FF6B35] transition-colors text-sm"
                      onClick={() => handleSort('max_weight')}
                    >
                      Peso Máx {getSortIcon('max_weight')}
                    </th>
                    <th 
                      className="text-right py-3 px-1 text-[#A3A3A3] cursor-pointer hover:text-[#FF6B35] transition-colors text-sm"
                      onClick={() => handleSort('total_sets')}
                    >
                      Sets {getSortIcon('total_sets')}
                    </th>
                    <th 
                      className="text-right py-3 px-1 text-[#A3A3A3] cursor-pointer hover:text-[#FF6B35] transition-colors text-sm"
                      onClick={() => handleSort('progress_percentage')}
                    >
                      Progresso {getSortIcon('progress_percentage')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStats.map((stat, index) => (
                    <tr 
                      key={stat.exercise_id} 
                      className="border-b border-[#2C2C2C]/50 hover:bg-[#2C2C2C]/30 transition-colors"
                    >
                      <td className="py-3 px-2">
                        <div className="text-[#E5E5E5] font-medium text-sm">
                          {stat.exercise_name}
                        </div>
                        <div className="text-[#A3A3A3] text-xs">
                          {new Date(stat.last_session_date).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="text-right py-3 px-1 text-[#E5E5E5] font-medium text-sm">
                        {stat.total_volume.toLocaleString()} kg
                      </td>
                      <td className="text-right py-3 px-1 text-[#FF6B35] font-medium text-sm">
                        {stat.max_weight} kg
                      </td>
                      <td className="text-right py-3 px-1 text-[#E5E5E5] text-sm">
                        {stat.total_sets}
                      </td>
                      <td className={`text-right py-3 px-1 font-medium text-sm ${getProgressColor(stat.progress_percentage)}`}>
                        {stat.progress_percentage > 0 ? '+' : ''}{stat.progress_percentage.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Layout Mobile - Cards */}
            <div className="md:hidden space-y-3">
              {sortedStats.map((stat, index) => (
                <div 
                  key={stat.exercise_id}
                  className="bg-[#2C2C2C]/30 rounded-lg p-4 border border-[#2C2C2C]"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[#E5E5E5] font-medium text-sm truncate">
                        {stat.exercise_name}
                      </h3>
                      <p className="text-[#A3A3A3] text-xs mt-1">
                        {new Date(stat.last_session_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className={`text-right font-medium text-sm ${getProgressColor(stat.progress_percentage)}`}>
                      {stat.progress_percentage > 0 ? '+' : ''}{stat.progress_percentage.toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-[#A3A3A3] text-xs mb-1">Volume</p>
                      <p className="text-[#E5E5E5] font-medium text-sm">
                        {stat.total_volume.toLocaleString()} kg
                      </p>
                    </div>
                    <div>
                      <p className="text-[#A3A3A3] text-xs mb-1">Peso Máx</p>
                      <p className="text-[#FF6B35] font-medium text-sm">
                        {stat.max_weight} kg
                      </p>
                    </div>
                    <div>
                      <p className="text-[#A3A3A3] text-xs mb-1">Sets</p>
                      <p className="text-[#E5E5E5] font-medium text-sm">
                        {stat.total_sets}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}