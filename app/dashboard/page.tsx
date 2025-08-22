'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { SessionService } from '@/services/sessionService'
import { SessionStats, ExerciseStats } from '@/types/session'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { ErrorDisplay } from '@/components/ui/ErrorDisplay'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardStats, ProgressChart, WorkoutFrequencyChart, ExerciseProgressTable, RecentSessions } from '@/components/dashboard'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [stats, setStats] = useState<SessionStats | null>(null)
  const [exerciseStats, setExerciseStats] = useState<ExerciseStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const [sessionStats, exerciseStatsData] = await Promise.all([
        SessionService.getSessionStats(),
        SessionService.getExerciseStats()
      ])
      
      setStats(sessionStats)
      setExerciseStats(exerciseStatsData)
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err)
      setError('Erro ao carregar dados do dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-[#FF6B35] text-lg font-medium">
          Carregando dashboard...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-[#FF3D00] text-center">
              Erro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#A3A3A3] text-center">{error}</p>
            <button 
              onClick={loadDashboardData}
              className="w-full mt-4 bg-[#FF6B35] text-white py-2 px-4 rounded-lg hover:bg-[#FF6B35]/90 transition-colors"
            >
              Tentar Novamente
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#121212] p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          {/* Linha superior: botão voltar + título */}
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => router.push('/')}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition-colors flex items-center justify-center flex-shrink-0"
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
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#E5E5E5] truncate">
                Dashboard
              </h1>
              <p className="text-sm sm:text-base mt-1 text-[#A3A3A3] truncate">
                Acompanhe seu progresso e estatísticas de treino
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <DashboardStats stats={stats} />
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProgressChart stats={stats} />
          <WorkoutFrequencyChart stats={stats} />
        </div>

        {/* Exercise Progress and Recent Sessions */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <ExerciseProgressTable exerciseStats={exerciseStats} />
          </div>
          <div className="xl:col-span-1">
            <RecentSessions />
          </div>
        </div>
      </div>
    </div>
  )
}