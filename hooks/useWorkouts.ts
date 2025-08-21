import { useState, useEffect, useCallback, useMemo } from 'react'
import { WorkoutWithExercises, WorkoutFilters, WorkoutSortOption } from '@/types/workout'
import { workoutService } from '@/services/workoutService'
import { useAuth } from './useAuth'

interface UseWorkoutsReturn {
  workouts: WorkoutWithExercises[]
  loading: boolean
  error: string | null
  refreshWorkouts: () => Promise<void>
  createWorkout: (name: string) => Promise<WorkoutWithExercises | null>
  updateWorkout: (id: string, name: string) => Promise<WorkoutWithExercises | null>
  deleteWorkout: (id: string) => Promise<boolean>
}

export function useWorkouts(
  filters: WorkoutFilters = {},
  sortBy: WorkoutSortOption = 'created_at_desc'
): UseWorkoutsReturn {
  const [workouts, setWorkouts] = useState<WorkoutWithExercises[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Estabilizar os parâmetros para evitar re-criação desnecessária do callback
  const stableFilters = useMemo(() => filters, [JSON.stringify(filters)])
  const stableSortBy = useMemo(() => sortBy, [sortBy])

  const fetchWorkouts = useCallback(async () => {
    if (!user) {
      setWorkouts([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await workoutService.getWorkouts(stableFilters, stableSortBy)
      setWorkouts(data)
    } catch (error) {
      console.error('Erro ao buscar treinos:', error)
      setError('Erro ao carregar treinos')
    } finally {
      setLoading(false)
    }
  }, [user, stableFilters, stableSortBy])

  useEffect(() => {
    fetchWorkouts()
  }, [fetchWorkouts])

  const refreshWorkouts = useCallback(async () => {
    await fetchWorkouts()
  }, [fetchWorkouts])

  const createWorkout = useCallback(async (name: string): Promise<WorkoutWithExercises | null> => {
    try {
      const newWorkout = await workoutService.createWorkout({ name })
      await refreshWorkouts()
      
      // Retornar o treino criado com exercícios vazios
      return {
        ...newWorkout,
        workout_exercises: [],
        exercise_count: 0
      }
    } catch (error) {
      console.error('Erro ao criar treino:', error)
      setError('Erro ao criar treino')
      return null
    }
  }, [refreshWorkouts])

  const updateWorkout = useCallback(async (id: string, name: string): Promise<WorkoutWithExercises | null> => {
    try {
      const updatedWorkout = await workoutService.updateWorkout(id, { name })
      await refreshWorkouts()
      
      // Encontrar o treino atualizado na lista
      const workoutWithExercises = workouts.find(w => w.id === id)
      if (workoutWithExercises) {
        return {
          ...updatedWorkout,
          workout_exercises: workoutWithExercises.workout_exercises,
          exercise_count: workoutWithExercises.exercise_count
        }
      }
      return null
    } catch (error) {
      console.error('Erro ao atualizar treino:', error)
      setError('Erro ao atualizar treino')
      return null
    }
  }, [refreshWorkouts, workouts])

  const deleteWorkout = useCallback(async (id: string): Promise<boolean> => {
    try {
      await workoutService.deleteWorkout(id)
      await refreshWorkouts()
      return true
    } catch (error) {
      console.error('Erro ao excluir treino:', error)
      setError('Erro ao excluir treino')
      return false
    }
  }, [refreshWorkouts])

  return {
    workouts,
    loading,
    error,
    refreshWorkouts,
    createWorkout,
    updateWorkout,
    deleteWorkout
  }
}