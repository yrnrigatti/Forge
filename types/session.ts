export interface Session {
  id: string;
  user_id: string;
  workout_id: string;
  date: string;
  created_at: string;
  started_at: string;
  ended_at?: string;
  status: 'active' | 'completed' | 'cancelled' | 'paused';
  notes?: string;
  duration?: number; // em minutos
  completed: boolean;
}

export interface Set {
  id: string;
  session_id: string;
  exercise_id: string;
  reps: number;
  weight: number;
  notes?: string;
  rest_time?: number; // em segundos
  completed: boolean;
  order: number;
}

export interface CreateSessionData {
  workout_id: string;
  date?: string;
  started_at?: string;
  status?: 'active' | 'completed' | 'cancelled' | 'paused';
  notes?: string;
}

export interface UpdateSessionData {
  notes?: string;
  duration?: number;
  completed?: boolean;
  status?: 'active' | 'completed' | 'cancelled' | 'paused';
  started_at?: string;
  ended_at?: string;
}

export interface CreateSetData {
  exercise_id: string;
  reps: number;
  weight: number;
  notes?: string;
  rest_time?: number;
  order?: number;
}

export interface UpdateSetData {
  reps?: number;
  weight?: number;
  notes?: string;
  rest_time?: number;
  completed?: boolean;
  order?: number;
}

// Interface para sessão com dados relacionados
export interface SessionWithDetails extends Session {
  workout: {
    id: string;
    name: string;
    exercises?: {
      exercise: {
        id: string;
        name: string;
        muscle_group: string | null;
        type: string | null;
      };
    }[];
  };
  sets: SetWithExercise[];
  total_sets: number;
  total_volume: number; // peso total levantado
}

// Interface para set com dados do exercício
export interface SetWithExercise extends Set {
  exercise: {
    id: string;
    name: string;
    muscle_group: string | null;
    type: string | null;
  };
}

// Filtros para sessões
export interface SessionFilters {
  workout_id?: string;
  date_from?: string;
  date_to?: string;
  completed?: boolean;
  search?: string;
}

// Dados para adicionar set à sessão
export interface AddSetToSessionData {
  exercise_id: string;
  reps: number;
  weight: number;
  notes?: string;
  rest_time?: number;
}

// Dados para reordenar sets na sessão
export interface ReorderSessionSetData {
  set_id: string;
  new_order: number;
}

// Enum para ordenação de sessões
export const SESSION_SORT_OPTIONS = [
  'date_asc',
  'date_desc',
  'duration_asc',
  'duration_desc',
  'volume_asc',
  'volume_desc',
  'workout_name_asc',
  'workout_name_desc'
] as const;

export type SessionSortOption = typeof SESSION_SORT_OPTIONS[number];

// Labels para exibição
export const SESSION_SORT_LABELS: Record<SessionSortOption, string> = {
  date_asc: 'Data (Mais Antigas)',
  date_desc: 'Data (Mais Recentes)',
  duration_asc: 'Duração (Menor)',
  duration_desc: 'Duração (Maior)',
  volume_asc: 'Volume (Menor)',
  volume_desc: 'Volume (Maior)',
  workout_name_asc: 'Treino (A-Z)',
  workout_name_desc: 'Treino (Z-A)'
};

// Estatísticas de sessão
export interface SessionStats {
  total_sessions: number;
  total_volume: number;
  average_duration: number;
  favorite_workout: string;
  current_streak: number;
  best_streak: number;
  sessions_this_week: number;
  sessions_this_month: number;
}

// Estatísticas por exercício
export interface ExerciseStats {
  exercise_id: string;
  exercise_name: string;
  total_sets: number;
  total_reps: number;
  total_volume: number;
  max_weight: number;
  average_weight: number;
  last_session_date: string;
  progress_percentage: number;
}

// Dados para iniciar uma sessão de treino
export interface StartWorkoutSessionData {
  workout_id: string;
  exercises: {
    exercise_id: string;
    planned_sets: number;
    last_weight?: number;
    last_reps?: number;
  }[];
}

// Status de uma sessão em andamento
export interface ActiveSessionStatus {
  session_id: string;
  current_exercise_index: number;
  current_set_index: number;
  start_time: string;
  elapsed_time: number;
  is_resting: boolean;
  rest_start_time?: string;
  rest_duration?: number;
}