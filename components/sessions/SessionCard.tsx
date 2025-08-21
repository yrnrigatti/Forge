import { SessionWithDetails } from '@/types/session'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface SessionCardProps {
  session: SessionWithDetails
  onEdit?: (session: SessionWithDetails) => void
  onDelete?: (session: SessionWithDetails) => void
  onClick?: (session: SessionWithDetails) => void
  onContinue?: (session: SessionWithDetails) => void
  showActions?: boolean
  className?: string
}

export function SessionCard({ 
  session, 
  onEdit, 
  onDelete, 
  onClick, 
  onContinue,
  showActions = false,
  className = '' 
}: SessionCardProps) {
  const handleCardClick = () => {
    if (onClick) {
      onClick(session)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEdit) {
      onEdit(session)
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(session)
    }
  }

  const handleContinue = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onContinue) {
      onContinue(session)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'var(--primary)'
      case 'completed': return '#10B981' // green-500
      case 'cancelled': return 'var(--destructive)'
      default: return 'var(--secondary)'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Em andamento'
      case 'completed': return 'Concluída'
      case 'cancelled': return 'Cancelada'
      default: return status
    }
  }

  const totalSets = session.sets?.length || 0
  const totalVolume = session.sets?.reduce((sum, set) => sum + (set.weight * set.reps), 0) || 0
  const duration = session.ended_at && session.started_at
    ? Math.round((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / (1000 * 60))
    : null

  return (
    <div 
      className={`forge-card p-6 transition-all duration-200 hover:shadow-lg ${
        onClick ? 'cursor-pointer hover:shadow-xl' : ''
      } ${className}`}
      onClick={handleCardClick}
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '8px'
      }}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 
              className="text-xl font-semibold mb-1"
              style={{ color: 'var(--foreground)' }}
            >
              {session.workout?.name || 'Treino sem nome'}
            </h3>
            <div 
              className="text-xs"
              style={{ color: 'var(--secondary)' }}
            >
              {formatDistanceToNow(new Date(session.started_at || session.date), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </div>
          </div>
          
          {showActions && (
            <div className="flex space-x-2 ml-4">
              {session.status === 'active' && onContinue && (
                <button
                  onClick={handleContinue}
                  className="px-3 py-1 text-xs rounded transition-colors"
                  style={{
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  Continuar
                </button>
              )}
              {onEdit && (
                <button
                  onClick={handleEdit}
                  className="p-2 rounded transition-colors"
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--primary)',
                    color: 'var(--primary)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--primary)';
                    e.currentTarget.style.color = 'var(--foreground)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--card)';
                    e.currentTarget.style.color = 'var(--primary)';
                  }}
                >
                  ✏️
                </button>
              )}
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="p-2 rounded transition-colors"
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--destructive)',
                    color: 'var(--destructive)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--destructive)';
                    e.currentTarget.style.color = 'var(--foreground)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--card)';
                    e.currentTarget.style.color = 'var(--destructive)';
                  }}
                >
                  🗑️
                </button>
              )}
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex flex-wrap gap-2">
          <span 
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{
              background: getStatusColor(session.status),
              color: 'white'
            }}
          >
            {getStatusText(session.status)}
          </span>
        </div>

        {/* Stats */}
        <div 
          className="grid grid-cols-3 gap-4 pt-3 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="text-center">
            <div 
              className="text-lg font-bold"
              style={{ color: 'var(--foreground)' }}
            >
              {totalSets}
            </div>
            <div 
              className="text-xs"
              style={{ color: 'var(--secondary)' }}
            >
              Séries
            </div>
          </div>
          <div className="text-center">
            <div 
              className="text-lg font-bold"
              style={{ color: 'var(--foreground)' }}
            >
              {totalVolume.toFixed(0)}kg
            </div>
            <div 
              className="text-xs"
              style={{ color: 'var(--secondary)' }}
            >
              Volume
            </div>
          </div>
          <div className="text-center">
            <div 
              className="text-lg font-bold"
              style={{ color: 'var(--foreground)' }}
            >
              {duration ? `${duration}min` : '-'}
            </div>
            <div 
              className="text-xs"
              style={{ color: 'var(--secondary)' }}
            >
              Duração
            </div>
          </div>
        </div>

        {/* Exercise count */}
        {session.workout?.exercises && session.workout.exercises.length > 0 && (
          <div 
            className="text-sm"
            style={{ color: 'var(--secondary)' }}
          >
            {session.workout.exercises.length} exercício{session.workout.exercises.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  )
}