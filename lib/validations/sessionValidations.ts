import { CreateSessionData, UpdateSessionData, CreateSetData, UpdateSetData } from '@/types/session'

type SessionStatus = 'active' | 'completed' | 'cancelled' | 'paused'

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export class SessionValidations {
  static validateCreateSession(data: CreateSessionData): ValidationResult {
    const errors: ValidationError[] = []

    if (!data.workout_id) {
      errors.push({ field: 'workout_id', message: 'ID do treino é obrigatório' })
    } else if (typeof data.workout_id !== 'string' || data.workout_id.trim().length === 0) {
      errors.push({ field: 'workout_id', message: 'ID do treino deve ser uma string válida' })
    }

    if (data.status && !['active', 'completed', 'paused'].includes(data.status)) {
      errors.push({ field: 'status', message: 'Status deve ser: active, completed ou paused' })
    }

    if (data.started_at) {
      const startedAt = new Date(data.started_at)
      if (isNaN(startedAt.getTime())) {
        errors.push({ field: 'started_at', message: 'Data de início deve ser uma data válida' })
      } else if (startedAt > new Date()) {
        errors.push({ field: 'started_at', message: 'Data de início não pode ser no futuro' })
      }
    }

    if (data.notes && data.notes.length > 1000) {
      errors.push({ field: 'notes', message: 'Notas devem ter no máximo 1000 caracteres' })
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  static validateUpdateSession(data: UpdateSessionData): ValidationResult {
    const errors: ValidationError[] = []

    if (data.status && !['active', 'completed', 'paused'].includes(data.status)) {
      errors.push({ field: 'status', message: 'Status deve ser: active, completed ou paused' })
    }

    if (data.started_at) {
      const startedAt = new Date(data.started_at)
      if (isNaN(startedAt.getTime())) {
        errors.push({ field: 'started_at', message: 'Data de início deve ser uma data válida' })
      } else if (startedAt > new Date()) {
        errors.push({ field: 'started_at', message: 'Data de início não pode ser no futuro' })
      }
    }

    if (data.ended_at) {
      const endedAt = new Date(data.ended_at)
      if (isNaN(endedAt.getTime())) {
        errors.push({ field: 'ended_at', message: 'Data de término deve ser uma data válida' })
      }
      
      if (data.started_at) {
        const startedAt = new Date(data.started_at)
        if (endedAt < startedAt) {
          errors.push({ field: 'ended_at', message: 'Data de término deve ser posterior à data de início' })
        }
      }
    }

    if (data.notes !== undefined) {
      if (data.notes !== null && data.notes.length > 1000) {
        errors.push({ field: 'notes', message: 'Notas devem ter no máximo 1000 caracteres' })
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  static validateSessionId(id: string): ValidationResult {
    const errors: ValidationError[] = []

    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      errors.push({ field: 'id', message: 'ID da sessão é obrigatório e deve ser uma string válida' })
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

export class SetValidations {
  static validateCreateSet(data: CreateSetData): ValidationResult {
    const errors: ValidationError[] = []
    if (!data.exercise_id) {
      errors.push({ field: 'exercise_id', message: 'ID do exercício é obrigatório' })
    } else if (typeof data.exercise_id !== 'string' || data.exercise_id.trim().length === 0) {
      errors.push({ field: 'exercise_id', message: 'ID do exercício deve ser uma string válida' })
    }

    if (data.order !== undefined && data.order !== null) {
      if (!Number.isInteger(data.order) || data.order < 0) {
        errors.push({ field: 'order', message: 'Ordem deve ser um número inteiro não negativo' })
      } else if (data.order > 100) {
        errors.push({ field: 'order', message: 'Ordem não pode ser maior que 100' })
      }
    }

    if (data.reps === undefined || data.reps === null) {
      errors.push({ field: 'reps', message: 'Número de repetições é obrigatório' })
    } else if (!Number.isInteger(data.reps) || data.reps < 0) {
      errors.push({ field: 'reps', message: 'Repetições devem ser um número inteiro não negativo' })
    } else if (data.reps > 1000) {
      errors.push({ field: 'reps', message: 'Repetições não podem ser maiores que 1000' })
    }

    if (data.weight === undefined || data.weight === null) {
      errors.push({ field: 'weight', message: 'Peso é obrigatório' })
    } else if (typeof data.weight !== 'number' || data.weight < 0) {
      errors.push({ field: 'weight', message: 'Peso deve ser um número não negativo' })
    } else if (data.weight > 10000) {
      errors.push({ field: 'weight', message: 'Peso não pode ser maior que 10000kg' })
    }

    if (data.rest_time !== undefined && data.rest_time !== null) {
      if (!Number.isInteger(data.rest_time) || data.rest_time < 0) {
        errors.push({ field: 'rest_time', message: 'Tempo de descanso deve ser um número inteiro não negativo (em segundos)' })
      } else if (data.rest_time > 3600) {
        errors.push({ field: 'rest_time', message: 'Tempo de descanso não pode ser maior que 1 hora (3600 segundos)' })
      }
    }

    if (data.notes && data.notes.length > 500) {
      errors.push({ field: 'notes', message: 'Notas devem ter no máximo 500 caracteres' })
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  static validateUpdateSet(data: UpdateSetData): ValidationResult {
    const errors: ValidationError[] = []

    if (data.reps !== undefined && data.reps !== null) {
      if (!Number.isInteger(data.reps) || data.reps < 0) {
        errors.push({ field: 'reps', message: 'Repetições devem ser um número inteiro não negativo' })
      } else if (data.reps > 1000) {
        errors.push({ field: 'reps', message: 'Repetições não podem ser maiores que 1000' })
      }
    }

    if (data.weight !== undefined && data.weight !== null) {
      if (typeof data.weight !== 'number' || data.weight < 0) {
        errors.push({ field: 'weight', message: 'Peso deve ser um número não negativo' })
      } else if (data.weight > 10000) {
        errors.push({ field: 'weight', message: 'Peso não pode ser maior que 10000kg' })
      }
    }

    if (data.rest_time !== undefined && data.rest_time !== null) {
      if (!Number.isInteger(data.rest_time) || data.rest_time < 0) {
        errors.push({ field: 'rest_time', message: 'Tempo de descanso deve ser um número inteiro não negativo (em segundos)' })
      } else if (data.rest_time > 3600) {
        errors.push({ field: 'rest_time', message: 'Tempo de descanso não pode ser maior que 1 hora (3600 segundos)' })
      }
    }

    if (data.order !== undefined && data.order !== null) {
      if (!Number.isInteger(data.order) || data.order < 0) {
        errors.push({ field: 'order', message: 'Ordem deve ser um número inteiro não negativo' })
      } else if (data.order > 100) {
        errors.push({ field: 'order', message: 'Ordem não pode ser maior que 100' })
      }
    }

    if (data.completed !== undefined && data.completed !== null) {
      if (typeof data.completed !== 'boolean') {
        errors.push({ field: 'completed', message: 'Completed deve ser um valor booleano' })
      }
    }

    if (data.notes !== undefined && data.notes !== null) {
      if (typeof data.notes !== 'string') {
        errors.push({ field: 'notes', message: 'Notas devem ser uma string' })
      } else if (data.notes.length > 500) {
        errors.push({ field: 'notes', message: 'Notas devem ter no máximo 500 caracteres' })
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  static validateSetId(id: string): ValidationResult {
    const errors: ValidationError[] = []

    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      errors.push({ field: 'id', message: 'ID do set é obrigatório e deve ser uma string válida' })
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  static validateSetFilters(filters: any): ValidationResult {
    const errors: ValidationError[] = []

    if (filters.session_id && (typeof filters.session_id !== 'string' || filters.session_id.trim().length === 0)) {
      errors.push({ field: 'session_id', message: 'ID da sessão deve ser uma string válida' })
    }

    if (filters.exercise_id && (typeof filters.exercise_id !== 'string' || filters.exercise_id.trim().length === 0)) {
      errors.push({ field: 'exercise_id', message: 'ID do exercício deve ser uma string válida' })
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

export function validateSets(sets: CreateSetData[]): ValidationResult {
  const errors: ValidationError[] = []
  
  sets.forEach((set, index) => {
    const validation = SetValidations.validateCreateSet(set)
    if (!validation.isValid) {
      validation.errors.forEach(error => {
        errors.push({
          field: `sets[${index}].${error.field}`,
          message: `Set ${index + 1}: ${error.message}`
        })
      })
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateSessionConsistency(sessionData: any, sets: any[]): ValidationResult {
  const errors: ValidationError[] = []
  
  if (sessionData.status === 'completed' && sets.length === 0) {
    errors.push({
      field: 'sets',
      message: 'Uma sessão concluída deve ter pelo menos um set'
    })
  }
  
  const invalidSets = sets.filter(set => set.session_id !== sessionData.id)
  if (invalidSets.length > 0) {
    errors.push({
      field: 'sets',
      message: 'Todos os sets devem pertencer à mesma sessão'
    })
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}