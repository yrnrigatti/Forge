import React from 'react'
import { ExerciseError, ExerciseErrorCode } from '@/lib/errors/exerciseErrors'
import { ValidationError } from '@/lib/validations/exerciseValidations'

interface ErrorDisplayProps {
  error?: ExerciseError | Error | string | null
  validationErrors?: ValidationError[]
  className?: string
  showDetails?: boolean
  onRetry?: () => void
}

export function ErrorDisplay({ 
  error, 
  validationErrors, 
  className = '', 
  showDetails = false,
  onRetry
}: ErrorDisplayProps) {
  if (!error && (!validationErrors || validationErrors.length === 0)) {
    return null
  }

  const getErrorMessage = () => {
    if (error instanceof ExerciseError) {
      return error.getUserFriendlyMessage()
    }
    if (error instanceof Error) {
      return error.message
    }
    if (typeof error === 'string') {
      return error
    }
    return 'Ocorreu um erro inesperado'
  }

  const getErrorIcon = () => {
    if (error instanceof ExerciseError) {
      switch (error.code) {
        case ExerciseErrorCode.VALIDATION_ERROR:
          return '⚠️'
        case ExerciseErrorCode.NOT_FOUND:
          return '🔍'
        case ExerciseErrorCode.UNAUTHORIZED:
          return '🔒'
        case ExerciseErrorCode.NETWORK_ERROR:
          return '📡'
        default:
          return '❌'
      }
    }
    return '❌'
  }

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <span className="text-lg">{getErrorIcon()}</span>
        <div className="flex-1">
          {error && (
            <div className="text-red-800 font-medium mb-2">
              {getErrorMessage()}
            </div>
          )}
          
          {validationErrors && validationErrors.length > 0 && (
            <div className="space-y-1">
              <p className="text-red-800 font-medium text-sm">Erros de validação:</p>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((validationError, index) => (
                  <li key={index} className="text-red-700 text-sm">
                    <span className="font-medium">{validationError.field}:</span> {validationError.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {showDetails && error instanceof ExerciseError && error.originalError && (
            <details className="mt-2">
              <summary className="text-red-600 text-xs cursor-pointer">Detalhes técnicos</summary>
              <pre className="text-red-600 text-xs mt-1 bg-red-100 p-2 rounded overflow-auto">
                {error.originalError.message}
              </pre>
            </details>
          )}
          
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Tentar Novamente
            </button>
          )}
        </div>
      </div>
    </div>
  )
}