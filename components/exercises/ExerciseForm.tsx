import { useState } from 'react';
import { CreateExerciseData, UpdateExerciseData, MUSCLE_GROUPS, EXERCISE_TYPES } from '@/types/exercise';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface ExerciseFormProps {
  initialData?: Partial<CreateExerciseData | UpdateExerciseData>;
  onSubmit: (data: CreateExerciseData | UpdateExerciseData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  isLoading?: boolean;
}

export function ExerciseForm({ 
  initialData = {}, 
  onSubmit, 
  onCancel, 
  submitLabel = 'Salvar',
  isLoading = false 
}: ExerciseFormProps) {
  const [formData, setFormData] = useState<CreateExerciseData>({
    name: initialData.name || '',
    muscle_group: initialData.muscle_group || '',
    type: initialData.type || '',
    notes: initialData.notes || ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Nome do exercício é obrigatório');
      return;
    }

    try {
      setError(null);
      await onSubmit({
        name: formData.name.trim(),
        muscle_group: formData.muscle_group || undefined,
        type: formData.type || undefined,
        notes: formData.notes || undefined
      });
    } catch (error) {
      console.error('Erro no formulário:', error);
      setError('Erro ao salvar exercício. Tente novamente.');
    }
  };

  const handleChange = (field: keyof CreateExerciseData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Nome do Exercício *
          </label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Ex: Supino reto, Agachamento..."
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="muscle_group" className="block text-sm font-medium text-gray-700 mb-2">
            Grupo Muscular
          </label>
          <select
            id="muscle_group"
            value={formData.muscle_group}
            onChange={(e) => handleChange('muscle_group', e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">Selecione um grupo muscular</option>
            {MUSCLE_GROUPS.map((group) => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Exercício
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">Selecione um tipo</option>
            {EXERCISE_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notas/Observações
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Instruções, dicas, observações..."
            rows={4}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div className="flex space-x-4">
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            className={`${onCancel ? 'flex-1' : 'w-full'} bg-blue-600 hover:bg-blue-700`}
          >
            {isLoading ? 'Salvando...' : submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
}