-- Adicionar campos de status e timestamps na tabela sessions
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'paused')),
ADD COLUMN IF NOT EXISTS started_at timestamp,
ADD COLUMN IF NOT EXISTS ended_at timestamp;

-- Atualizar registros existentes para ter started_at baseado em date (que é o campo principal de timestamp)
UPDATE sessions 
SET started_at = date 
WHERE started_at IS NULL;

-- Atualizar registros existentes para ter status baseado no campo completed
UPDATE sessions 
SET status = CASE 
  WHEN completed = true THEN 'completed'
  ELSE 'active'
END
WHERE status = 'active';

-- Definir started_at como NOT NULL após popular os dados
ALTER TABLE sessions 
ALTER COLUMN started_at SET NOT NULL,
ALTER COLUMN started_at SET DEFAULT now();