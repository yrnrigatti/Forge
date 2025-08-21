export interface Workout {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  order: number;
  exercise?: {
    id: string;
    name: string;
    muscle_group: string | null;
    type: string | null;
  };
}

export interface CreateWorkoutData {
  name: string;
  exercise_ids?: string[];
}

export interface UpdateWorkoutData {
  name?: string;
}

export interface WorkoutWithExercises extends Workout {
  workout_exercises: WorkoutExercise[];
  exercise_count: number;
}

export interface WorkoutFilters {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'name' | 'created_at' | 'exercise_count';
  sortOrder?: 'asc' | 'desc';
}

// Dados para adicionar exercício ao treino
export interface AddExerciseToWorkoutData {
  exercise_id: string;
  order?: number;
}

// Dados para reordenar exercícios no treino
export interface ReorderWorkoutExerciseData {
  workout_exercise_id: string;
  new_order: number;
}

// Enum para ordenação
export const WORKOUT_SORT_OPTIONS = [
  'name_asc',
  'name_desc', 
  'created_at_asc',
  'created_at_desc',
  'exercise_count_asc',
  'exercise_count_desc'
] as const;

export type WorkoutSortOption = typeof WORKOUT_SORT_OPTIONS[number];

// Labels para exibição
export const WORKOUT_SORT_LABELS: Record<WorkoutSortOption, string> = {
  name_asc: 'Nome (A-Z)',
  name_desc: 'Nome (Z-A)',
  created_at_asc: 'Mais Antigos',
  created_at_desc: 'Mais Recentes',
  exercise_count_asc: 'Menos Exercícios',
  exercise_count_desc: 'Mais Exercícios'
};