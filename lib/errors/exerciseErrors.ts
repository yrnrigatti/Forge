export enum ExerciseErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  DUPLICATE_NAME = 'DUPLICATE_NAME',
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class ExerciseError extends Error {
  public readonly code: ExerciseErrorCode
  public readonly field?: string
  public readonly originalError?: Error

  constructor(
    message: string,
    code: ExerciseErrorCode,
    field?: string,
    originalError?: Error
  ) {
    super(message)
    this.name = 'ExerciseError'
    this.code = code
    this.field = field
    this.originalError = originalError
  }

  static fromSupabaseError(error: any): ExerciseError {
    // Mapear erros específicos do Supabase
    switch (error.code) {
      case 'PGRST116':
        return new ExerciseError(
          'Exercício não encontrado',
          ExerciseErrorCode.NOT_FOUND,
          undefined,
          error
        )
      case '23505': // Violação de constraint única
        return new ExerciseError(
          'Já existe um exercício com este nome',
          ExerciseErrorCode.DUPLICATE_NAME,
          'name',
          error
        )
      case '42501': // Permissão negada
        return new ExerciseError(
          'Você não tem permissão para realizar esta operação',
          ExerciseErrorCode.UNAUTHORIZED,
          undefined,
          error
        )
      default:
        return new ExerciseError(
          `Erro no banco de dados: ${error.message}`,
          ExerciseErrorCode.DATABASE_ERROR,
          undefined,
          error
        )
    }
  }

  static fromNetworkError(error: any): ExerciseError {
    return new ExerciseError(
      'Erro de conexão. Verifique sua internet e tente novamente.',
      ExerciseErrorCode.NETWORK_ERROR,
      undefined,
      error
    )
  }

  static fromValidationErrors(errors: any[]): ExerciseError {
    const messages = errors.map(err => `${err.field}: ${err.message}`).join(', ')
    return new ExerciseError(
      `Dados inválidos: ${messages}`,
      ExerciseErrorCode.VALIDATION_ERROR
    )
  }

  getUserFriendlyMessage(): string {
    switch (this.code) {
      case ExerciseErrorCode.VALIDATION_ERROR:
        return this.message
      case ExerciseErrorCode.NOT_FOUND:
        return 'Exercício não encontrado'
      case ExerciseErrorCode.UNAUTHORIZED:
        return 'Você não tem permissão para realizar esta ação'
      case ExerciseErrorCode.DUPLICATE_NAME:
        return 'Já existe um exercício com este nome'
      case ExerciseErrorCode.DATABASE_ERROR:
        return 'Erro interno do sistema. Tente novamente.'
      case ExerciseErrorCode.NETWORK_ERROR:
        return 'Problema de conexão. Verifique sua internet.'
      default:
        return 'Ocorreu um erro inesperado. Tente novamente.'
    }
  }
}