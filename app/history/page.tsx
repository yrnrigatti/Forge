'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { sessionService } from '@/services/sessionService'
import { SessionWithDetails } from '@/types/session'
import { useAuth } from '@/hooks/useAuth'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ErrorDisplay } from '@/components/ui/ErrorDisplay'

interface SessionStats {
  totalSessions: number
  completedSessions: number
  totalWorkouts: number
  totalSets: number
  totalWeight: number
  totalDuration: number
  averageSessionDuration: number
  mostUsedExercises: Array<{
    exercise_name: string
    count: number
  }>
  weeklyProgress: Array<{
    week: string
    sessions: number
    weight: number
  }>
}

export default function HistoryPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { error, handleError, clearErrors } = useErrorHandler()
  
  const [sessions, setSessions] = useState<SessionWithDetails[]>([])
  const [stats, setStats] = useState<SessionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias atrás
    endDate: new Date().toISOString().split('T')[0]
  })

  // Proteção de rota
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirectTo=/history')
      return
    }
  }, [user, authLoading, router])

  // Carregar dados
  const loadData = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      clearErrors()
      
      // Carregar sessões do período
      const sessionsData = await sessionService.getSessions(
        {
          status: 'completed',
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        },
        'created_at_desc'
      )
      setSessions(sessionsData)
      
      // Calcular estatísticas
      const statsData = await calculateStats(sessionsData)
      setStats(statsData)
      
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  // Calcular estatísticas
  const calculateStats = async (sessionsData: SessionWithDetails[]): Promise<SessionStats> => {
    const totalSessions = sessionsData.length
    const completedSessions = sessionsData.filter(s => s.status === 'completed').length
    
    let totalSets = 0
    let totalWeight = 0
    let totalDuration = 0
    const exerciseCount: Record<string, number> = {}
    const workoutIds = new Set<string>()
    
    sessionsData.forEach(session => {
      if (session.workout_id) workoutIds.add(session.workout_id)
      
      if (session.started_at && session.completed_at) {
        const duration = new Date(session.completed_at).getTime() - new Date(session.started_at).getTime()
        totalDuration += duration
      }
      
      session.sets?.forEach(set => {
        totalSets++
        if (set.weight) totalWeight += set.weight * (set.reps || 1)
        
        if (set.exercise?.name) {
          exerciseCount[set.exercise.name] = (exerciseCount[set.exercise.name] || 0) + 1
        }
      })
    })
    
    const mostUsedExercises = Object.entries(exerciseCount)
      .map(([exercise_name, count]) => ({ exercise_name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
    
    // Progresso semanal (últimas 4 semanas)
    const weeklyProgress = []
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - (i * 7))
      weekStart.setHours(0, 0, 0, 0)
      
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)
      
      const weekSessions = sessionsData.filter(session => {
        const sessionDate = new Date(session.created_at)
        return sessionDate >= weekStart && sessionDate <= weekEnd
      })
      
      const weekWeight = weekSessions.reduce((sum, session) => {
        return sum + (session.sets?.reduce((setSum, set) => {
          return setSum + (set.weight ? set.weight * (set.reps || 1) : 0)
        }, 0) || 0)
      }, 0)
      
      weeklyProgress.push({
        week: `${weekStart.getDate()}/${weekStart.getMonth() + 1}`,
        sessions: weekSessions.length,
        weight: weekWeight
      })
    }
    
    return {
      totalSessions,
      completedSessions,
      totalWorkouts: workoutIds.size,
      totalSets,
      totalWeight,
      totalDuration,
      averageSessionDuration: totalSessions > 0 ? totalDuration / totalSessions : 0,
      mostUsedExercises,
      weeklyProgress
    }
  }

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, dateRange])

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}min`
    }
    return `${remainingMinutes}min`
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p style={{ color: 'var(--muted-foreground)' }}>Carregando histórico...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          {/* Linha superior: botão voltar + título */}
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => router.back()}
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
              title="Voltar"
            >
              ←
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate" style={{ color: 'var(--foreground)' }}>Histórico de Treinos</h1>
              <p className="text-sm sm:text-base mt-1 truncate" style={{ color: 'var(--muted-foreground)' }}>Acompanhe seu progresso e estatísticas</p>
            </div>
          </div>
        </div>
        
        {/* REMOVER ESTE BLOCO INTEIRO - Header duplicado */}
        {/* 
        <div className="mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate" style={{ color: 'var(--foreground)' }}>
                Histórico de Treinos
              </h1>
              <p className="text-sm sm:text-base lg:text-lg truncate" style={{ color: 'var(--muted-foreground)' }}>
                Acompanhe seu progresso e estatísticas
              </p>
            </div>
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="w-full sm:w-auto max-w-xs sm:max-w-none"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--foreground)'
              }}
            >
              Voltar
            </Button>
          </div>
        </div>
        */}

        {/* Filtros de Data */}
        <Card className="p-4 sm:p-6 mb-6" style={{ 
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)'
        }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
            Período de Análise
          </h3>
          <div className="flex flex-col gap-4">
            {/* Inputs de Data */}
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
              <div className="flex-1 min-w-0">
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
                  Data Inicial
                </label>
                <Input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
                  Data Final
                </label>
                <Input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full"
                />
              </div>
            </div>
            
            {/* Botões */}
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 sm:justify-end">
              <Button
                onClick={() => setDateRange({
                  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  endDate: new Date().toISOString().split('T')[0]
                })}
                variant="outline"
                className="w-full sm:w-auto whitespace-nowrap"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)'
                }}
              >
                Últimos 30 dias
              </Button>
              <Button
                onClick={loadData}
                className="w-full sm:w-auto"
                style={{ 
                  background: 'var(--primary)', 
                  color: 'var(--foreground)' 
                }}
              >
                Aplicar Filtro
              </Button>
            </div>
          </div>
        </Card>

        {/* Exibição de erros */}
        {error && (
          <ErrorDisplay error={error} className="mb-6" />
        )}

        {/* Estatísticas Gerais */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold mb-2" style={{ color: 'var(--primary)' }}>
                {stats.completedSessions}
              </div>
              <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Sessões Concluídas
              </div>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold mb-2" style={{ color: 'var(--primary)' }}>
                {stats.totalWorkouts}
              </div>
              <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Treinos Diferentes
              </div>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold mb-2" style={{ color: 'var(--primary)' }}>
                {stats.totalSets}
              </div>
              <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Total de Sets
              </div>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold mb-2" style={{ color: 'var(--primary)' }}>
                {Math.round(stats.totalWeight)}kg
              </div>
              <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Volume Total
              </div>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Exercícios Mais Usados */}
          {stats && stats.mostUsedExercises.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                Exercícios Mais Praticados
              </h3>
              <div className="space-y-3">
                {stats.mostUsedExercises.map((exercise, index) => (
                  <div key={exercise.exercise_name} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ background: 'var(--primary)', color: 'var(--foreground)' }}
                      >
                        {index + 1}
                      </div>
                      <span style={{ color: 'var(--foreground)' }}>{exercise.exercise_name}</span>
                    </div>
                    <span 
                      className="text-sm font-medium"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      {exercise.count} sets
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Progresso Semanal */}
          {stats && stats.weeklyProgress.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                Progresso Semanal
              </h3>
              <div className="space-y-3">
                {stats.weeklyProgress.map((week, index) => (
                  <div key={week.week} className="flex justify-between items-center">
                    <span style={{ color: 'var(--foreground)' }}>Semana {week.week}</span>
                    <div className="text-right">
                      <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                        {week.sessions} sessões
                      </div>
                      <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        {Math.round(week.weight)}kg volume
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Lista de Sessões */}
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
            Sessões Recentes ({sessions.length})
          </h3>
          
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <p style={{ color: 'var(--muted-foreground)' }}>
                Nenhuma sessão encontrada no período selecionado
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.slice(0, 10).map((session) => (
                <div 
                  key={session.id}
                  className="flex justify-between items-center p-3 rounded-lg cursor-pointer hover:opacity-80"
                  style={{ background: 'var(--muted)' }}
                  onClick={() => router.push(`/sessions/${session.id}`)}
                >
                  <div>
                    <div className="font-medium" style={{ color: 'var(--foreground)' }}>
                      {session.workout?.name || 'Treino'}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      {new Date(session.created_at).toLocaleDateString('pt-BR')} • 
                      {session.sets?.length || 0} sets
                      {session.started_at && session.completed_at && (
                        <> • {formatDuration(
                          new Date(session.completed_at).getTime() - new Date(session.started_at).getTime()
                        )}</>
                      )}
                      {session.started_at && session.ended_at && (
                        <span className="text-xs text-gray-400 ml-2">
                          {Math.round(
                            (new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / (1000 * 60)
                          )}min
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div 
                      className="text-sm px-2 py-1 rounded"
                      style={{
                        background: session.status === 'completed' ? 'var(--primary)' : 'var(--muted)',
                        color: 'var(--foreground)'
                      }}
                    >
                      {session.status === 'completed' ? 'Concluído' : 
                       session.status === 'active' ? 'Ativo' : 'Pausado'}
                    </div>
                  </div>
                </div>
              ))}
              
              {sessions.length > 10 && (
                <div className="text-center pt-4">
                  <Button
                    onClick={() => router.push('/sessions')}
                    variant="outline"
                  >
                    Ver Todas as Sessões
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}