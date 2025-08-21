-- Seed com exercícios globais mais comuns
-- Estes exercícios estarão disponíveis para todos os usuários

INSERT INTO exercises (name, muscle_group, type, notes, is_global, user_id, created_at) VALUES
-- PEITO
('Supino Reto', 'Peito', 'Composto', 'Exercício fundamental para desenvolvimento do peitoral maior', true, null, now()),
('Supino Inclinado', 'Peito', 'Composto', 'Foca na porção superior do peitoral', true, null, now()),
('Supino Declinado', 'Peito', 'Composto', 'Enfatiza a porção inferior do peitoral', true, null, now()),
('Flexão de Braço', 'Peito', 'Composto', 'Exercício funcional usando peso corporal', true, null, now()),
('Crucifixo', 'Peito', 'Isolamento', 'Isolamento do peitoral com amplitude completa', true, null, now()),
('Peck Deck', 'Peito', 'Isolamento', 'Exercício na máquina para isolamento do peito', true, null, now()),

-- COSTAS
('Puxada Frontal', 'Costas', 'Composto', 'Exercício fundamental para largura das costas', true, null, now()),
('Remada Curvada', 'Costas', 'Composto', 'Desenvolve espessura e força das costas', true, null, now()),
('Remada Sentada', 'Costas', 'Composto', 'Exercício na máquina para desenvolvimento das costas', true, null, now()),
('Pullover', 'Costas', 'Isolamento', 'Trabalha serrátil e latíssimo do dorso', true, null, now()),
('Barra Fixa', 'Costas', 'Composto', 'Exercício funcional para largura das costas', true, null, now()),
('Remada Unilateral', 'Costas', 'Composto', 'Trabalha cada lado independentemente', true, null, now()),

-- OMBROS
('Desenvolvimento Militar', 'Ombros', 'Composto', 'Exercício fundamental para ombros', true, null, now()),
('Elevação Lateral', 'Ombros', 'Isolamento', 'Isola o deltoide médio', true, null, now()),
('Elevação Frontal', 'Ombros', 'Isolamento', 'Trabalha o deltoide anterior', true, null, now()),
('Elevação Posterior', 'Ombros', 'Isolamento', 'Fortalece o deltoide posterior', true, null, now()),
('Desenvolvimento com Halteres', 'Ombros', 'Composto', 'Maior amplitude de movimento que a barra', true, null, now()),
('Encolhimento', 'Ombros', 'Isolamento', 'Trabalha o trapézio superior', true, null, now()),

-- BRAÇOS
('Rosca Direta', 'Braços', 'Isolamento', 'Exercício básico para bíceps', true, null, now()),
('Rosca Martelo', 'Braços', 'Isolamento', 'Trabalha bíceps e braquial', true, null, now()),
('Tríceps Testa', 'Braços', 'Isolamento', 'Isolamento do tríceps', true, null, now()),
('Tríceps Pulley', 'Braços', 'Isolamento', 'Exercício na polia para tríceps', true, null, now()),
('Rosca Concentrada', 'Braços', 'Isolamento', 'Isolamento máximo do bíceps', true, null, now()),
('Mergulho', 'Braços', 'Composto', 'Exercício funcional para tríceps', true, null, now()),

-- PERNAS
('Agachamento', 'Pernas', 'Composto', 'Rei dos exercícios para pernas', true, null, now()),
('Leg Press', 'Pernas', 'Composto', 'Exercício na máquina para quadríceps', true, null, now()),
('Extensão de Pernas', 'Pernas', 'Isolamento', 'Isola o quadríceps', true, null, now()),
('Flexão de Pernas', 'Pernas', 'Isolamento', 'Trabalha os isquiotibiais', true, null, now()),
('Elevação de Panturrilha', 'Pernas', 'Isolamento', 'Desenvolve as panturrilhas', true, null, now()),
('Afundo', 'Pernas', 'Composto', 'Exercício unilateral para pernas', true, null, now()),
('Stiff', 'Pernas', 'Composto', 'Trabalha posterior da coxa e glúteos', true, null, now()),

-- CORE/ABS
('Abdominal Tradicional', 'Core', 'Isolamento', 'Exercício básico para abdômen', true, null, now()),
('Prancha', 'Core', 'Isométrico', 'Fortalece todo o core', true, null, now()),
('Elevação de Pernas', 'Core', 'Isolamento', 'Trabalha abdômen inferior', true, null, now()),
('Russian Twist', 'Core', 'Isolamento', 'Trabalha oblíquos', true, null, now()),
('Mountain Climber', 'Core', 'Cardio', 'Exercício funcional para core', true, null, now()),
('Dead Bug', 'Core', 'Funcional', 'Estabilização do core', true, null, now());