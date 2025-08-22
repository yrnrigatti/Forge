'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { workoutService } from '@/services/workoutService'
import { sessionService } from '@/services/sessionService'
import { WorkoutWithExercises } from '@/types/workout'
import { SessionWithDetails, CreateSessionData } from '@/types/session'
import { SetForm } from '@/components/sessions/SetForm'
import { ErrorDisplay } from '@/components/ui/ErrorDisplay'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function StartWorkoutPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const workoutId = params.id as string
  const sessionId = searchParams.get('sessionId')
  const { user, loading: authLoading } = useAuth()
  const { error, handleError, clearErrors } = useErrorHandler()
  
  const [workout, setWorkout] = useState<WorkoutWithExercises | null>(null)
  const [session, setSession] = useState<SessionWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddSetForm, setShowAddSetForm] = useState(false)
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)

  // Carregar treino e sessão
  const loadData = async () => {
    if (!user || !workoutId) return
    
    try {
      setLoading(true)
      clearErrors()
      
      // Carregar treino
      const workoutData = await workoutService.getWorkoutById(workoutId)
      setWorkout(workoutData)
      
      // Se há sessionId, carregar sessão existente
      if (sessionId) {
        const sessionData = await sessionService.getSessionById(sessionId)
        setSession(sessionData)
      } else {
        // Criar nova sessão
        const newSessionData: CreateSessionData = {
          workout_id: workoutId,
          status: 'active',
          started_at: new Date().toISOString(),
          notes: ''
        }
        const newSession = await sessionService.createSession(newSessionData)
        // Buscar a sessão completa com todos os detalhes
        const sessionWithDetails = await sessionService.getSessionById(newSession.id)
        setSession(sessionWithDetails)
        
        // Atualizar URL com o sessionId
        router.replace(`/workouts/${workoutId}/start?sessionId=${newSession.id}`)
      }
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  // Proteção de rota
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirectTo=/workouts')
      return
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && workoutId) {
      loadData()
    }
  }, [user, workoutId])

  // Handlers
  const handleAddSet = (exerciseId: string) => {
    setSelectedExerciseId(exerciseId)
    setShowAddSetForm(true)
  }

  const handleSetSubmit = async (data: any) => {
    if (!session || !selectedExerciseId) return

    try {
      await sessionService.addSetToSession(session.id, {
        exercise_id: selectedExerciseId,
        ...data
      })
      
      // Recarregar sessão para atualizar os sets
      const updatedSession = await sessionService.getSessionById(session.id)
      setSession(updatedSession)
      
      setShowAddSetForm(false)
      setSelectedExerciseId(null)
    } catch (err) {
      handleError(err)
    }
  }

  const handleCompleteWorkout = async () => {
    if (!session) return

    try {
      await sessionService.updateSession(session.id, {
        status: 'completed',
        ended_at: new Date().toISOString()
      })
      
      router.push(`/sessions/${session.id}`)
    } catch (err) {
      handleError(err)
    }
  }

  const handleNextExercise = () => {
    if (workout && currentExerciseIndex < workout.workout_exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1)
    }
  }

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1)
    }
  }

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="xl" text="Carregando treino..." />
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (!workout || !session) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <ErrorDisplay error="Treino não encontrado" />
      </div>
    )
  }

  // Verificar se há exercícios antes de acessar
  const currentExercise = workout?.workout_exercises?.[currentExerciseIndex]
  const exerciseSets = session.sets?.filter(set => set.exercise_id === currentExercise?.exercise?.id) || []

  // Adicionar verificação para currentExercise
  if (!currentExercise || !currentExercise.exercise) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <ErrorDisplay error="Exercício não encontrado" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="secondary"
            onClick={() => router.push(`/workouts/${workoutId}`)}
          >
            ← Voltar
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-[#E5E5E5] mb-2">
          {workout.name}
        </h1>
        <p className="text-[#A3A3A3]">
          Sessão iniciada {formatDistanceToNow(new Date(session.started_at), { addSuffix: true, locale: ptBR })}
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6">
          <ErrorDisplay error={error} />
        </div>
      )}

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-[#A3A3A3]">
            Exercício {currentExerciseIndex + 1} de {workout.workout_exercises.length}
          </span>
          <span className="text-sm text-[#A3A3A3]">
            {Math.round(((currentExerciseIndex + 1) / workout.workout_exercises.length) * 100)}% concluído
          </span>
        </div>
        <div className="w-full bg-[#2C2C2C] rounded-full h-2">
          <div 
            className="bg-[#FF6B35] h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentExerciseIndex + 1) / workout.workout_exercises.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Current Exercise */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">{currentExercise.exercise.name}</CardTitle>
          <p className="text-[#A3A3A3]">
            {currentExercise.exercise.muscle_group} • {currentExercise.exercise.type}
          </p>
        </CardHeader>
        <CardContent>
          {exerciseSets.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-[#E5E5E5] mb-2">Séries realizadas:</h4>
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 text-sm font-medium text-[#A3A3A3] pb-2 border-b border-[#2C2C2C]">
                  <span>Série</span>
                  <span>Peso (kg)</span>
                  <span>Reps</span>
                </div>
                {exerciseSets.map((set, index) => (
                  <div key={set.id} className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-[#E5E5E5]">{index + 1}</span>
                    <span className="text-[#E5E5E5]">{set.weight}</span>
                    <span className="text-[#E5E5E5]">{set.reps}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Botão para adicionar série */}
          <Button
            variant="primary"
            onClick={() => handleAddSet(currentExercise.exercise!.id)}
            className="w-full"
          >
            Adicionar Série
          </Button>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="secondary"
          onClick={handlePreviousExercise}
          disabled={currentExerciseIndex === 0}
        >
          ← Exercício Anterior
        </Button>
        
        <div className="flex gap-3">
          {currentExerciseIndex < workout.workout_exercises.length - 1 ? (
            <Button
              variant="primary"
              onClick={handleNextExercise}
            >
              Próximo Exercício →
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={handleCompleteWorkout}
            >
              Finalizar Treino
            </Button>
          )}
        </div>
      </div>

      {/* Add Set Form Modal */}
      {showAddSetForm && selectedExerciseId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1F1F1F] rounded-lg p-6 w-full max-w-md">
            <SetForm
              exercise={currentExercise.exercise}
              onSubmit={handleSetSubmit}
              onCancel={() => {
                setShowAddSetForm(false)
                setSelectedExerciseId(null)
              }}
              submitLabel="Adicionar Série"
            />
          </div>
        </div>
      )}
    </div>
  )
}