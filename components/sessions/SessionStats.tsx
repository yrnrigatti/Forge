import React from 'react'
import { Card } from '@/components/ui/card'
import { SessionWithDetails } from '@/types/session'

interface SessionStatsProps {
  sessions: SessionWithDetails[]
  className?: string
}

export function SessionStats({ sessions, className = '' }: SessionStatsProps) {
  const completedSessions = sessions.filter(s => s.status === 'completed')
  
  const totalSets = sessions.reduce((sum, session) => {
    return sum + (session.sets?.length || 0)
  }, 0)
  
  const totalVolume = sessions.reduce((sum, session) => {
    return sum + (session.sets?.reduce((setSum, set) => {
      return setSum + (set.weight ? set.weight * (set.reps || 1) : 0)
    }, 0) || 0)
  }, 0)
  
  const totalDuration = completedSessions.reduce((sum, session) => {
    if (session.started_at && session.ended_at) {
      return sum + (new Date(session.ended_at).getTime() - new Date(session.started_at).getTime())
    }
    return sum
  }, 0)
  
  const averageDuration = completedSessions.length > 0 ? totalDuration / completedSessions.length : 0
  
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}min`
    }
    return `${remainingMinutes}min`
  }
  
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      <Card className="p-4 text-center">
        <div className="text-2xl font-bold mb-1" style={{ color: 'var(--primary)' }}>
          {completedSessions.length}
        </div>
        <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          Sessões
        </div>
      </Card>
      
      <Card className="p-4 text-center">
        <div className="text-2xl font-bold mb-1" style={{ color: 'var(--primary)' }}>
          {totalSets}
        </div>
        <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          Sets
        </div>
      </Card>
      
      <Card className="p-4 text-center">
        <div className="text-2xl font-bold mb-1" style={{ color: 'var(--primary)' }}>
          {Math.round(totalVolume)}kg
        </div>
        <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          Volume
        </div>
      </Card>
      
      <Card className="p-4 text-center">
        <div className="text-2xl font-bold mb-1" style={{ color: 'var(--primary)' }}>
          {formatDuration(averageDuration)}
        </div>
        <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          Duração Média
        </div>
      </Card>
    </div>
  )
}