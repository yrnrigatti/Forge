'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { workoutService } from '@/services/workoutService'
import { CreateWorkoutData, UpdateWorkoutData } from '@/types/workout'
import { WorkoutForm } from '@/components/workouts/WorkoutForm'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { ErrorDisplay } from '@/components/ui/ErrorDisplay'

export default function NewWorkoutPage() {
  const [loading, setLoading] = useState(false)
  const { user, loading: authLoading } = useAuth()
  const { error, handleError, clearErrors } = useErrorHandler()
  const router = useRouter()

  const handleSubmit = async (data: CreateWorkoutData | UpdateWorkoutData) => {
    if (!user) {
      handleError(new Error('Usuário não autenticado'))
      return
    }

    // Validar se name está presente (necessário para criação)
    if (!data.name) {
      handleError(new Error('Nome do treino é obrigatório'))
      return
    }

    try {
      setLoading(true)
      clearErrors()
      
      // Garantir que temos os dados necessários para criação
      const createData: CreateWorkoutData = {
        name: data.name,
        exercise_ids: 'exercise_ids' in data ? data.exercise_ids : undefined
      }
      
      const workout = await workoutService.createWorkout(createData)
      
      // Redirecionar para a página de detalhes do treino criado
      router.push(`/workouts/${workout.id}`)
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  // Proteção de rota
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    router.push('/auth/login?redirectTo=/workouts/new')
    return null
  }

  return (
    <div 
      className="min-h-screen"
      style={{ background: 'var(--background)' }}
    >
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-lg transition-colors flex items-center justify-center"
              style={{ 
                backgroundColor: 'var(--muted)',
                color: 'var(--muted-foreground)',
                border: '1px solid var(--border)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent)'
                e.currentTarget.style.color = 'var(--accent-foreground)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--muted)'
                e.currentTarget.style.color = 'var(--muted-foreground)'
              }}
              title="Voltar"
            >
              ←
            </button>
            <div>
              <h1 
                className="text-3xl font-bold"
                style={{ color: 'var(--foreground)' }}
              >
                Novo Treino
              </h1>
              <p 
                className="mt-1"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Crie um novo treino para sua rotina
              </p>
            </div>
          </div>
        </div>

        {/* Exibição de erros */}
        {error && (
          <ErrorDisplay
            error={error}
            className="mb-6"
          />
        )}

        {/* Formulário */}
        <WorkoutForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Criar Treino"
          isLoading={loading}
        />

        {/* Informações adicionais */}
        <Card className="mt-6 p-4">
          <div className="flex items-start gap-3">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
              style={{
                background: 'var(--primary)',
                color: 'var(--foreground)'
              }}
            >
              💡
            </div>
            <div>
              <h3 
                className="font-medium mb-1"
                style={{ color: 'var(--foreground)' }}
              >
                Dica
              </h3>
              <p 
                className="text-sm"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Após criar o treino, você poderá adicionar exercícios e configurar séries, repetições e cargas.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}