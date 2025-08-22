'use client'

import { SessionStats } from '@/types/session'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DashboardStatsProps {
  stats: SessionStats
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      title: 'Total de Sessões',
      value: stats.total_sessions.toString(),
      icon: '🏋️',
      color: 'text-[#FF6B35]'
    },
    {
      title: 'Volume Total',
      value: `${stats.total_volume.toLocaleString()} kg`,
      icon: '💪',
      color: 'text-[#FF6B35]'
    },
    {
      title: 'Streak Atual',
      value: `${stats.current_streak} dias`,
      icon: '🔥',
      color: 'text-[#FF6B35]'
    },
    {
      title: 'Melhor Streak',
      value: `${stats.best_streak} dias`,
      icon: '🏆',
      color: 'text-[#FF6B35]'
    },
    {
      title: 'Esta Semana',
      value: stats.sessions_this_week.toString(),
      icon: '📅',
      color: 'text-[#FF6B35]'
    },
    {
      title: 'Este Mês',
      value: stats.sessions_this_month.toString(),
      icon: '📊',
      color: 'text-[#FF6B35]'
    },
    {
      title: 'Duração Média',
      value: `${Math.round(stats.average_duration)} min`,
      icon: '⏱️',
      color: 'text-[#FF6B35]'
    },
    {
      title: 'Treino Favorito',
      value: stats.favorite_workout || 'N/A',
      icon: '❤️',
      color: 'text-[#FF6B35]'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="forge-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#A3A3A3] text-sm font-medium">
                  {stat.title}
                </p>
                <p className={`text-2xl font-bold ${stat.color} mt-1`}>
                  {stat.value}
                </p>
              </div>
              <div className="text-2xl">
                {stat.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}