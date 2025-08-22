'use client'

import { useEffect, useState } from 'react'
import { SessionWithDetails } from '@/types/session'
import { SessionService } from '@/services/sessionService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export function RecentSessions() {
  const [recentSessions, setRecentSessions] = useState<SessionWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadRecentSessions()
  }, [])

  const loadRecentSessions = async () => {
    try {
      const sessions = await SessionService.getSessions({}, 'date_desc')
      setRecentSessions(sessions.slice(0, 5)) // Últimas 5 sessões
    } catch (error) {
      console.error('Erro ao carregar sessões recentes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-[#FF6B35]'
      case 'active': return 'text-[#FF3D00]'
      case 'paused': return 'text-[#A3A3A3]'
      case 'cancelled': return 'text-[#FF3D00]'
      default: return 'text-[#A3A3A3]'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅'
      case 'active': return '🔥'
      case 'paused': return '⏸️'
      case 'cancelled': return '❌'
      default: return '📋'
    }
  }

  const formatDuration = (duration?: number) => {
    if (!duration) return 'N/A'
    const hours = Math.floor(duration / 60)
    const minutes = duration % 60
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  return (
    <Card className="forge-card">
      <CardHeader>
        <CardTitle className="text-[#E5E5E5] flex items-center gap-2">
          🕒 Sessões Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-[#2C2C2C] rounded mb-2"></div>
                <div className="h-3 bg-[#2C2C2C] rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : recentSessions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-[#A3A3A3] text-lg mb-2">📋</div>
            <p className="text-[#A3A3A3]">Nenhuma sessão encontrada</p>
            <p className="text-[#A3A3A3] text-sm mt-1">
              Inicie um treino para ver suas sessões aqui
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <Link 
                key={session.id} 
                href={`/sessions/${session.id}`}
                className="block p-3 rounded-lg bg-[#2C2C2C]/30 hover:bg-[#2C2C2C]/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getStatusIcon(session.status)}</span>
                    <span className="text-[#E5E5E5] font-medium">
                      {session.workout.name}
                    </span>
                  </div>
                  <span className={`text-sm ${getStatusColor(session.status)}`}>
                    {session.status === 'completed' ? 'Concluído' : 
                     session.status === 'active' ? 'Ativo' :
                     session.status === 'paused' ? 'Pausado' : 'Cancelado'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-[#A3A3A3]">
                  <span>
                    {new Date(session.date).toLocaleDateString('pt-BR')}
                  </span>
                  <div className="flex items-center gap-3">
                    <span>{session.total_sets} sets</span>
                    <span>{formatDuration(session.duration)}</span>
                    <span>{session.total_volume.toLocaleString()} kg</span>
                  </div>
                </div>
              </Link>
            ))}
            
            <Link 
              href="/sessions"
              className="block text-center py-2 text-[#FF6B35] hover:text-[#FF6B35]/80 transition-colors text-sm"
            >
              Ver todas as sessões →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}