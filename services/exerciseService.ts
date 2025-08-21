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
        .eq('user_id', user.id)
        .order('name')

      // Aplicar filtros
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

  // Buscar exercício por ID com validação
  static async getExerciseById(id: string): Promise<Exercise | null> {
    try {
      // Validar ID
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
        .eq('user_id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Exercício não encontrado
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

  // Deletar exercício
  static async deleteExercise(id: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        throw new Error(`Erro ao deletar exercício: ${error.message}`)
      }
    } catch (error) {
      console.error('Erro no serviço deleteExercise:', error)
      throw error
    }
  }

  // Buscar exercícios por grupo muscular
  static async getExercisesByMuscleGroup(muscleGroup: string): Promise<Exercise[]> {
    return this.getExercises({ muscleGroup })
  }

  // Buscar exercícios por tipo
  static async getExercisesByType(type: string): Promise<Exercise[]> {
    return this.getExercises({ type })
  }

  // Buscar exercícios por nome
  static async searchExercises(search: string): Promise<Exercise[]> {
    return this.getExercises({ search })
  }

  // Verificar se usuário tem exercícios
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

      return (count || 0) > 0
    } catch (error) {
      console.error('Erro no serviço hasExercises:', error)
      return false
    }
  }

  // Obter contagem de exercícios por grupo muscular
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