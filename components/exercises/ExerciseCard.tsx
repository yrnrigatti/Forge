import { Exercise } from '@/types/exercise';

interface ExerciseCardProps {
  exercise: Exercise;
  onEdit?: (exercise: Exercise) => void;
  onDelete?: (exercise: Exercise) => void;
  onClick?: (exercise: Exercise) => void;
  showActions?: boolean;
  className?: string;
}

export function ExerciseCard({ 
  exercise, 
  onEdit, 
  onDelete, 
  onClick, 
  showActions = false,
  className = '' 
}: ExerciseCardProps) {
  const handleCardClick = () => {
    if (onClick) {
      onClick(exercise);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(exercise);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(exercise);
    }
  };

  return (
    <div 
      className={`forge-card p-6 transition-all duration-200 hover:shadow-lg ${onClick ? 'cursor-pointer hover:shadow-xl' : ''} ${className}`}
      onClick={handleCardClick}
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '8px'
      }}
    >
      <div className="space-y-3">
        {/* Header com nome e ações */}
        <div className="flex justify-between items-start">
          <h3 
            className="text-xl font-semibold flex-1"
            style={{ color: 'var(--foreground)' }}
          >
            {exercise.name}
          </h3>
          {showActions && (
            <div className="flex space-x-2 ml-4">
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
            </div>
          )}
        </div>
        
        {/* Tags de grupo muscular e tipo */}
        <div className="flex flex-wrap gap-2">
          {exercise.muscle_group && (
            <span 
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              style={{
                background: 'var(--primary)',
                color: 'var(--foreground)'
              }}
            >
              {exercise.muscle_group}
            </span>
          )}
          
          {exercise.type && (
            <span 
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              style={{
                background: 'var(--border)',
                color: 'var(--foreground)'
              }}
            >
              {exercise.type}
            </span>
          )}
        </div>
        
        {/* Notas (preview) */}
        {exercise.notes && (
          <p 
            className="text-sm line-clamp-2"
            style={{ color: 'var(--secondary)' }}
          >
            {exercise.notes}
          </p>
        )}
        
        {/* Data de criação */}
        <div 
          className="text-xs"
          style={{ color: 'var(--secondary)' }}
        >
          Criado em {new Date(exercise.created_at).toLocaleDateString('pt-BR')}
        </div>
      </div>
    </div>
  );
}