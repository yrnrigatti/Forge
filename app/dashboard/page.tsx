'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { SessionService } from '@/services/sessionService'
import { SessionStats, ExerciseStats } from '@/types/session'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { ErrorDisplay } from '@/components/ui/ErrorDisplay'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
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
        <LoadingSpinner size="xl" text="Carregando dashboard..." />
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
    <div className="min-h-screen bg-[#121212]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate" style={{ color: 'var(--foreground)' }}>Dashboard</h1>
              <p className="text-sm sm:text-base mt-1 truncate" style={{ color: 'var(--muted-foreground)' }}>Visão geral dos seus treinos</p>
            </div>
          </div>
        </div>
    
        {/* Stats Cards */}
        {stats && (
          <div className="mb-6">
            <DashboardStats stats={stats} />
          </div>
        )}
    
        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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