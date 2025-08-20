import { supabase } from '@/lib/supabase'
import { 
  Workout, 
  WorkoutWithExercises,
  WorkoutExercise,
  CreateWorkoutData, 
  UpdateWorkoutData,
  WorkoutFilters,
  AddExerciseToWorkoutData,
  ReorderWorkoutExerciseData,
  WorkoutSortOption
} from '@/types/workout'

export class WorkoutService {
  // Listar treinos com filtros e ordenação
  static async getWorkouts(filters: WorkoutFilters = {}, sortBy: WorkoutSortOption = 'created_at_desc'): Promise<WorkoutWithExercises[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      let query = supabase
        .from('workouts')
        .select(`
          *,
          workout_exercises (
            id,
            exercise_id,
            order,
            exercise:exercises (
              id,
              name,
              muscle_group,
              type
            )
          )
        `)
        .eq('user_id', user.id)

      // Aplicar filtros
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`)
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom)
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo)
      }

      // Aplicar ordenação
      switch (sortBy) {
        case 'name_asc':
          query = query.order('name', { ascending: true })
          break
        case 'name_desc':
          query = query.order('name', { ascending: false })
          break
        case 'created_at_asc':
          query = query.order('created_at', { ascending: true })
          break
        case 'created_at_desc':
          query = query.order('created_at', { ascending: false })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }

      const { data, error } = await query

      if (error) {
        throw new Error(`Erro ao buscar treinos: ${error.message}`)
      }

      // Processar dados para incluir contagem de exercícios e ordenação
      const workoutsWithExercises: WorkoutWithExercises[] = (data || []).map(workout => {
        const sortedExercises = (workout.workout_exercises || [])
          .sort((a, b) => (a.order || 0) - (b.order || 0))
        
        return {
          ...workout,
          workout_exercises: sortedExercises,
          exercise_count: sortedExercises.length
        }
      })

      // Ordenação por contagem de exercícios (feita no cliente)
      if (sortBy === 'exercise_count_asc' || sortBy === 'exercise_count_desc') {
        workoutsWithExercises.sort((a, b) => {
          const diff = a.exercise_count - b.exercise_count
          return sortBy === 'exercise_count_asc' ? diff : -diff
        })
      }

      return workoutsWithExercises
    } catch (error) {
      console.error('Erro no serviço getWorkouts:', error)
      throw error
    }
  }

  // Buscar treino por ID
  static async getWorkoutById(id: string): Promise<WorkoutWithExercises> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const { data, error } = await supabase
        .from('workouts')
        .select(`
          *,
          workout_exercises (
            id,
            exercise_id,
            order,
            exercise:exercises (
              id,
              name,
              muscle_group,
              type
            )
          )
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error) {
        throw new Error(`Erro ao buscar treino: ${error.message}`)
      }

      const sortedExercises = (data.workout_exercises || [])
        .sort((a, b) => (a.order || 0) - (b.order || 0))

