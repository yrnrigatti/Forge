'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { SessionStats } from '@/types/session'
import { SessionService } from '@/services/sessionService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// Adicionar import
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface ProgressChartProps {
  stats: SessionStats | null
}

interface ChartData {
  date: string
  volume: number
  sessions: number
}

export function ProgressChart({ stats }: ProgressChartProps) {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadChartData()
  }, [])

  const loadChartData = async () => {
    try {
      // Simular dados de progresso dos últimos 30 dias
      // Em uma implementação real, você criaria um endpoint específico
      const sessions = await SessionService.getSessions({
        date_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })

      // Agrupar por data
      const groupedData = sessions.reduce((acc, session) => {
        const date = new Date(session.date).toISOString().split('T')[0]
        if (!acc[date]) {
          acc[date] = { volume: 0, sessions: 0 }
        }
        acc[date].volume += session.total_volume || 0
        acc[date].sessions += 1
        return acc
      }, {} as Record<string, { volume: number; sessions: number }>)

      // Converter para array, ordenar e depois formatar
      const data = Object.entries(groupedData)
        .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
        .map(([date, data]) => ({
          date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' }),
          volume: data.volume,
          sessions: data.sessions
        }))

      setChartData(data)
    } catch (error) {
      console.error('Erro ao carregar dados do gráfico:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="forge-card">
      <CardHeader>
        <CardTitle className="text-[#E5E5E5] flex items-center gap-2 text-sm sm:text-base">
          <span className="hidden sm:inline">📈 Progresso dos Últimos 30 Dias</span>
          <span className="sm:hidden">📈 Progresso (30d)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" text="Carregando gráfico..." />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2C" />
              <XAxis 
                dataKey="date" 
                stroke="#A3A3A3"
                fontSize={12}
              />
              <YAxis 
                stroke="#A3A3A3"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F1F1F',
                  border: '1px solid #2C2C2C',
                  borderRadius: '8px',
                  color: '#E5E5E5'
                }}
                labelStyle={{ color: '#FF6B35' }}
              />
              <Line 
                type="monotone" 
                dataKey="volume" 
                stroke="#FF6B35" 
                strokeWidth={3}
                dot={{ fill: '#FF6B35', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#FF6B35', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}