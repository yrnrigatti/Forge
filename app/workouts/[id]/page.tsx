'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Workout, WorkoutExercise } from '@/types/workout';
import { Exercise } from '@/types/exercise';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

interface WorkoutWithExercises extends Workout {
  workout_exercises: (WorkoutExercise & {
    exercise: Exercise;
  })[];
}

export default function WorkoutDetailPage() {
  const [workout, setWorkout] = useState<WorkoutWithExercises | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const workoutId = params.id as string;

  useEffect(() => {
    if (user && workoutId) {
      fetchWorkout();
    }
  }, [user, workoutId]);

  const fetchWorkout = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          *,
          workout_exercises (
            *,
            exercise:exercises (*)
          )
        `)
        .eq('id', workoutId)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setWorkout(data);
    } catch (error) {
      console.error('Erro ao buscar treino:', error);
      setError('Treino não encontrado');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/workouts/${workoutId}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este treino?')) {
      return;
    }

    try {
      setDeleting(true);
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId)
        .eq('user_id', user?.id);

      if (error) throw error;
      router.push('/workouts');
    } catch (error) {
      console.error('Erro ao excluir treino:', error);
      alert('Erro ao excluir treino');
    } finally {
      setDeleting(false);
    }
  };

  const handleRemoveExercise = async (exerciseId: string) => {
    if (!confirm('Tem certeza que deseja remover este exercício do treino?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('workout_exercises')
        .delete()
        .eq('workout_id', workoutId)
        .eq('exercise_id', exerciseId);

      if (error) throw error;
      
      // Atualizar a lista local
      setWorkout(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          workout_exercises: prev.workout_exercises.filter(
            we => we.exercise_id !== exerciseId
          )
        };
      });
    } catch (error) {
      console.error('Erro ao remover exercício:', error);
      alert('Erro ao remover exercício do treino');
    }
  };

  if (loading) {
    return (
      <div 
        style={{
          backgroundColor: 'var(--background)',
          color: 'var(--foreground)',
          minHeight: '100vh'
        }}
        className="container mx-auto p-6"
      >
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Carregando treino...</div>
        </div>
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div 
        style={{
          backgroundColor: 'var(--background)',
          color: 'var(--foreground)',
          minHeight: '100vh'
        }}
        className="container mx-auto p-6"
      >
        <div className="flex justify-center items-center h-64">
          <div style={{ color: 'var(--destructive)' }}>
            {error || 'Treino não encontrado'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
        minHeight: '100vh'
      }}
      className="container mx-auto p-6 max-w-4xl"
    >
      {/* Header */}
      <div className="mb-6">
        <Button 
          onClick={() => router.push('/workouts')}
          variant="secondary"
          className="mb-4"
        >
          ← Voltar para Treinos
        </Button>
        <div className="flex justify-between items-start">
          <h1 
            style={{ color: 'var(--foreground)' }}
            className="text-3xl font-bold"
          >
            {workout.name}
          </h1>
          <div className="flex space-x-2">
            <Button 
              onClick={() => router.push(`/workouts/${workoutId}/start`)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              🏃‍♂️ Iniciar Treino
            </Button>
            <Button onClick={handleEdit} variant="secondary">
              ✏️ Editar
            </Button>
            <Button 
              onClick={handleDelete} 
              variant="destructive"
              disabled={deleting}
            >
              {deleting ? 'Excluindo...' : '🗑️ Excluir'}
            </Button>
          </div>
        </div>
      </div>

      {/* Detalhes do Treino */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Principais */}
        <div className="lg:col-span-2">
          <Card 
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)'
            }}
            className="p-6 mb-6"
          >
            <h2 
              style={{ color: 'var(--foreground)' }}
              className="text-xl font-semibold mb-4"
            >
              Informações do Treino
            </h2>
            <div className="space-y-4">
              <div>
                <label 
                  style={{ color: 'var(--muted-foreground)' }}
                  className="block text-sm font-medium mb-1"
                >
                  Nome
                </label>
                <p 
                  style={{ color: 'var(--foreground)' }}
                  className="text-lg"
                >
                  {workout.name}
                </p>
              </div>

              {workout.description && (
                <div>
                  <label 
                    style={{ color: 'var(--muted-foreground)' }}
                    className="block text-sm font-medium mb-1"
                  >
                    Descrição
                  </label>
                  <div 
                    style={{
                      backgroundColor: 'var(--accent)',
                      borderColor: 'var(--border)'
                    }}
                    className="p-4 rounded-lg border"
                  >
                    <p 
                      style={{ color: 'var(--foreground)' }}
                      className="whitespace-pre-wrap"
                    >
                      {workout.description}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label 
                  style={{ color: 'var(--muted-foreground)' }}
                  className="block text-sm font-medium mb-1"
                >
                  Data de Criação
                </label>
                <p style={{ color: 'var(--muted-foreground)' }}>
                  {new Date(workout.created_at).toLocaleDateString('pt-BR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </Card>

          {/* Lista de Exercícios */}
          <Card 
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)'
            }}
            className="p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 
                style={{ color: 'var(--foreground)' }}
                className="text-xl font-semibold"
              >
                Exercícios ({workout.workout_exercises.length})
              </h2>
              <Button 
                onClick={() => router.push(`/workouts/${workoutId}/add-exercises`)}
                variant="primary"
                size="sm"
              >
                + Adicionar Exercício
              </Button>
            </div>
            
            {workout.workout_exercises.length === 0 ? (
              <div 
                style={{ color: 'var(--muted-foreground)' }}
                className="text-center py-8"
              >
                <p>Nenhum exercício adicionado ainda.</p>
                <p className="text-sm mt-2">Clique em "Adicionar Exercício" para começar.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {workout.workout_exercises.map((workoutExercise, index) => (
                  <div 
                    key={workoutExercise.id}
                    style={{
                      backgroundColor: 'var(--accent)',
                      borderColor: 'var(--border)'
                    }}
                    className="p-4 rounded-lg border flex justify-between items-center"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span 
                          style={{ color: 'var(--muted-foreground)' }}
                          className="text-sm font-medium"
                        >
                          {index + 1}.
                        </span>
                        <div>
                          <h3 
                            style={{ color: 'var(--foreground)' }}
                            className="font-medium"
                          >
                            {workoutExercise.exercise.name}
                          </h3>
                          {workoutExercise.exercise.muscle_group && (
                            <span 
                              style={{
                                backgroundColor: 'rgba(255, 107, 53, 0.1)',
                                color: 'var(--primary)'
                              }}
                              className="inline-block px-2 py-1 rounded text-xs mt-1"
                            >
                              {workoutExercise.exercise.muscle_group}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {(workoutExercise.sets || workoutExercise.reps || workoutExercise.weight) && (
                        <div 
                          style={{ color: 'var(--muted-foreground)' }}
                          className="text-sm mt-2 flex space-x-4"
                        >
                          {workoutExercise.sets && (
                            <span>Séries: {workoutExercise.sets}</span>
                          )}
                          {workoutExercise.reps && (
                            <span>Repetições: {workoutExercise.reps}</span>
                          )}
                          {workoutExercise.weight && (
                            <span>Peso: {workoutExercise.weight}kg</span>
                          )}
                        </div>
                      )}
                      
                      {workoutExercise.notes && (
                        <p 
                          style={{ color: 'var(--muted-foreground)' }}
                          className="text-sm mt-2 italic"
                        >
                          {workoutExercise.notes}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => router.push(`/exercises/${workoutExercise.exercise.id}`)}
                        variant="secondary"
                        size="sm"
                      >
                        👁️
                      </Button>
                      <Button 
                        onClick={() => handleRemoveExercise(workoutExercise.exercise.id)}
                        variant="destructive"
                        size="sm"
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar com Ações */}
        <div>
          <Card 
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)'
            }}
            className="p-6"
          >
            <h3 
              style={{ color: 'var(--foreground)' }}
              className="text-lg font-semibold mb-4"
            >
              Ações
            </h3>
            <div className="space-y-3">
              <Button 
                onClick={handleEdit}
                variant="primary"
                className="w-full"
              >
                ✏️ Editar Treino
              </Button>
              
              <Button 
                onClick={() => router.push(`/workouts/${workoutId}/add-exercises`)}
                variant="secondary"
                className="w-full"
              >
                ➕ Adicionar Exercícios
              </Button>
              
              <Button 
                onClick={() => router.push(`/sessions/new?workout=${workout.id}`)}
                variant="secondary"
                className="w-full"
              >
                🏃‍♂️ Iniciar Sessão
              </Button>
              
              <hr 
                style={{ borderColor: 'var(--border)' }}
                className="my-4" 
              />
              
              <Button 
                onClick={handleDelete}
                variant="destructive"
                disabled={deleting}
                className="w-full"
              >
                {deleting ? 'Excluindo...' : '🗑️ Excluir Treino'}
              </Button>
            </div>
          </Card>

          {/* Estatísticas do Treino */}
          <Card 
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)'
            }}
            className="p-6 mt-6"
          >
            <h3 
              style={{ color: 'var(--foreground)' }}
              className="text-lg font-semibold mb-4"
            >
              Estatísticas
            </h3>
            <div 
              style={{ color: 'var(--muted-foreground)' }}
              className="space-y-3 text-sm"
            >
              <div className="flex justify-between">
                <span>Total de exercícios:</span>
                <span>{workout.workout_exercises.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Sessões realizadas:</span>
                <span>-</span>
              </div>
              <div className="flex justify-between">
                <span>Última sessão:</span>
                <span>-</span>
              </div>
              <div className="flex justify-between">
                <span>Tempo médio:</span>
                <span>-</span>
              </div>
            </div>
            <p 
              style={{ color: 'var(--muted-foreground)' }}
              className="text-xs mt-4"
            >
              * Algumas estatísticas serão exibidas após implementar sessões
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

          {/* Botões de ação */}
          <div className="flex gap-3">
            <Button
              onClick={() => router.push(`/workouts/${workout.id}/start`)}
              className="flex-1"
              style={{
                background: 'var(--primary)',
                color: 'var(--foreground)',
                border: 'none'
              }}
            >
              Iniciar Treino
            </Button>
            <Button
              onClick={() => router.back()}
              variant="outline"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--foreground)'
              }}
            >
              Voltar
            </Button>
            <Button
              onClick={() => router.push(`/workouts/${workout.id}/edit`)}
              variant="outline"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--foreground)'
              }}
            >
              Editar
            </Button>
            <Button
              onClick={handleDeleteWorkout}
              variant="outline"
              style={{
                borderColor: 'var(--destructive)',
                color: 'var(--destructive)'
              }}
            >
              Excluir
            </Button>
          </div>