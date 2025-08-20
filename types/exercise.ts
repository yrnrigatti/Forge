export interface Exercise {
  id: string;
  user_id: string;
  name: string;
  muscle_group: string | null;
  type: string | null;
  notes: string | null;
  created_at: string;
}

export interface CreateExerciseData {
  name: string;
  muscle_group?: string;
  type?: string;
  notes?: string;
}

export interface UpdateExerciseData {
  name?: string;
  muscle_group?: string;
  type?: string;
  notes?: string;
}

// Enums para grupos musculares
export const MUSCLE_GROUPS = [
  'Peito',
  'Costas',
  'Ombros',
  'Bíceps',
  'Tríceps',
  'Pernas (Quadríceps)',
  'Pernas (Posterior)',
  'Glúteos',
  'Abdômen',
  'Cardio'
] as const;

export type MuscleGroup = typeof MUSCLE_GROUPS[number];

// Enums para tipos de exercício
export const EXERCISE_TYPES = [
  'Peso Livre',
  'Máquina',
  'Peso Corporal',
  'Cardio',
  'Funcional',
  'Alongamento'
] as const;

export type ExerciseType = typeof EXERCISE_TYPES[number];