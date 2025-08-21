import { WorkoutWithExercises } from '@/types/workout';
import { WorkoutCard } from './WorkoutCard';
import { Button } from '@/components/ui/button';

interface WorkoutListProps {
  workouts: WorkoutWithExercises[];
  loading?: boolean;
  onWorkoutClick?: (workout: WorkoutWithExercises) => void;
  onWorkoutEdit?: (workout: WorkoutWithExercises) => void;
  onWorkoutDelete?: (workout: WorkoutWithExercises) => void;
  onCreateNew?: () => void;
  showActions?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
}

export function WorkoutList({
  workouts,
  loading = false,
  onWorkoutClick,
  onWorkoutEdit,
  onWorkoutDelete,
  onCreateNew,
  showActions = false,
  emptyMessage = "Nenhum treino encontrado",
  emptyDescription = "Comece criando seu primeiro treino"
}: WorkoutListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div 
            key={index}
            className="animate-pulse p-6 rounded-lg"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)'
            }}
          >
            <div className="space-y-3">
              <div 
                className="h-6 rounded"
                style={{ background: 'var(--border)' }}
              />
              <div className="flex gap-2">
                <div 
                  className="h-5 w-16 rounded-full"
                  style={{ background: 'var(--border)' }}
                />
              </div>
              <div 
                className="h-4 rounded"
                style={{ background: 'var(--border)' }}
              />
              <div 
                className="h-3 w-24 rounded"
                style={{ background: 'var(--border)' }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <div 
            className="mx-auto w-24 h-24 rounded-full flex items-center justify-center text-4xl mb-4"
            style={{ background: 'var(--border)' }}
          >
          </div>
          <h3 
            className="text-xl font-semibold mb-2"
            style={{ color: 'var(--foreground)' }}
          >
            {emptyMessage}
          </h3>
          <p 
            className="text-sm mb-6"
            style={{ color: 'var(--secondary)' }}
          >
            {emptyDescription}
          </p>
          {onCreateNew && (
            <Button
              onClick={onCreateNew}
              className="px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ 
                background: 'var(--primary)', 
                color: 'var(--foreground)' 
              }}
            >
              Criar Primeiro Treino
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {workouts.map((workout) => (
        <WorkoutCard
          key={workout.id}
          workout={workout}
          onEdit={onWorkoutEdit}
          onDelete={onWorkoutDelete}
          onClick={onWorkoutClick}
          showActions={showActions}
        />
      ))}
    </div>
  );
}