import { useState, useCallback } from 'react'
import { ExerciseError, ExerciseErrorCode } from '@/lib/errors/exerciseErrors'
import { ValidationError } from '@/lib/validations/exerciseValidations'

interface UseErrorHandlerReturn {
  error: ExerciseError | null
  validationErrors: ValidationError[]
  setError: (error: ExerciseError | Error | string | null) => void
  setValidationErrors: (errors: ValidationError[]) => void
  clearErrors: () => void
  handleError: (error: any) => void
}

export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setErrorState] = useState<ExerciseError | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])

  const setError = useCallback((error: ExerciseError | Error | string | null) => {
    if (!error) {
      setErrorState(null)
      return
    }

    if (error instanceof ExerciseError) {
      setErrorState(error)
    } else if (error instanceof Error) {
      setErrorState(new ExerciseError(
        error.message,
        ExerciseErrorCode.UNKNOWN_ERROR,
        undefined,
        error
      ))
    } else if (typeof error === 'string') {
      setErrorState(new ExerciseError(
        error,
        ExerciseErrorCode.UNKNOWN_ERROR
      ))
    }
  }, [])

  const clearErrors = useCallback(() => {
    setErrorState(null)
    setValidationErrors([])
  }, [])

  const handleError = useCallback((error: any) => {
    console.error('Error handled:', error)
    
    // Detectar tipo de erro e tratar adequadamente
    if (error?.code && typeof error.code === 'string') {
      // Erro do Supabase
      setError(ExerciseError.fromSupabaseError(error))
    } else if (error?.name === 'NetworkError' || error?.message?.includes('fetch')) {
      // Erro de rede
      setError(ExerciseError.fromNetworkError(error))
    } else if (error instanceof ExerciseError) {
      // Erro já tratado
      setError(error)
    } else {
      // Erro genérico
      setError(new ExerciseError(
        error?.message || 'Erro inesperado',
        ExerciseErrorCode.UNKNOWN_ERROR,
        undefined,
        error
      ))
    }
  }, [setError])

  return {
    error,
    validationErrors,
    setError,
    setValidationErrors,
    clearErrors,
    handleError
  }
}