      return {
        ...data,
        workout_exercises: sortedExercises,
        exercise_count: sortedExercises.length
      }
    } catch (error) {
      console.error('Erro no serviço getWorkoutById:', error)
      throw error
    }
  }

  // Criar novo treino
  static async createWorkout(workoutData: CreateWorkoutData): Promise<Workout> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const { data, error } = await supabase
        .from('workouts')
        .insert({
          name: workoutData.name,
          user_id: user.id
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Erro ao criar treino: ${error.message}`)
      }

      // Se foram fornecidos exercícios, adicioná-los ao treino
      if (workoutData.exercise_ids && workoutData.exercise_ids.length > 0) {
        await this.addExercisesToWorkout(data.id, workoutData.exercise_ids)
      }

      return data
    } catch (error) {
      console.error('Erro no serviço createWorkout:', error)
      throw error
    }
  }

  // Atualizar treino existente
  static async updateWorkout(id: string, workoutData: UpdateWorkoutData): Promise<Workout> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const { data, error } = await supabase
        .from('workouts')
        .update(workoutData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        throw new Error(`Erro ao atualizar treino: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Erro no serviço updateWorkout:', error)
      throw error
    }
  }

  // Deletar treino
  static async deleteWorkout(id: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        throw new Error(`Erro ao deletar treino: ${error.message}`)
      }
    } catch (error) {
      console.error('Erro no serviço deleteWorkout:', error)
      throw error
    }
  }

  // Adicionar exercício ao treino
  static async addExerciseToWorkout(workoutId: string, exerciseData: AddExerciseToWorkoutData): Promise<WorkoutExercise> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      // Verificar se o treino pertence ao usuário
      const { data: workout } = await supabase
        .from('workouts')
        .select('id')
        .eq('id', workoutId)
        .eq('user_id', user.id)
        .single()

      if (!workout) {
        throw new Error('Treino não encontrado')
      }

      // Se não foi especificada uma ordem, usar a próxima disponível
      let order = exerciseData.order
      if (order === undefined) {
        const { data: lastExercise } = await supabase
          .from('workout_exercises')
          .select('order')
          .eq('workout_id', workoutId)
          .order('order', { ascending: false })
          .limit(1)
          .single()

        order = (lastExercise?.order || 0) + 1
      }

      const { data, error } = await supabase
        .from('workout_exercises')
        .insert({
          workout_id: workoutId,
          exercise_id: exerciseData.exercise_id,
          order
        })
        .select(`
          *,
          exercise:exercises (
            id,
            name,
            muscle_group,
            type
          )
        `)
        .single()

      if (error) {
        throw new Error(`Erro ao adicionar exercício ao treino: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Erro no serviço addExerciseToWorkout:', error)
      throw error
    }
  }

  // Adicionar múltiplos exercícios ao treino
  static async addExercisesToWorkout(workoutId: string, exerciseIds: string[]): Promise<WorkoutExercise[]> {
    try {
      const results: WorkoutExercise[] = []
      
      for (let i = 0; i < exerciseIds.length; i++) {
        const result = await this.addExerciseToWorkout(workoutId, {
          exercise_id: exerciseIds[i],
          order: i + 1
        })
        results.push(result)
      }

      return results
    } catch (error) {
      console.error('Erro no serviço addExercisesToWorkout:', error)
      throw error
    }
  }

  // Remover exercício do treino
  static async removeExerciseFromWorkout(workoutExerciseId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      // Verificar se o workout_exercise pertence a um treino do usuário
      const { data: workoutExercise } = await supabase
        .from('workout_exercises')
        .select(`
          id,
          workout:workouts!inner (
            user_id
          )
        `)
        .eq('id', workoutExerciseId)
        .single()

      if (!workoutExercise || workoutExercise.workout.user_id !== user.id) {
        throw new Error('Exercício do treino não encontrado')
      }

      const { error } = await supabase
        .from('workout_exercises')
        .delete()
        .eq('id', workoutExerciseId)

      if (error) {
        throw new Error(`Erro ao remover exercício do treino: ${error.message}`)
      }
    } catch (error) {
      console.error('Erro no serviço removeExerciseFromWorkout:', error)
      throw error
    }
  }

  // Reordenar exercícios no treino
  static async reorderWorkoutExercises(reorderData: ReorderWorkoutExerciseData[]): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      // Atualizar cada exercício com sua nova ordem
      for (const item of reorderData) {
        const { error } = await supabase
          .from('workout_exercises')
          .update({ order: item.new_order })
          .eq('id', item.workout_exercise_id)

        if (error) {
          throw new Error(`Erro ao reordenar exercícios: ${error.message}`)
        }
      }
    } catch (error) {
      console.error('Erro no serviço reorderWorkoutExercises:', error)
      throw error
    }
  }

  // Verificar se o usuário possui treinos
  static async hasWorkouts(): Promise<boolean> {
    try {
      const workouts = await this.getWorkouts()
      return workouts.length > 0
    } catch (error) {
      console.error('Erro ao verificar treinos:', error)
      return false
    }
  }

  // Buscar treinos por nome
  static async searchWorkouts(search: string): Promise<WorkoutWithExercises[]> {
    return this.getWorkouts({ search })
  }

  // Contar total de treinos do usuário
  static async getWorkoutCount(): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return 0
      }

      const { count, error } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (error) {
        throw new Error(`Erro ao contar treinos: ${error.message}`)
      }

      return count || 0
    } catch (error) {
      console.error('Erro no serviço getWorkoutCount:', error)
      return 0
    }
  }
}

// Instância padrão para exportação
export const workoutService = WorkoutService