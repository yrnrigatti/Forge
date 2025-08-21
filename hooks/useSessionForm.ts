import { useState, useCallback } from 'react'
import { CreateSessionData, UpdateSessionData, CreateSetData, UpdateSetData } from '@/types/session'

interface UseSessionFormReturn {
  sessionData: CreateSessionData | UpdateSessionData
  setData: CreateSetData[]
  validationErrors: string[]
  isValid: boolean
  updateSessionField: (field: string, value: any) => void
  addSet: (exerciseId: string) => void
  updateSet: (index: number, field: string, value: any) => void
  removeSet: (index: number) => void
  validateForm: () => boolean
  resetForm: () => void
  setSessionData: (data: CreateSessionData | UpdateSessionData) => void
}

export function useSessionForm(
  initialSessionData: CreateSessionData | UpdateSessionData = { workout_id: '', status: 'active' },
  initialSetData: CreateSetData[] = []
): UseSessionFormReturn {
  const [sessionData, setSessionDataState] = useState<CreateSessionData | UpdateSessionData>(initialSessionData)
  const [setData, setSetDataState] = useState<CreateSetData[]>(initialSetData)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const updateSessionField = useCallback((field: string, value: any) => {
    setSessionDataState(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Limpar erros quando o campo for atualizado
    setValidationErrors(prev => prev.filter(error => !error.includes(field)))
  }, [])

  const addSet = useCallback((exerciseId: string) => {
    const newSet: CreateSetData = {
      exercise_id: exerciseId,
      weight: 0,
      reps: 0,
      notes: ''
    }
    setSetDataState(prev => [...prev, newSet])
  }, [])

  const updateSet = useCallback((index: number, field: string, value: any) => {
    setSetDataState(prev => prev.map((set, i) => 
      i === index ? { ...set, [field]: value } : set
    ))
  }, [])

  const removeSet = useCallback((index: number) => {
    setSetDataState(prev => prev.filter((_, i) => i !== index))
  }, [])

  const validateForm = useCallback((): boolean => {
    const errors: string[] = []

    // Validar dados da sessão
    if ('workout_id' in sessionData && !sessionData.workout_id) {
      errors.push('workout_id: Treino é obrigatório')
    }

    if (!sessionData.status) {
      errors.push('status: Status é obrigatório')
    }

    // Validar sets
    setData.forEach((set, index) => {
      if (!set.exercise_id) {
        errors.push(`set[${index}].exercise_id: Exercício é obrigatório`)
      }
      if (set.weight < 0) {
        errors.push(`set[${index}].weight: Peso deve ser maior ou igual a 0`)
      }
      if (set.reps < 1) {
        errors.push(`set[${index}].reps: Repetições devem ser maior que 0`)
      }
    })

    setValidationErrors(errors)
    return errors.length === 0
  }, [sessionData, setData])

  const resetForm = useCallback(() => {
    setSessionDataState(initialSessionData)
    setSetDataState(initialSetData)
    setValidationErrors([])
  }, [initialSessionData, initialSetData])

  const setSessionData = useCallback((data: CreateSessionData | UpdateSessionData) => {
    setSessionDataState(data)
    setValidationErrors([])
  }, [])

  const isValid = validationErrors.length === 0

  return {
    sessionData,
    setData,
    validationErrors,
    isValid,
    updateSessionField,
    addSet,
    updateSet,
    removeSet,
    validateForm,
    resetForm,
    setSessionData
  }
}