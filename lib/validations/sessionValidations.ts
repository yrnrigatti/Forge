import { CreateSessionData, UpdateSessionData, CreateSetData, UpdateSetData, SessionStatus } from '@/types/session'

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export class SessionValidations {
  // Validar dados de criação de sessão
  static validateCreateSession(data: CreateSessionData): ValidationResult {
    const errors: ValidationError[] = []

    // Validar workout_id
    if (!data.workout_id) {
      errors.push({ field: 'workout_id', message: 'ID do treino é obrigatório' })
    } else if (typeof data.workout_id !== 'string' || data.workout_id.trim().length === 0) {
      errors.push({ field: 'workout_id', message: 'ID do treino deve ser uma string válida' })
    }

    // Validar user_id
    if (!data.user_id) {
      errors.push({ field: 'user_id', message: 'ID do usuário é obrigatório' })
    } else if (typeof data.user_id !== 'string' || data.user_id.trim().length === 0) {
      errors.push({ field: 'user_id', message: 'ID do usuário deve ser uma string válida' })
    }

    // Validar status (opcional, mas se fornecido deve ser válido)
    if (data.status && !['active', 'completed', 'paused'].includes(data.status)) {
      errors.push({ field: 'status', message: 'Status deve ser: active, completed ou paused' })
    }

    // Validar started_at (opcional)
    if (data.started_at) {
      const startedAt = new Date(data.started_at)
      if (isNaN(startedAt.getTime())) {
        errors.push({ field: 'started_at', message: 'Data de início deve ser uma data válida' })
      } else if (startedAt > new Date()) {
        errors.push({ field: 'started_at', message: 'Data de início não pode ser no futuro' })
      }
    }

    // Validar completed_at (opcional)
    if (data.completed_at) {
      const completedAt = new Date(data.completed_at)
      if (isNaN(completedAt.getTime())) {
        errors.push({ field: 'completed_at', message: 'Data de conclusão deve ser uma data válida' })
      }
      
      if (data.started_at) {
        const startedAt = new Date(data.started_at)
        if (completedAt < startedAt) {
          errors.push({ field: 'completed_at', message: 'Data de conclusão deve ser posterior à data de início' })
        }
      }
    }

    // Validar notes (opcional)
    if (data.notes && data.notes.length > 1000) {
      errors.push({ field: 'notes', message: 'Notas devem ter no máximo 1000 caracteres' })
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Validar dados de atualização de sessão
  static validateUpdateSession(data: UpdateSessionData): ValidationResult {
    const errors: ValidationError[] = []

    // Validar status (se fornecido)
    if (data.status && !['active', 'completed', 'paused'].includes(data.status)) {
      errors.push({ field: 'status', message: 'Status deve ser: active, completed ou paused' })
    }

    // Validar started_at (se fornecido)
    if (data.started_at) {
      const startedAt = new Date(data.started_at)
      if (isNaN(startedAt.getTime())) {
        errors.push({ field: 'started_at', message: 'Data de início deve ser uma data válida' })
      } else if (startedAt > new Date()) {
        errors.push({ field: 'started_at', message: 'Data de início não pode ser no futuro' })
      }
    }

    // Validar completed_at (se fornecido)
    if (data.completed_at) {
      const completedAt = new Date(data.completed_at)
      if (isNaN(completedAt.getTime())) {
        errors.push({ field: 'completed_at', message: 'Data de conclusão deve ser uma data válida' })
      }
      
      if (data.started_at) {
        const startedAt = new Date(data.started_at)
        if (completedAt < startedAt) {
          errors.push({ field: 'completed_at', message: 'Data de conclusão deve ser posterior à data de início' })
        }
      }
    }

    // Validar notes (se fornecido)
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

  // Validar ID de sessão
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
  // Validar dados de criação de set
  static validateCreateSet(data: CreateSetData): ValidationResult {
    const errors: ValidationError[] = []

    // Validar session_id
    if (!data.session_id) {
      errors.push({ field: 'session_id', message: 'ID da sessão é obrigatório' })
    } else if (typeof data.session_id !== 'string' || data.session_id.trim().length === 0) {
      errors.push({ field: 'session_id', message: 'ID da sessão deve ser uma string válida' })
    }

    // Validar exercise_id
    if (!data.exercise_id) {
      errors.push({ field: 'exercise_id', message: 'ID do exercício é obrigatório' })
    } else if (typeof data.exercise_id !== 'string' || data.exercise_id.trim().length === 0) {
      errors.push({ field: 'exercise_id', message: 'ID do exercício deve ser uma string válida' })
    }

    // Validar set_number
    if (data.set_number === undefined || data.set_number === null) {
      errors.push({ field: 'set_number', message: 'Número do set é obrigatório' })
    } else if (!Number.isInteger(data.set_number) || data.set_number < 1) {
      errors.push({ field: 'set_number', message: 'Número do set deve ser um número inteiro positivo' })
    } else if (data.set_number > 50) {
      errors.push({ field: 'set_number', message: 'Número do set não pode ser maior que 50' })
    }

    // Validar reps (opcional, mas se fornecido deve ser válido)
    if (data.reps !== undefined && data.reps !== null) {
      if (!Number.isInteger(data.reps) || data.reps < 0) {
        errors.push({ field: 'reps', message: 'Repetições devem ser um número inteiro não negativo' })
      } else if (data.reps > 1000) {
        errors.push({ field: 'reps', message: 'Repetições não podem ser maiores que 1000' })
      }
    }

    // Validar weight (opcional, mas se fornecido deve ser válido)
    if (data.weight !== undefined && data.weight !== null) {
      if (typeof data.weight !== 'number' || data.weight < 0) {
        errors.push({ field: 'weight', message: 'Peso deve ser um número não negativo' })
      } else if (data.weight > 10000) {
        errors.push({ field: 'weight', message: 'Peso não pode ser maior que 10000kg' })
      }
    }

    // Validar duration (opcional, mas se fornecido deve ser válido)
    if (data.duration !== undefined && data.duration !== null) {
      if (!Number.isInteger(data.duration) || data.duration < 0) {
        errors.push({ field: 'duration', message: 'Duração deve ser um número inteiro não negativo (em segundos)' })
      } else if (data.duration > 86400) { // 24 horas em segundos
        errors.push({ field: 'duration', message: 'Duração não pode ser maior que 24 horas' })
      }
    }

    // Validar distance (opcional, mas se fornecido deve ser válido)
    if (data.distance !== undefined && data.distance !== null) {
      if (typeof data.distance !== 'number' || data.distance < 0) {
        errors.push({ field: 'distance', message: 'Distância deve ser um número não negativo' })
      } else if (data.distance > 1000000) { // 1000km em metros
        errors.push({ field: 'distance', message: 'Distância não pode ser maior que 1000km' })
      }
    }

    // Validar notes (opcional)
    if (data.notes && data.notes.length > 500) {
      errors.push({ field: 'notes', message: 'Notas devem ter no máximo 500 caracteres' })
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Validar dados de atualização de set
  static validateUpdateSet(data: UpdateSetData): ValidationResult {
    const errors: ValidationError[] = []

    // Validar reps (se fornecido)
    if (data.reps !== undefined && data.reps !== null) {
      if (!Number.isInteger(data.reps) || data.reps < 0) {
        errors.push({ field: 'reps', message: 'Repetições devem ser um número inteiro não negativo' })
      } else if (data.reps > 1000) {
        errors.push({ field: 'reps', message: 'Repetições não podem ser maiores que 1000' })
      }
    }

    // Validar weight (se fornecido)
    if (data.weight !== undefined && data.weight !== null) {
      if (typeof data.weight !== 'number' || data.weight < 0) {
        errors.push({ field: 'weight', message: 'Peso deve ser um número não negativo' })
      } else if (data.weight > 10000) {
        errors.push({ field: 'weight', message: 'Peso não pode ser maior que 10000kg' })
      }
    }

    // Validar duration (se fornecido)
    if (data.duration !== undefined && data.duration !== null) {
      if (!Number.isInteger(data.duration) || data.duration < 0) {
        errors.push({ field: 'duration', message: 'Duração deve ser um número inteiro não negativo (em segundos)' })
      } else if (data.duration > 86400) {
        errors.push({ field: 'duration', message: 'Duração não pode ser maior que 24 horas' })
      }
    }

    // Validar distance (se fornecido)
    if (data.distance !== undefined && data.distance !== null) {
      if (typeof data.distance !== 'number' || data.distance < 0) {
        errors.push({ field: 'distance', message: 'Distância deve ser um número não negativo' })
      } else if (data.distance > 1000000) {
        errors.push({ field: 'distance', message: 'Distância não pode ser maior que 1000km' })
      }
    }

    // Validar notes (se fornecido)
    if (data.notes !== undefined) {
      if (data.notes !== null && data.notes.length > 500) {
        errors.push({ field: 'notes', message: 'Notas devem ter no máximo 500 caracteres' })
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Validar ID de set
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

  // Validar dados de filtros de sets
  static validateSetFilters(filters: any): ValidationResult {
    const errors: ValidationError[] = []

    // Validar session_id (se fornecido)
    if (filters.session_id && (typeof filters.session_id !== 'string' || filters.session_id.trim().length === 0)) {
      errors.push({ field: 'session_id', message: 'ID da sessão deve ser uma string válida' })
    }

    // Validar exercise_id (se fornecido)
    if (filters.exercise_id && (typeof filters.exercise_id !== 'string' || filters.exercise_id.trim().length === 0)) {
      errors.push({ field: 'exercise_id', message: 'ID do exercício deve ser uma string válida' })
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

// Função utilitária para validar múltiplos sets
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

// Função utilitária para validar consistência de dados de sessão
export function validateSessionConsistency(sessionData: any, sets: any[]): ValidationResult {
  const errors: ValidationError[] = []
  
  // Verificar se há sets para uma sessão ativa
  if (sessionData.status === 'completed' && sets.length === 0) {
    errors.push({
      field: 'sets',
      message: 'Uma sessão concluída deve ter pelo menos um set'
    })
  }
  
  // Verificar se todos os sets pertencem à mesma sessão
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