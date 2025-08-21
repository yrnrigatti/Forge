import { Exercise } from '@/types/exercise';

interface ExerciseCardProps {
  exercise: Exercise;
  onEdit?: (exercise: Exercise) => void;
  onDelete?: (exerciseId: string) => void;  
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
      onDelete(exercise.id);
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{exercise.name}</h3>
            {exercise.is_global && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Global
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {!exercise.is_global && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(exercise);
                  }}
                  className="p-1 text-gray-600 hover:text-blue-600"
                >
                  ✏️
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(exercise.id);
                  }}
                  className="p-1 text-gray-600 hover:text-red-600"
                >
                  🗑️
                </button>
              </>
            )}
          </div>
        </div>
        
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
        
        {exercise.notes && (
          <p 
            className="text-sm line-clamp-2"
            style={{ color: 'var(--secondary)' }}
          >
            {exercise.notes}
          </p>
        )}
        
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