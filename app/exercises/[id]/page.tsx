'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Exercise } from '@/types/exercise';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { SessionService } from '@/services/sessionService';
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
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', exerciseId)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setExercise(data);
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
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', exerciseId)
        .eq('user_id', user?.id);

      if (error) throw error;
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
        <div className="flex justify-between items-start">
          <h1 
            style={{ color: 'var(--foreground)' }}
            className="text-3xl font-bold"
          >
            {exercise.name}
          </h1>
          <div className="flex space-x-2">
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

      {/* Detalhes do Exercício */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Principais */}
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
                <p 
                  style={{ color: 'var(--foreground)' }}
                  className="text-lg"
                >
                  {exercise.name}
                </p>
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
              <Button 
                onClick={handleEdit}
                variant="primary"
                className="w-full"
              >
                ✏️ Editar Exercício
              </Button>
              
              <Button 
                onClick={() => router.push(`/workouts/new?exercise=${exercise.id}`)}
                variant="secondary"
                className="w-full"
              >
                🏋️ Adicionar ao Treino
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
                {deleting ? 'Excluindo...' : '🗑️ Excluir Exercício'}
              </Button>
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