import { Exercise } from '@/types/exercise';
import { ExerciseCard } from './ExerciseCard';
import { Button } from '@/components/ui/button';

interface ExerciseListProps {
  exercises: Exercise[];
  loading?: boolean;
  onExerciseClick?: (exercise: Exercise) => void;
  onExerciseEdit?: (exercise: Exercise) => void;
  onExerciseDelete?: (exercise: Exercise) => void;
  onCreateNew?: () => void;
  showActions?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
}

export function ExerciseList({
  exercises,
  loading = false,
  onExerciseClick,
  onExerciseEdit,
  onExerciseDelete,
  onCreateNew,
  showActions = false,
  emptyMessage = 'Nenhum exercício cadastrado',
  emptyDescription = 'Comece criando seu primeiro exercício!'
}: ExerciseListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Carregando exercícios...</div>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyMessage}</h3>
        <p className="text-gray-500 mb-4">{emptyDescription}</p>
        {onCreateNew && (
          <Button onClick={onCreateNew} className="bg-blue-600 hover:bg-blue-700">
            Criar Primeiro Exercício
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {exercises.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          onClick={onExerciseClick}
          onEdit={onExerciseEdit}
          onDelete={onExerciseDelete}
          showActions={showActions}
        />
      ))}
    </div>
  );
}