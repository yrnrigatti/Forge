import { useState } from 'react'
import { CreateSetData, UpdateSetData } from '@/types/session'
import { Exercise } from '@/types/exercise'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

interface SetFormProps {
  initialData?: Partial<CreateSetData | UpdateSetData>
  exercise?: Pick<Exercise, 'id' | 'name' | 'muscle_group' | 'type'>
  onSubmit: (data: CreateSetData | UpdateSetData) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
  isLoading?: boolean
  isUpdate?: boolean
}

export function SetForm({
  initialData = {},
  exercise,
  onSubmit,
  onCancel,
  submitLabel = 'Adicionar Série',
  isLoading = false,
  isUpdate = false
}: SetFormProps) {
  const [formData, setFormData] = useState({
    weight: initialData.weight ?? '',
    reps: initialData.reps ?? '',
    notes: initialData.notes || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    const weightValue = typeof formData.weight === 'string' ? parseFloat(formData.weight) : formData.weight
    const repsValue = typeof formData.reps === 'string' ? parseInt(formData.reps) : formData.reps

    if (isNaN(weightValue) || weightValue < 0) {
      newErrors.weight = 'Peso deve ser maior ou igual a 0'
    }

    if (isNaN(repsValue) || repsValue < 1) {
      newErrors.reps = 'Repetições devem ser maior que 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      const submitData = {
        ...formData,
        weight: typeof formData.weight === 'string' ? parseFloat(formData.weight) : formData.weight,
        reps: typeof formData.reps === 'string' ? parseInt(formData.reps) : formData.reps
      }
      await onSubmit(submitData)
    } catch (error) {
      console.error('Erro ao salvar série:', error)
    }
  }

  const handleFieldChange = (field: string, value: number | string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-[#E5E5E5]">
            {isUpdate ? 'Editar Série' : 'Nova Série'}
            {exercise && (
              <span className="text-sm font-normal text-[#A3A3A3] ml-2">
                - {exercise.name}
              </span>
            )}
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {/* Weight */}
            <div className="space-y-1">
              <Input
                type="number"
                min="0"
                step="0.5"
                value={formData.weight}
                onChange={(e) => handleFieldChange('weight', e.target.value === '' ? '' : parseFloat(e.target.value) || '')}
                placeholder="Ex: 20"
                label="Peso (kg) *"
                error={errors.weight}
              />
            </div>

            {/* Reps */}
            <div className="space-y-1">
              <Input
                type="number"
                min="1"
                value={formData.reps}
                onChange={(e) => handleFieldChange('reps', e.target.value === '' ? '' : parseInt(e.target.value) || '')}
                placeholder="Ex: 10"
                label="Repetições *"
                error={errors.reps}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#E5E5E5]">
              Observações
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              placeholder="Observações sobre a série..."
              rows={2}
              className="w-full rounded-lg border border-[#2C2C2C] bg-[#1F1F1F] px-4 py-3 text-[#E5E5E5] placeholder:text-[#A3A3A3] focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 disabled:cursor-not-allowed disabled:opacity-50 resize-none text-sm"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            type="submit"
            disabled={isLoading}
            size="sm"
            variant="primary"
            className="flex-1"
          >
            {isLoading ? 'Salvando...' : submitLabel}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Card>
  )
}