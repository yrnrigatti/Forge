import { useState, useEffect, useCallback } from 'react'
import { WorkoutWithExercises, WorkoutExercise } from '@/types/workout'
import { workoutService } from '@/services/workoutService'
import { useAuth } from './useAuth'

interface UseWorkoutReturn {
  workout: WorkoutWithExercises | null
  loading: boolean
  error: string | null
  refreshWorkout: () => Promise<void>
  addExerciseToWorkout: (exerciseId: string) => Promise<boolean>
  removeExerciseFromWorkout: (workoutExerciseId: string) => Promise<boolean>
  reorderExercises: (reorderData: { workout_exercise_id: string; new_order: number }[]) => Promise<boolean>
}

export function useWorkout(workoutId: string): UseWorkoutReturn {
  const [workout, setWorkout] = useState<WorkoutWithExercises | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchWorkout = useCallback(async () => {
    if (!user || !workoutId) {
      setWorkout(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await workoutService.getWorkoutById(workoutId)
      setWorkout(data)
    } catch (error) {
      console.error('Erro ao buscar treino:', error)
      setError('Treino não encontrado')
    } finally {
      setLoading(false)
    }
  }, [user, workoutId])

  useEffect(() => {
    fetchWorkout()
  }, [fetchWorkout])

  const refreshWorkout = useCallback(async () => {
    await fetchWorkout()
  }, [fetchWorkout])

  const addExerciseToWorkout = useCallback(async (exerciseId: string): Promise<boolean> => {
    try {
      await workoutService.addExerciseToWorkout(workoutId, { exercise_id: exerciseId })
      await refreshWorkout()
      return true
    } catch (error) {
      console.error('Erro ao adicionar exercício:', error)
      setError('Erro ao adicionar exercício ao treino')
      return false
    }
  }, [workoutId, refreshWorkout])

  const removeExerciseFromWorkout = useCallback(async (workoutExerciseId: string): Promise<boolean> => {
    try {
      await workoutService.removeExerciseFromWorkout(workoutExerciseId)
      await refreshWorkout()
      return true
    } catch (error) {
      console.error('Erro ao remover exercício:', error)
      setError('Erro ao remover exercício do treino')
      return false
    }
  }, [refreshWorkout])

  const reorderExercises = useCallback(async (
    reorderData: { workout_exercise_id: string; new_order: number }[]
  ): Promise<boolean> => {
    try {
      await workoutService.reorderWorkoutExercises(reorderData)
      await refreshWorkout()
      return true
    } catch (error) {
      console.error('Erro ao reordenar exercícios:', error)
      setError('Erro ao reordenar exercícios')
      return false
    }
  }, [refreshWorkout])

  return {
    workout,
    loading,
    error,
    refreshWorkout,
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    reorderExercises
  }
}