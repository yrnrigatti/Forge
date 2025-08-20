import { CreateExerciseData, UpdateExerciseData, MUSCLE_GROUPS, EXERCISE_TYPES } from '@/types/exercise'

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export class ExerciseValidations {
  // Validar dados de criação de exercício
  static validateCreateExercise(data: CreateExerciseData): ValidationResult {
    const errors: ValidationError[] = []

    // Validar nome
    if (!data.name || data.name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Nome do exercício é obrigatório' })
    } else if (data.name.trim().length < 2) {
      errors.push({ field: 'name', message: 'Nome deve ter pelo menos 2 caracteres' })
    } else if (data.name.trim().length > 100) {
      errors.push({ field: 'name', message: 'Nome deve ter no máximo 100 caracteres' })
    }

    // Validar grupo muscular
    if (!data.muscle_group) {
      errors.push({ field: 'muscle_group', message: 'Grupo muscular é obrigatório' })
    } else if (!Object.values(MUSCLE_GROUPS).includes(data.muscle_group as any)) {
      errors.push({ field: 'muscle_group', message: 'Grupo muscular inválido' })
    }

    // Validar tipo
    if (!data.type) {
      errors.push({ field: 'type', message: 'Tipo de exercício é obrigatório' })
    } else if (!Object.values(EXERCISE_TYPES).includes(data.type as any)) {
      errors.push({ field: 'type', message: 'Tipo de exercício inválido' })
    }

    // Validar notas (opcional)
    if (data.notes && data.notes.length > 500) {
      errors.push({ field: 'notes', message: 'Notas devem ter no máximo 500 caracteres' })
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Validar dados de atualização de exercício
  static validateUpdateExercise(data: UpdateExerciseData): ValidationResult {
    const errors: ValidationError[] = []

    // Validar nome (se fornecido)
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        errors.push({ field: 'name', message: 'Nome do exercício é obrigatório' })
      } else if (data.name.trim().length < 2) {
        errors.push({ field: 'name', message: 'Nome deve ter pelo menos 2 caracteres' })
      } else if (data.name.trim().length > 100) {
        errors.push({ field: 'name', message: 'Nome deve ter no máximo 100 caracteres' })
      }
    }

    // Validar grupo muscular (se fornecido)
    if (data.muscle_group !== undefined) {
      if (!data.muscle_group) {
        errors.push({ field: 'muscle_group', message: 'Grupo muscular é obrigatório' })
      } else if (!Object.values(MUSCLE_GROUPS).includes(data.muscle_group as any)) {
        errors.push({ field: 'muscle_group', message: 'Grupo muscular inválido' })
      }
    }

    // Validar tipo (se fornecido)
    if (data.type !== undefined) {
      if (!data.type) {
        errors.push({ field: 'type', message: 'Tipo de exercício é obrigatório' })
      } else if (!Object.values(EXERCISE_TYPES).includes(data.type as any)) {
        errors.push({ field: 'type', message: 'Tipo de exercício inválido' })
      }
    }

    // Validar notas (se fornecido)
    if (data.notes !== undefined && data.notes && data.notes.length > 500) {
      errors.push({ field: 'notes', message: 'Notas devem ter no máximo 500 caracteres' })
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Validar ID de exercício
  static validateExerciseId(id: string): ValidationResult {
    const errors: ValidationError[] = []

    if (!id || id.trim().length === 0) {
      errors.push({ field: 'id', message: 'ID do exercício é obrigatório' })
    } else if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      errors.push({ field: 'id', message: 'ID do exercício deve ser um UUID válido' })
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Validar filtros de busca
  static validateExerciseFilters(filters: any): ValidationResult {
    const errors: ValidationError[] = []

    if (filters.muscleGroup && !Object.values(MUSCLE_GROUPS).includes(filters.muscleGroup)) {
      errors.push({ field: 'muscleGroup', message: 'Grupo muscular inválido para filtro' })
    }

    if (filters.type && !Object.values(EXERCISE_TYPES).includes(filters.type)) {
      errors.push({ field: 'type', message: 'Tipo de exercício inválido para filtro' })
    }

    if (filters.search && typeof filters.search !== 'string') {
      errors.push({ field: 'search', message: 'Termo de busca deve ser uma string' })
    }

    if (filters.search && filters.search.length > 100) {
      errors.push({ field: 'search', message: 'Termo de busca deve ter no máximo 100 caracteres' })
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}