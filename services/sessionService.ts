import { supabase } from '@/lib/supabase'
import { 
  Session, 
  SessionWithDetails,
  Set,
  SetWithExercise,
  CreateSessionData, 
  UpdateSessionData,
  CreateSetData,
  UpdateSetData,
  SessionFilters,
  AddSetToSessionData,
  ReorderSessionSetData,
  SessionSortOption,
  SessionStats,
  ExerciseStats,
  StartWorkoutSessionData
} from '@/types/session'

export class SessionService {
  static async getSessions(filters: SessionFilters = {}, sortBy: SessionSortOption = 'date_desc'): Promise<SessionWithDetails[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      let query = supabase
        .from('sessions')
        .select(`
          *,
          workout:workouts (
            id,
            name
          ),
          sets (
            *,
            exercise:exercises (
              id,
              name,
              muscle_group,
              type
            )
          )
        `)
        .eq('user_id', user.id)

      if (filters.workout_id) {
        query = query.eq('workout_id', filters.workout_id)
      }

      if (filters.date_from) {
        query = query.gte('date', filters.date_from)
      }

      if (filters.date_to) {
        query = query.lte('date', filters.date_to)
      }

      if (filters.completed !== undefined) {
        query = query.eq('completed', filters.completed)
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      if (filters.search) {
        query = query.or(`notes.ilike.%${filters.search}%,workout.name.ilike.%${filters.search}%`)
      }

      switch (sortBy) {
        case 'date_asc':
          query = query.order('date', { ascending: true })
          break
        case 'date_desc':
          query = query.order('date', { ascending: false })
          break
        case 'duration_asc':
          query = query.order('duration', { ascending: true })
          break
        case 'duration_desc':
          query = query.order('duration', { ascending: false })
          break
        case 'workout_name_asc':
          query = query.order('workout.name', { ascending: true })
          break
        case 'workout_name_desc':
          query = query.order('workout.name', { ascending: false })
          break
        default:
          query = query.order('date', { ascending: false })
      }

      const { data, error } = await query

      if (error) {
        throw new Error(`Erro ao buscar sessões: ${error.message}`)
      }

      const sessionsWithDetails: SessionWithDetails[] = (data || []).map(session => {
        const sortedSets = (session.sets || [])
          .sort((a: SetWithExercise, b: SetWithExercise) => (a.order || 0) - (b.order || 0))
        
        const totalVolume = sortedSets.reduce((sum: number, set: SetWithExercise) => {
          return sum + (set.weight * set.reps)
        }, 0)

        return {
          ...session,
          sets: sortedSets,
          total_sets: sortedSets.length,
          total_volume: totalVolume
        }
      })

      if (sortBy === 'volume_asc' || sortBy === 'volume_desc') {
        sessionsWithDetails.sort((a, b) => {
          const diff = a.total_volume - b.total_volume
          return sortBy === 'volume_asc' ? diff : -diff
        })
      }

      return sessionsWithDetails
    } catch (error) {
      console.error('Erro no serviço getSessions:', error)
      throw error
    }
  }

  static async getSessionById(id: string): Promise<SessionWithDetails> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          workout:workouts (
            id,
            name,
            workout_exercises (
              exercise:exercises (
                id,
                name,
                muscle_group,
                type
              )
            )
          ),
          sets (
            *,
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
        throw new Error(`Erro ao buscar sessão: ${error.message}`)
      }

      const sortedSets = (data.sets || [])
        .sort((a: SetWithExercise, b: SetWithExercise) => (a.order || 0) - (b.order || 0))
      
      const totalVolume = sortedSets.reduce((sum: number, set: SetWithExercise) => {
        if (set.exercise?.type === 'repetition') {
          return sum + (set.weight * set.reps)
        }
        return sum
      }, 0)

      const workoutWithExercises = {
        ...data.workout,
        exercises: data.workout?.workout_exercises?.map((we: any) => ({
          exercise: we.exercise
        })) || []
      }

