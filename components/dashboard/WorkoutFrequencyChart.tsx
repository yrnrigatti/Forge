'use client'

import { useEffect, useState } from 'react'
import { SessionStats } from '@/types/session'
import { SessionService } from '@/services/sessionService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface WorkoutFrequencyChartProps {
  stats: SessionStats | null
}

interface HeatmapData {
  date: string
  sessions: number
  dayOfWeek: number
  weekOfYear: number
}

export function WorkoutFrequencyChart({ stats }: WorkoutFrequencyChartProps) {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'3months' | '6months' | 'year'>('3months')

  useEffect(() => {
    loadHeatmapData()
  }, [viewMode])

  const loadHeatmapData = async () => {
    try {
      setIsLoading(true)
      
      const daysBack = viewMode === '3months' ? 90 : viewMode === '6months' ? 180 : 365
      const sessions = await SessionService.getSessions({
        date_from: new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'completed'
      })

      // Agrupar sessões por data
      const sessionsByDate: Record<string, number> = {}
      sessions.forEach(session => {
        const date = session.date.split('T')[0]
        sessionsByDate[date] = (sessionsByDate[date] || 0) + 1
      })

      // Criar array com todos os dias do período
      const data: HeatmapData[] = []
      const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000)
      
      for (let i = 0; i < daysBack; i++) {
        const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
        const dateStr = date.toISOString().split('T')[0]
        
        data.push({
          date: dateStr,
          sessions: sessionsByDate[dateStr] || 0,
          dayOfWeek: date.getDay(),
          weekOfYear: getWeekIndex(date, startDate)
        })
      }

      setHeatmapData(data)
    } catch (error) {
      console.error('Erro ao carregar dados do heatmap:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Função corrigida para calcular o índice da semana relativo ao período
  const getWeekIndex = (date: Date, startDate: Date): number => {
    const diffTime = date.getTime() - startDate.getTime()
    const diffDays = Math.floor(diffTime / (24 * 60 * 60 * 1000))
    return Math.floor(diffDays / 7)
  }

  // Função original mantida para compatibilidade (não usada mais)
  const getWeekOfYear = (date: Date): number => {
    const start = new Date(date.getFullYear(), 0, 1)
    const diff = date.getTime() - start.getTime()
    return Math.floor(diff / (7 * 24 * 60 * 60 * 1000))
  }

  const getIntensityColor = (sessions: number): string => {
    if (sessions === 0) return 'bg-[#1F1F1F]' 
    if (sessions === 1) return 'bg-[#4A2C17]' 
    if (sessions === 2) return 'bg-[#8B4513]' 
    if (sessions === 3) return 'bg-[#FF6B35]' 
    return 'bg-[#FF8C42]'
  }

  const getTooltipText = (data: HeatmapData): string => {
    const date = new Date(data.date)
    const dateStr = date.toLocaleDateString('pt-BR')
    const sessionsText = data.sessions === 0 ? 'Nenhuma sessão' : 
                        data.sessions === 1 ? '1 sessão' : 
                        `${data.sessions} sessões`
    return `${sessionsText} em ${dateStr}`
  }

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

  // Agrupar dados por semana (usando o novo índice)
  const weeklyData: Record<number, HeatmapData[]> = {}
  heatmapData.forEach(day => {
    if (!weeklyData[day.weekOfYear]) {
      weeklyData[day.weekOfYear] = []
    }
    weeklyData[day.weekOfYear].push(day)
  })

  const weeks = Object.keys(weeklyData).map(Number).sort((a, b) => a - b)

  return (
    <Card className="forge-card">
      <CardHeader className="pb-4">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <CardTitle className="text-[#E5E5E5] flex items-center gap-2 text-lg sm:text-xl">
            📅 Frequência de Treinos
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setViewMode('3months')}
              className={`px-3 py-1.5 rounded text-xs sm:text-sm transition-colors whitespace-nowrap ${
                viewMode === '3months'
                  ? 'bg-[#FF6B35] text-white'
                  : 'bg-[#2C2C2C] text-[#A3A3A3] hover:bg-[#FF6B35]/20'
              }`}
            >
              3 Meses
            </button>
            <button
              onClick={() => setViewMode('6months')}
              className={`px-3 py-1.5 rounded text-xs sm:text-sm transition-colors whitespace-nowrap ${
                viewMode === '6months'
                  ? 'bg-[#FF6B35] text-white'
                  : 'bg-[#2C2C2C] text-[#A3A3A3] hover:bg-[#FF6B35]/20'
              }`}
            >
              6 Meses
            </button>
            <button
              onClick={() => setViewMode('year')}
              className={`px-3 py-1.5 rounded text-xs sm:text-sm transition-colors whitespace-nowrap ${
                viewMode === 'year'
                  ? 'bg-[#FF6B35] text-white'
                  : 'bg-[#2C2C2C] text-[#A3A3A3] hover:bg-[#FF6B35]/20'
              }`}
            >
              1 Ano
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-[#A3A3A3]">Carregando frequência...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Legenda dos dias da semana */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#A3A3A3]">
              <div className="w-3"></div>
              {weekDays.map((day, index) => (
                <div key={day} className="w-3 text-center">
                  {index % 2 === 1 ? day.charAt(0) : ''}
                </div>
              ))}
            </div>

            {/* Heatmap Grid */}
            <div className="overflow-x-auto">
              <div className="flex gap-1 min-w-fit">
                {/* Labels dos dias da semana */}
                <div className="flex flex-col gap-1 mr-2">
                  {weekDays.map((day, index) => (
                    <div key={day} className="h-3 flex items-center text-xs text-[#A3A3A3] w-6 sm:w-8">
                      <span className="hidden sm:inline">
                        {index % 2 === 1 ? day.charAt(0) : ''}
                      </span>
                      <span className="sm:hidden">
                        {index % 2 === 1 ? day.substring(0, 1) : ''}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Grid de quadradinhos */}
                {weeks.map(weekNum => {
                  const weekData = weeklyData[weekNum] || []
                  
                  // Preencher semana com 7 dias (alguns podem estar vazios)
                  const fullWeek = new Array(7).fill(null).map((_, dayIndex) => {
                    return weekData.find(d => d.dayOfWeek === dayIndex) || null
                  })

                  return (
                    <div key={weekNum} className="flex flex-col gap-1">
                      {fullWeek.map((dayData, dayIndex) => (
                        <div
                          key={`${weekNum}-${dayIndex}`}
                          className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm border border-[#2C2C2C] cursor-pointer transition-all hover:border-[#FF6B35] hover:scale-110 ${
                            dayData ? getIntensityColor(dayData.sessions) : 'bg-[#1F1F1F]'
                          }`}
                          title={dayData ? getTooltipText(dayData) : ''}
                        />
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Legenda de intensidade */}
            <div className="flex items-center justify-between text-xs text-[#A3A3A3]">
              <span className="text-xs sm:text-sm">Menos</span>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-[#1F1F1F] border border-[#2C2C2C]"></div>
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-[#4A2C17] border border-[#2C2C2C]"></div>
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-[#8B4513] border border-[#2C2C2C]"></div>
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-[#FF6B35] border border-[#2C2C2C]"></div>
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-[#FF8C42] border border-[#2C2C2C]"></div>
              </div>
              <span className="text-xs sm:text-sm">Mais</span>
            </div>

            {/* Estatísticas resumidas */}
            <div className="grid grid-cols-3 gap-4 text-center text-xs sm:text-sm text-[#A3A3A3] pt-4 border-t border-[#2C2C2C]">
              <div>
                <div className="text-[#E5E5E5] font-semibold text-sm sm:text-base">
                  {heatmapData.filter(d => d.sessions > 0).length}
                </div>
                <div className="text-xs">Dias ativos</div>
              </div>
              <div>
                <div className="text-[#E5E5E5] font-semibold text-sm sm:text-base">
                  {heatmapData.reduce((sum, d) => sum + d.sessions, 0)}
                </div>
                <div className="text-xs">Total de sessões</div>
              </div>
              <div>
                <div className="text-[#E5E5E5] font-semibold text-sm sm:text-base">
                  {Math.max(...heatmapData.map(d => d.sessions), 0)}
                </div>
                <div className="text-xs">Máximo por dia</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}