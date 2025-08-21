'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { workoutService } from '@/services/workoutService';
import { Workout, UpdateWorkoutData } from '@/types/workout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

export default function EditWorkoutPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const workoutId = params.id as string;

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [formData, setFormData] = useState<UpdateWorkoutData>({
    name: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && workoutId) {
      fetchWorkout();
    }
  }, [user, authLoading, workoutId, router]);

  const fetchWorkout = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const workoutData = await workoutService.getWorkoutById(workoutId);
      setWorkout(workoutData);
      setFormData({
        name: workoutData.name
      });
    } catch (error) {
      console.error('Erro ao buscar treino:', error);
      setError('Treino não encontrado');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      setError('Nome do treino é obrigatório');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await workoutService.updateWorkout(workoutId, {
        name: formData.name.trim()
      });

      router.push(`/workouts/${workoutId}`);
    } catch (error) {
      console.error('Erro ao atualizar treino:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar treino. Tente novamente.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof UpdateWorkoutData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  if (loading) {
    return (
      <div 
        className="container mx-auto p-6"
        style={{
          backgroundColor: 'var(--background)',
          color: 'var(--foreground)',
          minHeight: '100vh'
        }}
      >
        <div className="flex justify-center items-center h-64">
          <div 
            className="text-lg"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Carregando treino...
          </div>
        </div>
      </div>
    );
  }

  if (error && !workout) {
    return (
      <div 
        className="container mx-auto p-6"
        style={{
          backgroundColor: 'var(--background)',
          color: 'var(--foreground)',
          minHeight: '100vh'
        }}
      >
        <div className="flex justify-center items-center h-64">
          <div style={{ color: 'var(--destructive)' }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="container mx-auto p-6 max-w-2xl"
      style={{
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
        minHeight: '100vh'
      }}
    >
      <div className="mb-6">
        <Button 
          onClick={() => router.push(`/workouts/${workoutId}`)}
          variant="secondary"
          className="mb-4"
        >
          ← Voltar
        </Button>
        <h1 
          className="text-3xl font-bold"
          style={{ color: 'var(--foreground)' }}
        >
          Editar Treino
        </h1>
      </div>

      <Card 
        className="p-6"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)'
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div 
              className="px-4 py-3 rounded"
              style={{
                backgroundColor: 'var(--destructive)',
                color: 'var(--destructive-foreground)',
                border: '1px solid var(--destructive)'
              }}
            >
              {error}
            </div>
          )}

          {/* Nome do Treino */}
          <div>
            <label 
              htmlFor="name" 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--foreground)' }}
            >
              Nome do Treino *
            </label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ex: Treino A - Peito e Tríceps, Treino de Pernas..."
              required
            />
          </div>

          <div className="flex space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push(`/workouts/${workoutId}`)}
              disabled={saving}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              className="flex-1"
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}