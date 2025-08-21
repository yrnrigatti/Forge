import { supabase } from '@/lib/supabase'
import { Exercise, CreateExerciseData, UpdateExerciseData } from '@/types/exercise'
import { ExerciseValidations } from '@/lib/validations/exerciseValidations'
import { ExerciseError, ExerciseErrorCode } from '@/lib/errors/exerciseErrors'

export interface ExerciseFilters {
  muscleGroup?: string
  type?: string
  search?: string
}

export class ExerciseService {
  // Criar novo exercício com validação
  static async createExercise(exerciseData: CreateExerciseData): Promise<Exercise> {
    try {
      // Validar dados de entrada
      const validation = ExerciseValidations.validateCreateExercise(exerciseData)
      if (!validation.isValid) {
        throw ExerciseError.fromValidationErrors(validation.errors)
      }

      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new ExerciseError(
          'Usuário não autenticado',
          ExerciseErrorCode.UNAUTHORIZED
        )
      }

      const { data, error } = await supabase
        .from('exercises')
        .insert({
          ...exerciseData,
          user_id: user.id,
          name: exerciseData.name.trim() // Limpar espaços
        })
        .select()
        .single()

      if (error) {
        throw ExerciseError.fromSupabaseError(error)
      }

      return data
    } catch (error) {
      if (error instanceof ExerciseError) {
        throw error
      }
      console.error('Erro no serviço createExercise:', error)
      throw new ExerciseError(
        'Erro ao criar exercício',
        ExerciseErrorCode.UNKNOWN_ERROR,
        undefined,
        error as Error
      )
    }
  }

  // Atualizar exercício com validação
  static async updateExercise(id: string, exerciseData: UpdateExerciseData): Promise<Exercise> {
    try {
      // Validar ID
      const idValidation = ExerciseValidations.validateExerciseId(id)
      if (!idValidation.isValid) {
        throw ExerciseError.fromValidationErrors(idValidation.errors)
      }

      // Validar dados de atualização
      const validation = ExerciseValidations.validateUpdateExercise(exerciseData)
      if (!validation.isValid) {
        throw ExerciseError.fromValidationErrors(validation.errors)
      }

      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new ExerciseError(
          'Usuário não autenticado',
          ExerciseErrorCode.UNAUTHORIZED
        )
      }

      // Limpar nome se fornecido
      const cleanData = {
        ...exerciseData,
        ...(exerciseData.name && { name: exerciseData.name.trim() })
      }

      const { data, error } = await supabase
        .from('exercises')
        .update(cleanData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        throw ExerciseError.fromSupabaseError(error)
      }

      return data
    } catch (error) {
      if (error instanceof ExerciseError) {
        throw error
      }
      console.error('Erro no serviço updateExercise:', error)
      throw new ExerciseError(
        'Erro ao atualizar exercício',
        ExerciseErrorCode.UNKNOWN_ERROR,
        undefined,
        error as Error
      )
    }
  }

  // Buscar exercícios com validação de filtros
  static async getExercises(filters?: ExerciseFilters): Promise<Exercise[]> {
    try {
      // Validar filtros se fornecidos
      if (filters) {
        const validation = ExerciseValidations.validateExerciseFilters(filters)
        if (!validation.isValid) {
          throw ExerciseError.fromValidationErrors(validation.errors)
        }
      }

      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new ExerciseError(
          'Usuário não autenticado',
          ExerciseErrorCode.UNAUTHORIZED
        )
      }

      let query = supabase
        .from('exercises')
        .select('*')
        .is('deleted_at', null)
        .or(`user_id.eq.${user.id},user_id.is.null`) 
        .order('is_global', { ascending: false })
        .order('name')
  
      if (filters?.muscleGroup) {
        query = query.eq('muscle_group', filters.muscleGroup)
      }
  
      if (filters?.type) {
        query = query.eq('type', filters.type)
      }
  
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`)
      }
  
      const { data, error } = await query
  
      if (error) {
        throw ExerciseError.fromSupabaseError(error)
      }
  
      return data || []
    } catch (error) {
      if (error instanceof ExerciseError) {
        throw error
      }
      console.error('Erro no serviço getExercises:', error)
      throw new ExerciseError(
        'Erro ao buscar exercícios',
        ExerciseErrorCode.UNKNOWN_ERROR,
        undefined,
        error as Error
      )
    }
  }

  static async getExerciseById(id: string): Promise<Exercise | null> {
    try {
      const validation = ExerciseValidations.validateExerciseId(id)
      if (!validation.isValid) {
        throw ExerciseError.fromValidationErrors(validation.errors)
      }

      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new ExerciseError(
          'Usuário não autenticado',
          ExerciseErrorCode.UNAUTHORIZED
        )
      }

      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null) 
        .or(`user_id.eq.${user.id},user_id.is.null`) 
        .single()
  
      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        throw ExerciseError.fromSupabaseError(error)
      }
  
      return data
    } catch (error) {
      if (error instanceof ExerciseError) {
        throw error
      }
      console.error('Erro no serviço getExerciseById:', error)
      throw new ExerciseError(
        'Erro ao buscar exercício',
        ExerciseErrorCode.UNKNOWN_ERROR,
        undefined,
        error as Error
      )
    }
  }

  static async getPersonalExercises(filters?: ExerciseFilters): Promise<Exercise[]> {
    try {
      if (filters) {
        const validation = ExerciseValidations.validateExerciseFilters(filters)
        if (!validation.isValid) {
          throw ExerciseError.fromValidationErrors(validation.errors)
        }
      }

      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new ExerciseError(
          'Usuário não autenticado',
          ExerciseErrorCode.UNAUTHORIZED
        )
      }

      let query = supabase
        .from('exercises')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('name')
  
      if (filters?.muscleGroup) {
        query = query.eq('muscle_group', filters.muscleGroup)
      }
  
      if (filters?.type) {
        query = query.eq('type', filters.type)
      }
  
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`)
      }
  
      const { data, error } = await query
  
      if (error) {
        throw ExerciseError.fromSupabaseError(error)
      }
  
      return data || []
    } catch (error) {
      if (error instanceof ExerciseError) {
        throw error
      }
      console.error('Erro no serviço getPersonalExercises:', error)
      throw new ExerciseError(
        'Erro ao buscar exercícios pessoais',
        ExerciseErrorCode.UNKNOWN_ERROR,
        undefined,
        error as Error
      )
    }
  }

  static async getGlobalExercises(filters?: ExerciseFilters): Promise<Exercise[]> {
    try {
      if (filters) {
        const validation = ExerciseValidations.validateExerciseFilters(filters)
        if (!validation.isValid) {
          throw ExerciseError.fromValidationErrors(validation.errors)
        }
      }

      let query = supabase
        .from('exercises')
        .select('*')
        .is('user_id', null) 
        .is('deleted_at', null)
        .order('name')
  
      if (filters?.muscleGroup) {
        query = query.eq('muscle_group', filters.muscleGroup)
      }
  
      if (filters?.type) {
        query = query.eq('type', filters.type)
      }
  
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`)
      }
  
      const { data, error } = await query
  
      if (error) {
        throw ExerciseError.fromSupabaseError(error)
      }
  
      return data || []
    } catch (error) {
      console.error('Erro no serviço getGlobalExercises:', error)
      throw new ExerciseError(
        'Erro ao buscar exercícios globais',
        ExerciseErrorCode.UNKNOWN_ERROR,
        undefined,
        error as Error
      )
    }
  }

  static async deleteExercise(id: string): Promise<void> {
    try {
      const validation = ExerciseValidations.validateExerciseId(id)
      if (!validation.isValid) {
        throw ExerciseError.fromValidationErrors(validation.errors)
      }

      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new ExerciseError(
          'Usuário não autenticado',
          ExerciseErrorCode.UNAUTHORIZED
        )
      }

      const { error } = await supabase
        .from('exercises')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .is('deleted_at', null) 

      if (error) {
        throw ExerciseError.fromSupabaseError(error)
      }
    } catch (error) {
      if (error instanceof ExerciseError) {
        throw error
      }
      console.error('Erro no serviço deleteExercise:', error)
      throw new ExerciseError(
        'Erro ao deletar exercício',
        ExerciseErrorCode.UNKNOWN_ERROR,
        undefined,
        error as Error
      )
    }
  }

  static async restoreExercise(id: string): Promise<void> {
    try {
      const validation = ExerciseValidations.validateExerciseId(id)
      if (!validation.isValid) {
        throw ExerciseError.fromValidationErrors(validation.errors)
      }

      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new ExerciseError(
          'Usuário não autenticado',
          ExerciseErrorCode.UNAUTHORIZED
        )
      }

      const { error } = await supabase
        .from('exercises')
        .update({ deleted_at: null })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        throw ExerciseError.fromSupabaseError(error)
      }
    } catch (error) {
      if (error instanceof ExerciseError) {
        throw error
      }
      console.error('Erro no serviço restoreExercise:', error)
      throw new ExerciseError(
        'Erro ao restaurar exercício',
        ExerciseErrorCode.UNKNOWN_ERROR,
        undefined,
        error as Error
      )
    }
  }

  static async getExercisesByMuscleGroup(muscleGroup: string): Promise<Exercise[]> {
    return this.getExercises({ muscleGroup })
  }

  static async getExercisesByType(type: string): Promise<Exercise[]> {
    return this.getExercises({ type })
  }

  static async searchExercises(search: string): Promise<Exercise[]> {
    return this.getExercises({ search })
  }

  static async hasExercises(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return false
      }

      const { count } = await supabase
        .from('exercises')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('deleted_at', null)
  
      return (count || 0) > 0
    } catch (error) {
      console.error('Erro no serviço hasExercises:', error)
      return false
    }
  }

  static async getExerciseCountByMuscleGroup(): Promise<Record<string, number>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return {}
      }

      const { data, error } = await supabase
        .from('exercises')
        .select('muscle_group')
        .eq('user_id', user.id)
        .is('deleted_at', null) 
  
      if (error) {
        throw new Error(`Erro ao contar exercícios: ${error.message}`)
      }

      const counts: Record<string, number> = {}
      data?.forEach(exercise => {
        counts[exercise.muscle_group] = (counts[exercise.muscle_group] || 0) + 1
      })
  
      return counts
    } catch (error) {
      console.error('Erro no serviço getExerciseCountByMuscleGroup:', error)
      return {}
    }
  }
}

export const exerciseService = ExerciseService