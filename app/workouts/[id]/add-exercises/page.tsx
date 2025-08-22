'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Exercise } from '@/types/exercise';
import { Workout, WorkoutExercise } from '@/types/workout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { exerciseService } from '@/services/exerciseService';
import { workoutService } from '@/services/workoutService';
import { MUSCLE_GROUPS } from '@/types/exercise';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function AddExercisesToWorkoutPage() {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('');
  
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const workoutId = params.id as string;

  useEffect(() => {
    if (user && workoutId) {
      fetchData();
    }
  }, [user, workoutId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar dados do treino
      const workoutData = await workoutService.getWorkoutById(workoutId);
      setWorkout(workoutData);
      setWorkoutExercises(workoutData.workout_exercises);

      // Buscar todos os exercícios do usuário
      const exercisesData = await exerciseService.getExercises();
      setExercises(exercisesData);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleExerciseToggle = (exerciseId: string) => {
    const newSelected = new Set(selectedExercises);
    if (newSelected.has(exerciseId)) {
      newSelected.delete(exerciseId);
    } else {
      newSelected.add(exerciseId);
    }
    setSelectedExercises(newSelected);
  };

  const handleAddExercises = async () => {
    if (selectedExercises.size === 0) {
      alert('Selecione pelo menos um exercício');
      return;
    }

    try {
      setAdding(true);
      
      // Adicionar exercícios selecionados ao treino
      for (const exerciseId of selectedExercises) {
        await workoutService.addExerciseToWorkout(workoutId, {
          exercise_id: exerciseId
        });
      }

      // Redirecionar para a página de detalhes do treino
      router.push(`/workouts/${workoutId}`);
    } catch (error) {
      console.error('Erro ao adicionar exercícios:', error);
      alert('Erro ao adicionar exercícios ao treino');
    } finally {
      setAdding(false);
    }
  };

  // Filtrar exercícios
  const filteredExercises = exercises.filter(exercise => {
    // Excluir exercícios já adicionados ao treino
    const isAlreadyAdded = workoutExercises.some(
      we => we.exercise_id === exercise.id
    );
    if (isAlreadyAdded) return false;

    // Filtrar por termo de busca
    if (searchTerm && !exercise.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Filtrar por grupo muscular
    if (selectedMuscleGroup && exercise.muscle_group !== selectedMuscleGroup) {
      return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="xl" text="Carregando..." />
      </div>
    )
  }

  if (error || !workout) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--background)' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-[#FF3D00] text-lg">
              {error || 'Treino não encontrado'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/workouts/${workoutId}`)}
              className="w-10 h-10 rounded-lg transition-colors flex items-center justify-center"
              style={{ 
                backgroundColor: 'var(--muted)',
                color: 'var(--muted-foreground)',
                border: '1px solid var(--border)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent)';
                e.currentTarget.style.color = 'var(--accent-foreground)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--muted)';
                e.currentTarget.style.color = 'var(--muted-foreground)';
              }}
              title="Voltar ao Treino"
            >
              ←
            </button>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                Adicionar Exercícios
              </h1>
              <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
                Selecione os exercícios para adicionar ao treino "{workout.name}"
              </p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Busca */}
            <div className="flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Buscar exercícios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            {/* Filtro por grupo muscular */}
            <div className="sm:w-64">
              <select
                value={selectedMuscleGroup}
                onChange={(e) => setSelectedMuscleGroup(e.target.value)}
                className="px-3 py-2 rounded-lg border w-full h-12"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)'
                }}
              >
                <option value="">Todos os grupos musculares</option>
                {MUSCLE_GROUPS.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Exercícios */}
        <div className="mb-6">
          {filteredExercises.length === 0 ? (
            <Card className="p-6 text-center">
              <p style={{ color: 'var(--muted-foreground)' }}>
                {exercises.length === 0 
                  ? 'Nenhum exercício encontrado. Crie alguns exercícios primeiro.'
                  : 'Nenhum exercício disponível com os filtros aplicados.'
                }
              </p>
              {exercises.length === 0 && (
                <Button 
                  onClick={() => router.push('/exercises/new')}
                  className="mt-4"
                >
                  Criar Primeiro Exercício
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredExercises.map(exercise => (
                <Card 
                  key={exercise.id} 
                  className={`p-4 cursor-pointer transition-all duration-200 ${
                    selectedExercises.has(exercise.id) 
                      ? 'border-[#FF6B35] bg-[#FF6B35]/10' 
                      : 'hover:border-[#FF6B35]/50'
                  }`}
                  onClick={() => handleExerciseToggle(exercise.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg" style={{ color: 'var(--foreground)' }}>
                        {exercise.name}
                      </h3>
                      <div className="flex gap-4 text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                        {exercise.muscle_group && (
                          <span>📍 {exercise.muscle_group}</span>
                        )}
                        {exercise.type && (
                          <span>🏋️ {exercise.type}</span>
                        )}
                      </div>
                      {exercise.notes && (
                        <p className="text-sm mt-2" style={{ color: 'var(--muted-foreground)' }}>
                          {exercise.notes}
                        </p>
                      )}
                    </div>
                    <div className="ml-4">
                      <input
                        type="checkbox"
                        checked={selectedExercises.has(exercise.id)}
                        onChange={() => handleExerciseToggle(exercise.id)}
                        className="w-5 h-5 rounded border-2 border-[#FF6B35] text-[#FF6B35] focus:ring-[#FF6B35] focus:ring-2"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Ações - Barra fixa no bottom */}
        {selectedExercises.size > 0 && (
          <div className="fixed bottom-0 left-0 right-0 p-4" style={{ background: 'var(--background)', borderTop: '1px solid var(--border)' }}>
            <div className="container mx-auto max-w-4xl">
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  {selectedExercises.size} exercício(s) selecionado(s)
                </span>
                <div className="flex gap-2">
                  <Button 
                    variant="secondary"
                    onClick={() => setSelectedExercises(new Set())}
                    disabled={adding}
                  >
                    Limpar Seleção
                  </Button>
                  <Button 
                    onClick={handleAddExercises}
                    disabled={adding}
                  >
                    {adding ? 'Adicionando...' : 'Adicionar ao Treino'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Espaçamento para a barra fixa */}
        {selectedExercises.size > 0 && (
          <div className="h-20"></div>
        )}
      </div>
    </div>
  );
}