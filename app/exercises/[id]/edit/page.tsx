'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Exercise, UpdateExerciseData, MUSCLE_GROUPS, EXERCISE_TYPES } from '@/types/exercise';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { ExerciseService } from '@/services/exerciseService';

export default function EditExercisePage() {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [formData, setFormData] = useState<UpdateExerciseData>({
    name: '',
    muscle_group: undefined,
    type: undefined,
    notes: undefined
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const exerciseId = params.id as string;

  useEffect(() => {
    if (user && exerciseId) {
      fetchExercise();
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
      
      setExercise(exercise);
      setFormData({
        name: exercise.name,
        muscle_group: exercise.muscle_group || undefined,
        type: exercise.type || undefined,
        notes: exercise.notes || undefined
      });
    } catch (error) {
      console.error('Erro ao buscar exercício:', error);
      setError('Exercício não encontrado');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      setError('Nome do exercício é obrigatório');
      return;
    }
  
    try {
      setSaving(true);
      setError(null);
  
      await ExerciseService.updateExercise(exerciseId, {
        name: formData.name.trim(),
        muscle_group: formData.muscle_group || null,
        type: formData.type || null,
        notes: formData.notes || null
      });
  
      router.push(`/exercises/${exerciseId}`);
    } catch (error) {
      console.error('Erro ao atualizar exercício:', error);
      setError('Erro ao atualizar exercício');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof UpdateExerciseData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
            Carregando exercício...
          </div>
        </div>
      </div>
    );
  }

  if (error && !exercise) {
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
          onClick={() => router.push(`/exercises/${exerciseId}`)}
          variant="secondary"
          className="mb-4"
        >
          ← Voltar
        </Button>
        <h1 
          className="text-3xl font-bold"
          style={{ color: 'var(--foreground)' }}
        >
          Editar Exercício
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

          {/* Nome do Exercício */}
          <div>
            <label 
              htmlFor="name" 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--foreground)' }}
            >
              Nome do Exercício *
            </label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ex: Supino reto, Agachamento..."
              required
            />
          </div>

          {/* Grupo Muscular */}
          <div>
            <label 
              htmlFor="muscle_group" 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--foreground)' }}
            >
              Grupo Muscular
            </label>
            // Para o select de muscle_group
            <select
              id="muscle_group"
              value={formData.muscle_group || ''}
              onChange={(e) => handleChange('muscle_group', e.target.value)}
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--input)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)'
              }}
            >
              <option value="">Selecione um grupo muscular</option>
              {MUSCLE_GROUPS.map((group) => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>

          {/* Tipo de Exercício */}
          <div>
            <label 
              htmlFor="type" 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--foreground)' }}
            >
              Tipo de Exercício
            </label>
            // Para o select de type
            <select
              id="type"
              value={formData.type || ''}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--input)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              }}
            >
              <option value="">Selecione um tipo</option>
              {EXERCISE_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Notas */}
          <div>
            <label 
              htmlFor="notes" 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--foreground)' }}
            >
              Notas/Observações
            </label>
            // Para o textarea de notes
            <textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Instruções, dicas, observações..."
              rows={4}
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--input)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              }}
            />
          </div>

          {/* Botões */}
          <div className="flex space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push(`/exercises/${exerciseId}`)}
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