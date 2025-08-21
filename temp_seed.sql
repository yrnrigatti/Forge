-- Inserir exercícios globais
INSERT INTO exercises (name, muscle_group, type, notes, is_global, user_id, created_at, updated_at) VALUES
-- PEITO
('Supino Reto', 'Peito', 'Composto', 'Exercício fundamental para desenvolvimento do peitoral maior', true, null, now(), now()),
('Supino Inclinado', 'Peito', 'Composto', 'Foca na porção superior do peitoral', true, null, now(), now()),
('Supino Declinado', 'Peito', 'Composto', 'Enfatiza a porção inferior do peitoral', true, null, now(), now()),
('Flexão de Braço', 'Peito', 'Composto', 'Exercício funcional usando peso corporal', true, null, now(), now()),
('Crucifixo', 'Peito', 'Isolamento', 'Isolamento do peitoral com amplitude completa', true, null, now(), now()),
('Peck Deck', 'Peito', 'Isolamento', 'Exercício na máquina para isolamento do peito', true, null, now(), now()),

-- COSTAS
('Puxada Frontal', 'Costas', 'Composto', 'Exercício fundamental para largura das costas', true, null, now(), now()),
('Remada Curvada', 'Costas', 'Composto', 'Desenvolve espessura e força das costas', true, null, now(), now()),
('Remada Sentada', 'Costas', 'Composto', 'Exercício na máquina para desenvolvimento das costas', true, null, now(), now()),
('Pullover', 'Costas', 'Isolamento', 'Trabalha serrátil e latíssimo do dorso', true, null, now(), now()),
('Barra Fixa', 'Costas', 'Composto', 'Exercício funcional para largura das costas', true, null, now(), now()),
('Remada Unilateral', 'Costas', 'Composto', 'Trabalha cada lado independentemente', true, null, now(), now()),

-- OMBROS
('Desenvolvimento Militar', 'Ombros', 'Composto', 'Exercício fundamental para ombros', true, null, now(), now()),
('Elevação Lateral', 'Ombros', 'Isolamento', 'Isola o deltoide médio', true, null, now(), now()),
('Elevação Frontal', 'Ombros', 'Isolamento', 'Trabalha o deltoide anterior', true, null, now(), now()),
('Elevação Posterior', 'Ombros', 'Isolamento', 'Fortalece o deltoide posterior', true, null, now(), now()),
('Desenvolvimento com Halteres', 'Ombros', 'Composto', 'Maior amplitude de movimento que a barra', true, null, now(), now()),
('Encolhimento', 'Ombros', 'Isolamento', 'Trabalha o trapézio superior', true, null, now(), now()),

-- BRAÇOS
('Rosca Direta', 'Braços', 'Isolamento', 'Exercício básico para bíceps', true, null, now(), now()),
('Rosca Martelo', 'Braços', 'Isolamento', 'Trabalha bíceps e braquial', true, null, now(), now()),
('Tríceps Testa', 'Braços', 'Isolamento', 'Isolamento do tríceps', true, null, now(), now()),
('Tríceps Pulley', 'Braços', 'Isolamento', 'Exercício na polia para tríceps', true, null, now(), now()),
('Rosca Concentrada', 'Braços', 'Isolamento', 'Isolamento máximo do bíceps', true, null, now(), now()),
('Mergulho', 'Braços', 'Composto', 'Exercício funcional para tríceps', true, null, now(), now()),

-- PERNAS
('Agachamento', 'Pernas', 'Composto', 'Rei dos exercícios para pernas', true, null, now(), now()),
('Leg Press', 'Pernas', 'Composto', 'Exercício na máquina para quadríceps', true, null, now(), now()),
('Extensão de Pernas', 'Pernas', 'Isolamento', 'Isola o quadríceps', true, null, now(), now()),
('Flexão de Pernas', 'Pernas', 'Isolamento', 'Trabalha os isquiotibiais', true, null, now(), now()),
('Elevação de Panturrilha', 'Pernas', 'Isolamento', 'Desenvolve as panturrilhas', true, null, now(), now()),
('Afundo', 'Pernas', 'Composto', 'Exercício unilateral para pernas', true, null, now(), now()),
('Stiff', 'Pernas', 'Composto', 'Trabalha posterior da coxa e glúteos', true, null, now(), now()),

-- CORE/ABS
('Abdominal Tradicional', 'Core', 'Isolamento', 'Exercício básico para abdômen', true, null, now(), now()),
('Prancha', 'Core', 'Isométrico', 'Fortalece todo o core', true, null, now(), now()),
('Elevação de Pernas', 'Core', 'Isolamento', 'Trabalha abdômen inferior', true, null, now(), now()),
('Russian Twist', 'Core', 'Isolamento', 'Trabalha oblíquos', true, null, now(), now()),
('Mountain Climber', 'Core', 'Cardio', 'Exercício funcional para core', true, null, now(), now()),
('Dead Bug', 'Core', 'Funcional', 'Estabilização do core', true, null, now(), now());