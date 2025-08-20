import { CreateWorkoutData, UpdateWorkoutData, AddExerciseToWorkoutData, ReorderWorkoutExerciseData } from '@/types/workout'

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export class WorkoutValidations {
  // Validar dados de criação de treino
  static validateCreateWorkout(data: CreateWorkoutData): ValidationResult {
    const errors: ValidationError[] = []

    // Validar nome
    if (!data.name || data.name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Nome do treino é obrigatório' })
    } else if (data.name.trim().length < 2) {
      errors.push({ field: 'name', message: 'Nome deve ter pelo menos 2 caracteres' })
    } else if (data.name.trim().length > 100) {
      errors.push({ field: 'name', message: 'Nome deve ter no máximo 100 caracteres' })
    }

    // Validar exercise_ids (opcional)
    if (data.exercise_ids !== undefined) {
      if (!Array.isArray(data.exercise_ids)) {
        errors.push({ field: 'exercise_ids', message: 'Lista de exercícios deve ser um array' })
      } else {
        data.exercise_ids.forEach((id, index) => {
          if (!id || typeof id !== 'string') {
            errors.push({ field: `exercise_ids[${index}]`, message: 'ID do exercício é obrigatório' })
          } else if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
            errors.push({ field: `exercise_ids[${index}]`, message: 'ID do exercício deve ser um UUID válido' })
          }
        })
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Validar dados de atualização de treino
  static validateUpdateWorkout(data: UpdateWorkoutData): ValidationResult {
    const errors: ValidationError[] = []

    // Validar nome (se fornecido)
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        errors.push({ field: 'name', message: 'Nome do treino é obrigatório' })
      } else if (data.name.trim().length < 2) {
        errors.push({ field: 'name', message: 'Nome deve ter pelo menos 2 caracteres' })
      } else if (data.name.trim().length > 100) {
        errors.push({ field: 'name', message: 'Nome deve ter no máximo 100 caracteres' })
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Validar ID de treino
  static validateWorkoutId(id: string): ValidationResult {
    const errors: ValidationError[] = []

    if (!id || id.trim().length === 0) {
      errors.push({ field: 'id', message: 'ID do treino é obrigatório' })
    } else if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      errors.push({ field: 'id', message: 'ID do treino deve ser um UUID válido' })
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Validar dados para adicionar exercício ao treino
  static validateAddExerciseToWorkout(data: AddExerciseToWorkoutData): ValidationResult {
    const errors: ValidationError[] = []

    // Validar exercise_id
    if (!data.exercise_id || data.exercise_id.trim().length === 0) {
      errors.push({ field: 'exercise_id', message: 'ID do exercício é obrigatório' })
    } else if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.exercise_id)) {
      errors.push({ field: 'exercise_id', message: 'ID do exercício deve ser um UUID válido' })
    }

    // Validar order (opcional)
    if (data.order !== undefined) {
      if (typeof data.order !== 'number') {
        errors.push({ field: 'order', message: 'Ordem deve ser um número' })
      } else if (data.order < 1) {
        errors.push({ field: 'order', message: 'Ordem deve ser maior que 0' })
      } else if (data.order > 1000) {
        errors.push({ field: 'order', message: 'Ordem deve ser menor que 1000' })
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Validar dados para reordenar exercícios
  static validateReorderWorkoutExercise(data: ReorderWorkoutExerciseData): ValidationResult {
    const errors: ValidationError[] = []

    // Validar workout_exercise_id
    if (!data.workout_exercise_id || data.workout_exercise_id.trim().length === 0) {
      errors.push({ field: 'workout_exercise_id', message: 'ID do exercício do treino é obrigatório' })
    } else if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.workout_exercise_id)) {
      errors.push({ field: 'workout_exercise_id', message: 'ID do exercício do treino deve ser um UUID válido' })
    }

    // Validar new_order
    if (typeof data.new_order !== 'number') {
      errors.push({ field: 'new_order', message: 'Nova ordem deve ser um número' })
    } else if (data.new_order < 1) {
      errors.push({ field: 'new_order', message: 'Nova ordem deve ser maior que 0' })
    } else if (data.new_order > 1000) {
      errors.push({ field: 'new_order', message: 'Nova ordem deve ser menor que 1000' })
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Validar filtros de busca de treinos
  static validateWorkoutFilters(filters: any): ValidationResult {
    const errors: ValidationError[] = []

    // Validar search
    if (filters.search !== undefined) {
      if (typeof filters.search !== 'string') {
        errors.push({ field: 'search', message: 'Termo de busca deve ser uma string' })
      } else if (filters.search.length > 100) {
        errors.push({ field: 'search', message: 'Termo de busca deve ter no máximo 100 caracteres' })
      }
    }

    // Validar dateFrom
    if (filters.dateFrom !== undefined) {
      if (typeof filters.dateFrom !== 'string') {
        errors.push({ field: 'dateFrom', message: 'Data inicial deve ser uma string' })
      } else {
        const date = new Date(filters.dateFrom)
        if (isNaN(date.getTime())) {
          errors.push({ field: 'dateFrom', message: 'Data inicial deve ser uma data válida' })
        }
      }
    }

    // Validar dateTo
    if (filters.dateTo !== undefined) {
      if (typeof filters.dateTo !== 'string') {
        errors.push({ field: 'dateTo', message: 'Data final deve ser uma string' })
      } else {
        const date = new Date(filters.dateTo)
        if (isNaN(date.getTime())) {
          errors.push({ field: 'dateTo', message: 'Data final deve ser uma data válida' })
        }
      }
    }

    // Validar se dateFrom é anterior a dateTo
    if (filters.dateFrom && filters.dateTo) {
      const dateFrom = new Date(filters.dateFrom)
      const dateTo = new Date(filters.dateTo)
      if (dateFrom > dateTo) {
        errors.push({ field: 'dateFrom', message: 'Data inicial deve ser anterior à data final' })
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Validar lista de IDs de exercícios
  static validateExerciseIds(exerciseIds: string[]): ValidationResult {
    const errors: ValidationError[] = []

    if (!Array.isArray(exerciseIds)) {
      errors.push({ field: 'exercise_ids', message: 'Lista de exercícios deve ser um array' })
      return { isValid: false, errors }
    }

    if (exerciseIds.length === 0) {
      errors.push({ field: 'exercise_ids', message: 'Pelo menos um exercício deve ser fornecido' })
    }

    exerciseIds.forEach((id, index) => {
      if (!id || typeof id !== 'string') {
        errors.push({ field: `exercise_ids[${index}]`, message: 'ID do exercício é obrigatório' })
      } else if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        errors.push({ field: `exercise_ids[${index}]`, message: 'ID do exercício deve ser um UUID válido' })
      }
    })

    // Verificar duplicatas
    const uniqueIds = new Set(exerciseIds)
    if (uniqueIds.size !== exerciseIds.length) {
      errors.push({ field: 'exercise_ids', message: 'IDs de exercícios não podem ser duplicados' })
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}