# Forge 🏋️‍♂️

## Descrição
Forge é um app de registro de treinos.  
Stack: **Next.js + TypeScript + Supabase (Postgres + Auth + Storage)**.  

## Estrutura
- `src/app` → rotas (Next.js App Router)  
- `src/components` → componentes reutilizáveis  
- `src/lib/supabase.ts` → client Supabase  
- `supabase/schema.sql` → schema inicial do banco  

## Setup
```bash
git clone <repo>
cd forge
npm install
cp .env.local.example .env.local
npm run dev

Funcionalidades (MVP)
Autenticação (Supabase Auth)
CRUD de exercícios
CRUD de treinos
Registro de sessões com sets
Histórico simples

## 🎨 Paleta de Cores

| Uso                  | Cor       | Hex       |
| -------------------- | --------- | --------- |
| Fundo principal      | Preto     | #121212   |
| Seções/Card          | Cinza Escuro | #1F1F1F |
| Bordas/Separadores   | Cinza Médio | #2C2C2C |
| Texto principal      | Branco Claro | #E5E5E5 |
| Texto secundário     | Cinza Claro | #A3A3A3 |
| Detalhes (botões, highlights) | Laranja Fogo | #FF6B35 |
| Alertas/Destaques    | Vermelho Fogo | #FF3D00 |

---

## 🖌 Tipografia

- **Títulos**: Roboto, bold, cores em branco (#E5E5E5)
- **Textos**: Roboto, regular, cores em cinza claro (#A3A3A3)
- **Botões/Highlights**: Roboto, medium, cores laranja/vermelho (#FF6B35 / #FF3D00)

---

## 🧱 Componentes UI

| Componente          | Estilo sugerido |
| ------------------ | --------------- |
| **Botões primários** | Fundo laranja (#FF6B35), texto branco, borda arredondada |
| **Botões secundários** | Fundo cinza (#1F1F1F), texto laranja (#FF6B35), borda 1px laranja |
| **Cards de treino** | Fundo cinza escuro (#1F1F1F), borda cinza médio (#2C2C2C), sombra leve |
| **Alertas/Notificações** | Fundo vermelho (#FF3D00), texto branco (#E5E5E5) |
| **Links e highlights** | Laranja (#FF6B35), underline opcional |

---

## 📐 Layout / Espaçamento

- **Padding principal**: 16px
- **Margin entre seções**: 24px
- **Border radius**: 8px em cards e botões
- **Altura de linha de texto**: 1.5

---

## 🔧 Recomendações de Design

1. Sempre usar fundo escuro (#121212) como base.
2. Usar tons de cinza (#1F1F1F e #2C2C2C) para cards e separações, mantendo contraste com o texto.
3. Botões e elementos importantes sempre com laranja/vermelho (#FF6B35 / #FF3D00) para destacar ações.
4. Textos e informações secundárias em cinza claro (#A3A3A3) para hierarquia visual.
5. Manter consistência de bordas arredondadas e espaçamentos padronizados.

---

## 🚀 Objetivo do Projeto

O Forge é uma referência de UI escura e elegante, inspirada no fogo da forja, que serve como padrão visual para desenvolvimento de futuras telas, componentes e interações do app.