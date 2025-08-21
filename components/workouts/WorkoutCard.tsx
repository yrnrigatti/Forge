import { WorkoutWithExercises } from '@/types/workout';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface WorkoutCardProps {
  workout: WorkoutWithExercises;
  onEdit?: (workout: WorkoutWithExercises) => void;
  onDelete?: (workout: WorkoutWithExercises) => void;
  onClick?: (workout: WorkoutWithExercises) => void;
  showActions?: boolean;
  className?: string;
}

export function WorkoutCard({ 
  workout, 
  onEdit, 
  onDelete, 
  onClick, 
  showActions = false,
  className = '' 
}: WorkoutCardProps) {
  const router = useRouter();
  
  const handleCardClick = () => {
    if (onClick) {
      onClick(workout);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(workout);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(workout);
    }
  };

  const handleStartWorkout = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/workouts/${workout.id}/start`);
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
            {workout.name}
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
        
        {/* Informações do treino */}
        <div className="flex flex-wrap gap-2">
          <span 
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{
              background: 'var(--primary)',
              color: 'var(--foreground)'
            }}
          >
            {workout.exercise_count} {workout.exercise_count === 1 ? 'exercício' : 'exercícios'}
          </span>
        </div>
        
        {/* Preview dos exercícios */}
        {workout.workout_exercises.length > 0 && (
          <div className="space-y-1">
            <p 
              className="text-sm font-medium"
              style={{ color: 'var(--foreground)' }}
            >
              Exercícios:
            </p>
            <div className="flex flex-wrap gap-1">
              {workout.workout_exercises.slice(0, 3).map((we, index) => (
                <span 
                  key={we.id}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs"
                  style={{
                    background: 'var(--border)',
                    color: 'var(--foreground)'
                  }}
                >
                  {we.exercise?.name}
                </span>
              ))}
              {workout.workout_exercises.length > 3 && (
                <span 
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs"
                  style={{
                    background: 'var(--border)',
                    color: 'var(--secondary)'
                  }}
                >
                  +{workout.workout_exercises.length - 3} mais
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Data de criação */}
        <div 
          className="text-xs"
          style={{ color: 'var(--secondary)' }}
        >
          Criado em {new Date(workout.created_at).toLocaleDateString('pt-BR')}
        </div>
        
        {/* Botão Iniciar Treino */}
        <div className="mt-4">
          <Button
            onClick={handleStartWorkout}
            className="w-full"
            style={{
              background: 'var(--primary)',
              color: 'var(--foreground)',
              border: 'none'
            }}
          >
            Iniciar Treino
          </Button>
        </div>
      </div>
    </div>
  );
}