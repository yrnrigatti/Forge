-- Permitir exercícios globais tornando user_id nullable
ALTER TABLE exercises ALTER COLUMN user_id DROP NOT NULL;

-- Adicionar coluna is_global para identificar exercícios globais
ALTER TABLE exercises ADD COLUMN is_global BOOLEAN DEFAULT FALSE;

-- Criar índice para otimizar consultas de exercícios globais
CREATE INDEX idx_exercises_is_global ON exercises(is_global);
CREATE INDEX idx_exercises_user_id_is_global ON exercises(user_id, is_global);

-- Atualizar exercícios existentes para não serem globais
UPDATE exercises SET is_global = FALSE WHERE is_global IS NULL;