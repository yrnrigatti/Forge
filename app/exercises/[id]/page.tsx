'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Exercise } from '@/types/exercise';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { SessionService } from '@/services/sessionService';
import { ExerciseService } from '@/services/exerciseService';
import { ExerciseStats } from '@/types/session';

export default function ExerciseDetailPage() {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [exerciseStats, setExerciseStats] = useState<ExerciseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const exerciseId = params.id as string;

  useEffect(() => {
    if (user && exerciseId) {
      fetchExercise();
      fetchExerciseStats();
    }
  }, [user, exerciseId]);

  const fetchExercise = async () => {
    try {
      setLoading(true);
      const exercise = await ExerciseService.getExerciseById(exerciseId);
      
      if (!exercise) {
        setError('Exercício não encontrado');
        return;
      }
      
      // Debug: verificar o valor de is_global
      console.log('Exercise data:', exercise);
      console.log('is_global value:', exercise.is_global);
      
      setExercise(exercise);
    } catch (error) {
      console.error('Erro ao buscar exercício:', error);
      setError('Exercício não encontrado');
    } finally {
      setLoading(false);
    }
  };

  const fetchExerciseStats = async () => {
    try {
      const stats = await SessionService.getExerciseStats(exerciseId);
      setExerciseStats(stats[0] || null);
    } catch (error) {
      console.error('Erro ao buscar estatísticas do exercício:', error);
    }
  };

  const handleEdit = () => {
    router.push(`/exercises/${exerciseId}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este exercício?')) {
      return;
    }

    try {
      setDeleting(true);
      await ExerciseService.deleteExercise(exerciseId);
      router.push('/exercises');
    } catch (error) {
      console.error('Erro ao excluir exercício:', error);
      alert('Erro ao excluir exercício');
    } finally {
      setDeleting(false);
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
          <div className="text-lg">Carregando exercício...</div>
        </div>
      </div>
    );
  }

  if (error || !exercise) {
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
            {error || 'Exercício não encontrado'}
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
          onClick={() => router.push('/exercises')}
          variant="secondary"
          className="mb-4"
        >
          ← Voltar para Exercícios
        </Button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 
              style={{ color: 'var(--foreground)' }}
              className="text-3xl font-bold"
            >
              {exercise.name}
            </h1>
          </div>
          <div className="flex space-x-2">
            {(() => {
              console.log('Renderização condicional - is_global:', exercise?.is_global);
              console.log('Condição !exercise?.is_global:', !exercise?.is_global);
              return !exercise?.is_global;
            })() && (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card 
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)'
            }}
            className="p-6"
          >
            <h2 
              style={{ color: 'var(--foreground)' }}
              className="text-xl font-semibold mb-4"
            >
              Informações do Exercício
            </h2>
            <div className="space-y-4">
              <div>
                <label 
                  style={{ color: 'var(--muted-foreground)' }}
                  className="block text-sm font-medium mb-1"
                >
                  Nome
                </label>
                <div className="flex items-center gap-2">
                  <p 
                    style={{ color: 'var(--foreground)' }}
                    className="text-lg"
                  >
                    {exercise.name}
                  </p>
                  {exercise.is_global && (
                    <span 
                      style={{
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        color: 'rgb(34, 197, 94)',
                        border: '1px solid rgba(34, 197, 94, 0.2)'
                      }}
                      className="px-2 py-1 rounded-full text-xs font-medium"
                    >
                      🌍 Exercício Global
                    </span>
                  )}
                </div>
              </div>

              {exercise.muscle_group && (
                <div>
                  <label 
                    style={{ color: 'var(--muted-foreground)' }}
                    className="block text-sm font-medium mb-1"
                  >
                    Grupo Muscular
                  </label>
                  <span 
                    style={{
                      backgroundColor: 'rgba(255, 107, 53, 0.1)',
                      color: 'var(--primary)',
                      borderColor: 'var(--primary)'
                    }}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border"
                  >
                    {exercise.muscle_group}
                  </span>
                </div>
              )}

              {exercise.type && (
                <div>
                  <label 
                    style={{ color: 'var(--muted-foreground)' }}
                    className="block text-sm font-medium mb-1"
                  >
                    Tipo de Exercício
                  </label>
                  <span 
                    style={{
                      backgroundColor: 'rgba(255, 107, 53, 0.15)',
                      color: 'var(--primary)',
                      borderColor: 'var(--primary)'
                    }}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border"
                  >
                    {exercise.type}
                  </span>
                </div>
              )}

              {exercise.notes && (
                <div>
                  <label 
                    style={{ color: 'var(--muted-foreground)' }}
                    className="block text-sm font-medium mb-1"
                  >
                    Notas/Observações
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
                      {exercise.notes}
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
                  {new Date(exercise.created_at).toLocaleDateString('pt-BR', {
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
              {!exercise?.is_global && (
                <>
                  <Button 
                    onClick={handleEdit}
                    variant="primary"
                    className="w-full"
                  >
                    ✏️ Editar Exercício
                  </Button>
                </>
              )}
              
              <Button 
                onClick={() => router.push(`/workouts/new?exercise=${exercise.id}`)}
                variant="secondary"
                className="w-full"
              >
                🏋️ Adicionar ao Treino
              </Button>
              
              {!exercise?.is_global && (
                <>
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
                    {deleting ? 'Excluindo...' : '🗑️ Excluir Exercício'}
                  </Button>
                </>
              )}
              
              {exercise?.is_global && (
                <div 
                  className="p-3 rounded-lg border text-center"
                  style={{
                    backgroundColor: 'rgba(255, 107, 53, 0.1)',
                    borderColor: '#FF6B35',
                    color: '#A3A3A3'
                  }}
                >
                  <p className="text-sm">
                    Exercícios globais não podem ser editados ou excluídos
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Estatísticas */}
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
            {exerciseStats ? (
              <div 
                style={{ color: 'var(--muted-foreground)' }}
                className="space-y-3 text-sm"
              >
                <div className="flex justify-between">
                  <span>Total de séries:</span>
                  <span style={{ color: 'var(--foreground)' }}>{exerciseStats.total_sets}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total de repetições:</span>
                  <span style={{ color: 'var(--foreground)' }}>{exerciseStats.total_reps}</span>
                </div>
                <div className="flex justify-between">
                  <span>Volume total:</span>
                  <span style={{ color: 'var(--foreground)' }}>{exerciseStats.total_volume.toFixed(1)} kg</span>
                </div>
                <div className="flex justify-between">
                  <span>Peso máximo:</span>
                  <span style={{ color: 'var(--foreground)' }}>{exerciseStats.max_weight} kg</span>
                </div>
                <div className="flex justify-between">
                  <span>Peso médio:</span>
                  <span style={{ color: 'var(--foreground)' }}>{exerciseStats.average_weight.toFixed(1)} kg</span>
                </div>
                <div className="flex justify-between">
                  <span>Última sessão:</span>
                  <span style={{ color: 'var(--foreground)' }}>
                    {new Date(exerciseStats.last_session_date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Progresso:</span>
                  <span 
                    style={{ 
                      color: exerciseStats.progress_percentage >= 0 
                        ? 'var(--success)' 
                        : 'var(--destructive)' 
                    }}
                  >
                    {exerciseStats.progress_percentage >= 0 ? '+' : ''}
                    {exerciseStats.progress_percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ) : (
              <div 
                style={{ color: 'var(--muted-foreground)' }}
                className="space-y-3 text-sm"
              >
                <div className="flex justify-between">
                  <span>Total de séries:</span>
                  <span>0</span>
                </div>
                <div className="flex justify-between">
                  <span>Última sessão:</span>
                  <span>Nunca</span>
                </div>
                <div className="flex justify-between">
                  <span>Volume total:</span>
                  <span>0 kg</span>
                </div>
                <p 
                  style={{ color: 'var(--muted-foreground)' }}
                  className="text-xs mt-4"
                >
                  * Complete sessões com este exercício para ver as estatísticas
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}