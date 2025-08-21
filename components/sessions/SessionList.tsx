import { SessionWithDetails } from '@/types/session'
import { SessionCard } from './SessionCard'
import { ErrorDisplay } from '@/components/ui/ErrorDisplay'

interface SessionListProps {
  sessions: SessionWithDetails[]
  loading?: boolean
  error?: string | null
  onSessionClick?: (session: SessionWithDetails) => void
  onSessionEdit?: (session: SessionWithDetails) => void
  onSessionDelete?: (session: SessionWithDetails) => void
  onSessionContinue?: (session: SessionWithDetails) => void
  showActions?: boolean
  emptyMessage?: string
  className?: string
}

export function SessionList({
  sessions,
  loading = false,
  error = null,
  onSessionClick,
  onSessionEdit,
  onSessionDelete,
  onSessionContinue,
  showActions = false,
  emptyMessage = 'Nenhuma sessão encontrada',
  className = ''
}: SessionListProps) {
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="h-32 bg-[#1F1F1F] border border-[#2C2C2C] rounded-lg animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className={className}>
        <ErrorDisplay message={error} />
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-[#A3A3A3] text-lg mb-2">{emptyMessage}</div>
        <div className="text-[#666] text-sm">
          Suas sessões de treino aparecerão aqui
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          onClick={onSessionClick}
          onEdit={onSessionEdit}
          onDelete={onSessionDelete}
          onContinue={onSessionContinue}
          showActions={showActions}
        />
      ))}
    </div>
  )
}