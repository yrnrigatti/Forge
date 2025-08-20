'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CreateExerciseData, MUSCLE_GROUPS, EXERCISE_TYPES } from '@/types/exercise';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

export default function NewExercisePage() {
  const [formData, setFormData] = useState<CreateExerciseData>({
    name: '',
    muscle_group: '',
    type: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Nome do exercício é obrigatório');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('exercises')
        .insert({
          user_id: user?.id,
          name: formData.name.trim(),
          muscle_group: formData.muscle_group || null,
          type: formData.type || null,
          notes: formData.notes || null
        });

      if (error) throw error;

      router.push('/exercises');
    } catch (error) {
      console.error('Erro ao criar exercício:', error);
      setError('Erro ao criar exercício. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateExerciseData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
          onClick={() => router.back()}
          variant="secondary"
          className="mb-4"
        >
          ← Voltar
        </Button>
        <h1 
          className="text-3xl font-bold"
          style={{
            color: 'var(--foreground)'
          }}
        >
          Novo Exercício
        </h1>
      </div>

      <Card 
        className="p-6"
        style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          color: 'var(--foreground)'
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div 
              className="px-4 py-3 rounded"
              style={{
                backgroundColor: 'rgba(255, 61, 0, 0.1)',
                border: '1px solid var(--destructive)',
                color: 'var(--destructive)'
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
              style={{
                color: 'var(--foreground)'
              }}
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
              style={{
                color: 'var(--foreground)'
              }}
            >
              Grupo Muscular
            </label>
            <select
              id="muscle_group"
              value={formData.muscle_group}
              onChange={(e) => handleChange('muscle_group', e.target.value)}
              className="w-full px-3 py-2 rounded-md transition-colors"
              style={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary)';
                e.target.style.boxShadow = '0 0 0 2px rgba(255, 107, 53, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.boxShadow = 'none';
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
              style={{
                color: 'var(--foreground)'
              }}
            >
              Tipo de Exercício
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full px-3 py-2 rounded-md transition-colors"
              style={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary)';
                e.target.style.boxShadow = '0 0 0 2px rgba(255, 107, 53, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.boxShadow = 'none';
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
              style={{
                color: 'var(--foreground)'
              }}
            >
              Notas/Observações
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Instruções, dicas, observações..."
              rows={4}
              className="w-full px-3 py-2 rounded-md transition-colors resize-none"
              style={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary)';
                e.target.style.boxShadow = '0 0 0 2px rgba(255, 107, 53, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Botões */}
          <div className="flex space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Criando...' : 'Criar Exercício'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}