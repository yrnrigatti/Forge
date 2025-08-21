import { useState, useEffect, useMemo } from 'react'
import { CreateSessionData, UpdateSessionData } from '@/types/session'
import { WorkoutWithExercises } from '@/types/workout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useWorkouts } from '@/hooks/useWorkouts'

interface SessionFormProps {
  initialData?: Partial<CreateSessionData>
  onSubmit: (data: CreateSessionData) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
  isLoading?: boolean
  isUpdate?: false
}

interface SessionFormUpdateProps {
  initialData?: Partial<UpdateSessionData>
  onSubmit: (data: UpdateSessionData) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
  isLoading?: boolean
  isUpdate: true
}

type SessionFormAllProps = SessionFormProps | SessionFormUpdateProps

export function SessionForm(props: SessionFormAllProps) {
  const {
    initialData = {},
    onSubmit,
    onCancel,
    submitLabel = 'Criar Sessão',
    isLoading = false,
    isUpdate = false
  } = props

  const [formData, setFormData] = useState({
    workout_id: (initialData as any).workout_id || '',
    status: initialData.status || 'active',
    notes: initialData.notes || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Estabilizar os parâmetros do useWorkouts para evitar re-renderizações
  const workoutFilters = useMemo(() => ({}), [])
  const workoutSort = useMemo(() => 'created_at_desc' as const, [])
  const { workouts, loading: workoutsLoading } = useWorkouts(workoutFilters, workoutSort)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!isUpdate && !formData.workout_id) {
      newErrors.workout_id = 'Selecione um treino'
    }

    if (!formData.status) {
      newErrors.status = 'Status é obrigatório'
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
      if (isUpdate) {
        // Para updates, não incluir workout_id
        const { workout_id, ...updateData } = formData
        await (onSubmit as (data: UpdateSessionData) => Promise<void>)(updateData as UpdateSessionData)
      } else {
        // Para criação, workout_id é obrigatório
        await (onSubmit as (data: CreateSessionData) => Promise<void>)(formData as CreateSessionData)
      }
    } catch (error) {
      console.error('Erro ao salvar sessão:', error)
    }
  }

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 
          className="text-xl font-bold"
          style={{ color: 'var(--foreground)' }}
        >
          {isUpdate ? 'Editar Sessão' : 'Nova Sessão'}
        </h2>

        {/* Workout Selection */}
        <div className="space-y-2">
          <label 
            htmlFor="workout-select"
            className="block text-sm font-medium"
            style={{ color: 'var(--foreground)' }}
          >
            Treino *
          </label>
          {workoutsLoading ? (
            <div 
              className="w-full px-4 py-3 rounded-lg text-sm"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                color: 'var(--secondary)'
              }}
            >
              Carregando treinos...
            </div>
          ) : (
            <select
              id="workout-select"
              name="workout_id"
              value={formData.workout_id}
              onChange={(e) => handleFieldChange('workout_id', e.target.value)}
              disabled={isUpdate}
              className="forge-input w-full focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
                borderRadius: '8px',
                padding: '12px 16px'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary)'
                e.target.style.boxShadow = '0 0 0 2px rgba(255, 107, 53, 0.2)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border)'
                e.target.style.boxShadow = 'none'
              }}
            >
              <option value="" disabled>
                {workouts.length === 0 ? 'Nenhum treino disponível' : 'Selecione um treino'}
              </option>
              {workouts.map((workout) => (
                <option key={workout.id} value={workout.id}>
                  {workout.name}
                </option>
              ))}
            </select>
          )}
          {errors.workout_id && (
            <p className="text-sm" style={{ color: 'var(--destructive)' }}>
              {errors.workout_id}
            </p>
          )}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label 
            className="text-sm font-medium"
            style={{ color: 'var(--foreground)' }}
          >
            Status *
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleFieldChange('status', e.target.value)}
            className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)'
            }}
          >
            <option value="active">Em andamento</option>
            <option value="completed">Concluída</option>
            <option value="cancelled">Cancelada</option>
          </select>
          {errors.status && (
            <p className="text-sm text-red-400">{errors.status}</p>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label 
            className="text-sm font-medium"
            style={{ color: 'var(--foreground)' }}
          >
            Observações
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            placeholder="Adicione observações sobre a sessão..."
            rows={3}
            className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)'
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div 
        className="flex items-center gap-3 pt-4"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 font-medium transition-colors"
          style={{
            background: 'var(--primary)',
            color: 'var(--foreground)',
            border: 'none'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#e55a2b'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary)'}
        >
          {isLoading ? 'Salvando...' : submitLabel}
        </Button>
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 font-medium transition-colors"
            style={{
              background: 'var(--muted)',
              color: 'var(--muted-foreground)',
              border: '1px solid var(--border)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent)'
              e.currentTarget.style.color = 'var(--accent-foreground)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--muted)'
              e.currentTarget.style.color = 'var(--muted-foreground)'
            }}
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}