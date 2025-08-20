import { useState, useCallback } from 'react'
import { CreateWorkoutData, UpdateWorkoutData } from '@/types/workout'
import { WorkoutValidations, ValidationError } from '@/lib/validations/workoutValidations'

interface UseWorkoutFormReturn {
  formData: CreateWorkoutData | UpdateWorkoutData
  validationErrors: ValidationError[]
  isValid: boolean
  updateField: (field: string, value: any) => void
  validateForm: () => boolean
  resetForm: () => void
  setFormData: (data: CreateWorkoutData | UpdateWorkoutData) => void
}

export function useWorkoutForm(
  initialData: CreateWorkoutData | UpdateWorkoutData = { name: '' },
  isUpdate: boolean = false
): UseWorkoutFormReturn {
  const [formData, setFormDataState] = useState<CreateWorkoutData | UpdateWorkoutData>(initialData)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])

  const updateField = useCallback((field: string, value: any) => {
    setFormDataState(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Limpar erros do campo quando ele for atualizado
    setValidationErrors(prev => prev.filter(error => error.field !== field))
  }, [])

  const validateForm = useCallback((): boolean => {
    let validation
    
    if (isUpdate) {
      validation = WorkoutValidations.validateUpdateWorkout(formData as UpdateWorkoutData)
    } else {
      validation = WorkoutValidations.validateCreateWorkout(formData as CreateWorkoutData)
    }
    
    setValidationErrors(validation.errors)
    return validation.isValid
  }, [formData, isUpdate])

  const resetForm = useCallback(() => {
    setFormDataState(initialData)
    setValidationErrors([])
  }, [initialData])

  const setFormData = useCallback((data: CreateWorkoutData | UpdateWorkoutData) => {
    setFormDataState(data)
    setValidationErrors([])
  }, [])

  const isValid = validationErrors.length === 0

  return {
    formData,
    validationErrors,
    isValid,
    updateField,
    validateForm,
    resetForm,
    setFormData
  }
}