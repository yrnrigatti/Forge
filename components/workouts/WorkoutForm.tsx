import { useState } from 'react';
import { CreateWorkoutData, UpdateWorkoutData } from '@/types/workout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface WorkoutFormProps {
  initialData?: Partial<CreateWorkoutData | UpdateWorkoutData>;
  onSubmit: (data: CreateWorkoutData | UpdateWorkoutData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  isLoading?: boolean;
}

export function WorkoutForm({
  initialData = {},
  onSubmit,
  onCancel,
  submitLabel = 'Salvar Treino',
  isLoading = false
}: WorkoutFormProps) {
  const [formData, setFormData] = useState({
    name: initialData.name || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome do treino é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Nome deve ter no máximo 100 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        name: formData.name.trim()
      });
    } catch (error) {
      console.error('Erro ao salvar treino:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nome do treino */}
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
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Ex: Treino de Peito e Tríceps"
            className={errors.name ? 'border-red-500' : ''}
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-3">
          {onCancel && (
            <Button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg transition-colors"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)'
              }}
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              background: 'var(--primary)',
              color: 'var(--foreground)'
            }}
          >
            {isLoading ? 'Salvando...' : submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
}