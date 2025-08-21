-- Adicionar soft delete para exercícios
ALTER TABLE exercises ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;

-- Criar índice para otimizar consultas de exercícios não deletados
CREATE INDEX idx_exercises_deleted_at ON exercises(deleted_at) WHERE deleted_at IS NULL;

-- Comentário: deleted_at NULL = ativo, deleted_at com timestamp = deletado