-- Adicionar campos faltantes na tabela sessions
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS duration integer,
ADD COLUMN IF NOT EXISTS notes text;

-- Adicionar campos faltantes na tabela sets
ALTER TABLE sets 
ADD COLUMN IF NOT EXISTS rest_time integer,
ADD COLUMN IF NOT EXISTS completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS "order" integer DEFAULT 0;