      return {
        ...data,
        workout: workoutWithExercises,
        sets: sortedSets,
        total_sets: sortedSets.length,
        total_volume: totalVolume
      }
    } catch (error) {
      console.error('Erro no serviço getSessionById:', error)
      throw error
    }
  }

  static async createSession(sessionData: CreateSessionData): Promise<Session> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }
  
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          user_id: user.id, 
          workout_id: sessionData.workout_id,
          date: sessionData.date || new Date().toISOString(),
          notes: sessionData.notes,
          completed: false
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Erro ao criar sessão: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Erro no serviço createSession:', error)
      throw error
    }
  }

  static async startWorkoutSession(workoutData: StartWorkoutSessionData): Promise<Session> {
    try {
      const session = await this.createSession({
        workout_id: workoutData.workout_id
      })

      for (let i = 0; i < workoutData.exercises.length; i++) {
        const exercise = workoutData.exercises[i]
        
        for (let setIndex = 0; setIndex < exercise.planned_sets; setIndex++) {
          await this.addSetToSession(session.id, {
            exercise_id: exercise.exercise_id,
            reps: exercise.last_reps || 0,
            weight: exercise.last_weight || 0,
            order: (i * exercise.planned_sets) + setIndex + 1
          })
        }
      }

      return session
    } catch (error) {
      console.error('Erro no serviço startWorkoutSession:', error)
      throw error
    }
  }

  static async updateSession(id: string, sessionData: UpdateSessionData): Promise<Session> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const { data, error } = await supabase
        .from('sessions')
        .update(sessionData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        throw new Error(`Erro ao atualizar sessão: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Erro no serviço updateSession:', error)
      throw error
    }
  }

  static async deleteSession(id: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        throw new Error(`Erro ao deletar sessão: ${error.message}`)
      }
    } catch (error) {
      console.error('Erro no serviço deleteSession:', error)
      throw error
    }
  }

  static async addSetToSession(sessionId: string, setData: AddSetToSessionData): Promise<SetWithExercise> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const { data: session } = await supabase
        .from('sessions')
        .select('id')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single()

      if (!session) {
        throw new Error('Sessão não encontrada')
      }

      let order = setData.order
      if (order === undefined) {
        const { data: lastSet } = await supabase
          .from('sets')
          .select('order')
          .eq('session_id', sessionId)
          .order('order', { ascending: false })
          .limit(1)
          .single()

        order = (lastSet?.order || 0) + 1
      }

      const { data, error } = await supabase
        .from('sets')
        .insert({
          session_id: sessionId,
          exercise_id: setData.exercise_id,
          reps: setData.reps,
          weight: setData.weight,
          notes: setData.notes,
          rest_time: setData.rest_time,
          order,
          completed: false
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
        throw new Error(`Erro ao adicionar set à sessão: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Erro no serviço addSetToSession:', error)
      throw error
    }
  }

  static async updateSet(setId: string, setData: UpdateSetData): Promise<SetWithExercise> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const { data: set } = await supabase
        .from('sets')
        .select(`
          id,
          session:sessions!inner (
            user_id
          )
        `)
        .eq('id', setId)
        .single()
      
      if (!set || (set.session as any).user_id !== user.id) {
        throw new Error('Set não encontrado')
      }

      const { data, error } = await supabase
        .from('sets')
        .update(setData)
        .eq('id', setId)
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
        throw new Error(`Erro ao atualizar set: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Erro no serviço updateSet:', error)
      throw error
    }
  }

  static async removeSetFromSession(setId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const { data: set } = await supabase
        .from('sets')
        .select(`
          id,
          session:sessions!inner (
            user_id
          )
        `)
        .eq('id', setId)
        .single()
      
      if (!set || (set.session as any).user_id !== user.id) {
        throw new Error('Set não encontrado')
      }

      const { error } = await supabase
        .from('sets')
        .delete()
        .eq('id', setId)

      if (error) {
        throw new Error(`Erro ao remover set da sessão: ${error.message}`)
      }
    } catch (error) {
      console.error('Erro no serviço removeSetFromSession:', error)
      throw error
    }
  }

  static async reorderSessionSets(reorderData: ReorderSessionSetData[]): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      for (const item of reorderData) {
        const { error } = await supabase
          .from('sets')
          .update({ order: item.new_order })
          .eq('id', item.set_id)

        if (error) {
          throw new Error(`Erro ao reordenar sets: ${error.message}`)
        }
      }
    } catch (error) {
      console.error('Erro no serviço reorderSessionSets:', error)
      throw error
    }
  }

  static async completeSession(sessionId: string, duration?: number): Promise<Session> {
    try {
      return await this.updateSession(sessionId, {
        completed: true,
        duration
      })
    } catch (error) {
      console.error('Erro no serviço completeSession:', error)
      throw error
    }
  }

  static async getSessionStats(): Promise<SessionStats> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const sessions = await this.getSessions()
      const completedSessions = sessions.filter(s => s.completed)
      
      const totalVolume = completedSessions.reduce((sum, session) => {
        return sum + session.total_volume
      }, 0)

      const averageDuration = completedSessions.length > 0 
        ? completedSessions.reduce((sum, session) => sum + (session.duration || 0), 0) / completedSessions.length
        : 0

      const sortedSessions = completedSessions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      
      let currentStreak = 0
      let bestStreak = 0
      let tempStreak = 0
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      for (let i = 0; i < sortedSessions.length; i++) {
        const sessionDate = new Date(sortedSessions[i].date)
        sessionDate.setHours(0, 0, 0, 0)
        
        const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (i === 0 && daysDiff <= 1) {
          currentStreak = 1
          tempStreak = 1
        } else if (i > 0) {
          const prevSessionDate = new Date(sortedSessions[i - 1].date)
          prevSessionDate.setHours(0, 0, 0, 0)
          const prevDaysDiff = Math.floor((prevSessionDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))
          
          if (prevDaysDiff === 1) {
            tempStreak++
            if (i === 0 || currentStreak > 0) currentStreak++
          } else {
            if (tempStreak > bestStreak) bestStreak = tempStreak
            tempStreak = 1
            if (i === 0) currentStreak = 0
          }
        }
      }
      
      if (tempStreak > bestStreak) bestStreak = tempStreak

      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      
      const sessionsThisWeek = completedSessions.filter(s => 
        new Date(s.date) >= oneWeekAgo
      ).length
      
      const sessionsThisMonth = completedSessions.filter(s => 
        new Date(s.date) >= oneMonthAgo
      ).length

      const workoutCounts: Record<string, number> = {}
      completedSessions.forEach(session => {
        workoutCounts[session.workout.name] = (workoutCounts[session.workout.name] || 0) + 1
      })
      
      const favoriteWorkout = Object.keys(workoutCounts).reduce((a, b) => 
        workoutCounts[a] > workoutCounts[b] ? a : b, ''
      )

      return {
        total_sessions: completedSessions.length,
        total_volume: totalVolume, 
        average_duration: averageDuration,
        favorite_workout: favoriteWorkout,
        current_streak: currentStreak,
        best_streak: bestStreak,
        sessions_this_week: sessionsThisWeek,
        sessions_this_month: sessionsThisMonth
      }
    } catch (error) {
      console.error('Erro no serviço getSessionStats:', error)
      throw error
    }
  }

  static async getExerciseStats(exerciseId?: string): Promise<ExerciseStats[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      let query = supabase
        .from('sets')
        .select(`
          *,
          exercise:exercises (
            id,
            name
          ),
          session:sessions!inner (
            user_id,
            date
          )
        `)
        .eq('session.user_id', user.id)

      if (exerciseId) {
        query = query.eq('exercise_id', exerciseId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Erro na query de estatísticas:', error)
        throw new Error(`Erro ao buscar estatísticas de exercícios: ${error.message}`)
      }

      console.log('Sets encontrados:', data?.length || 0)

      if (!data || data.length === 0) {
        return []
      }

      const exerciseGroups: Record<string, any[]> = {}
      data.forEach(set => {
        if (!exerciseGroups[set.exercise_id]) {
          exerciseGroups[set.exercise_id] = []
        }
        exerciseGroups[set.exercise_id].push(set)
      })

      const stats: ExerciseStats[] = Object.keys(exerciseGroups).map(exerciseId => {
        const sets = exerciseGroups[exerciseId]
        const totalSets = sets.length
        const totalReps = sets.reduce((sum, set) => sum + (set.reps || 0), 0)
        const totalVolume = sets.reduce((sum, set) => sum + ((set.weight || 0) * (set.reps || 0)), 0)
        const weights = sets.map(set => set.weight || 0).filter(w => w > 0)
        const maxWeight = weights.length > 0 ? Math.max(...weights) : 0
        const averageWeight = weights.length > 0 ? weights.reduce((sum, w) => sum + w, 0) / weights.length : 0
        
        const sortedByDate = sets.sort((a, b) => 
          new Date(b.session.date).getTime() - new Date(a.session.date).getTime()
        )
        const lastSessionDate = sortedByDate[0]?.session.date
        
        const recentSets = sortedByDate.slice(0, 5)
        const olderSets = sortedByDate.slice(5, 10)
        
        let progressPercentage = 0
        if (olderSets.length > 0 && recentSets.length > 0) {
          const recentWeights = recentSets.map(s => s.weight || 0).filter(w => w > 0)
          const olderWeights = olderSets.map(s => s.weight || 0).filter(w => w > 0)
          
          if (recentWeights.length > 0 && olderWeights.length > 0) {
            const recentAvgWeight = recentWeights.reduce((sum, w) => sum + w, 0) / recentWeights.length
            const olderAvgWeight = olderWeights.reduce((sum, w) => sum + w, 0) / olderWeights.length
            progressPercentage = ((recentAvgWeight - olderAvgWeight) / olderAvgWeight) * 100
          }
        }

        return {
          exercise_id: exerciseId,
          exercise_name: sets[0].exercise.name,
          total_sets: totalSets,
          total_reps: totalReps,
          total_volume: totalVolume,
          max_weight: maxWeight,
          average_weight: averageWeight,
          last_session_date: lastSessionDate,
          progress_percentage: progressPercentage
        }
      })

      return stats.sort((a, b) => b.total_volume - a.total_volume)
    } catch (error) {
      console.error('Erro no serviço getExerciseStats:', error)
      throw error
    }
  }

  static async getSessionsByWorkout(workoutId: string): Promise<SessionWithDetails[]> {
    return this.getSessions({ workout_id: workoutId })
  }

  static async hasSessions(): Promise<boolean> {
    try {
      const sessions = await this.getSessions()
      return sessions.length > 0
    } catch (error) {
      console.error('Erro ao verificar sessões:', error)
      return false
    }
  }

  static async getSessionCount(): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return 0
      }

      const { count, error } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (error) {
        throw new Error(`Erro ao contar sessões: ${error.message}`)
      }

      return count || 0
    } catch (error) {
      console.error('Erro no serviço getSessionCount:', error)
      return 0
    }
  }

  static async startWorkout(workoutId: string): Promise<SessionWithDetails> {
    try {
      const session = await this.createSession({
        workout_id: workoutId,
        status: 'active',
        started_at: new Date().toISOString()
      })

      return await this.getSessionById(session.id)
    } catch (error) {
      console.error('Erro no serviço startWorkout:', error)
      throw error
    }
  }
}

export const sessionService = SessionService