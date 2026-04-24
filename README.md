# Plataforma de Cursos

Uma plataforma de ensino a distância (LMS) moderna e completa, construída com React, TypeScript e Supabase. Permite que administradores gerenciem cursos, módulos, vídeos e quizzes, enquanto alunos acompanham seu progresso, assistem aulas e geram resumos por IA.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Tech Stack](#tech-stack)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Executando o Projeto](#executando-o-projeto)
- [Banco de Dados](#banco-de-dados)
- [Edge Functions](#edge-functions)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Variáveis de Ambiente](#variáveis-de-ambiente)

---

## Visão Geral

A **Plataforma de Cursos** é um sistema LMS (Learning Management System) que conecta administradores e alunos em um ambiente de aprendizado digital. Com integração ao YouTube para vídeos, Google Gemini para resumos por IA e Supabase como backend completo (banco de dados, autenticação e funções serverless), a plataforma oferece uma experiência rica e escalável.

---

## Funcionalidades

### Aluno
- Cadastro, login e recuperação de senha
- Navegação e busca no catálogo de cursos publicados
- Matrícula em cursos
- Player de videoaulas com rastreamento de progresso
- Geração de resumos por IA (Google Gemini) para cada vídeo
- Realização de quizzes com pontuação e múltiplas tentativas
- Visualização do progresso por curso e módulo
- Gerenciamento de perfil e avatar

### Administrador
- Dashboard com estatísticas gerais (alunos, cursos, módulos, vídeos)
- Gerenciamento completo de cursos (criar, editar, publicar/despublicar)
- Gerenciamento de módulos e playlists
- Adição e organização de vídeos do YouTube
- Criação e edição de quizzes com questões e alternativas
- Visualização de alunos matriculados
- Relatórios e analytics
- Gerenciamento de perfil de administrador

---

## Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + TypeScript |
| Build | Vite 8 |
| UI | Material-UI (MUI) 9 + Emotion |
| Formulários | React Hook Form 7 + Zod 4 |
| Roteamento | React Router DOM 7 |
| Estado servidor | TanStack React Query 5 |
| Backend / DB | Supabase (PostgreSQL + Auth + Storage) |
| Funções serverless | Supabase Edge Functions (Deno) |
| IA | Google Gemini Pro API |
| Vídeos | YouTube (embed) |
| Datas | Day.js |
| Linting | ESLint 9 + typescript-eslint |

---

## Estrutura do Projeto

```
lms-platform/
├── src/
│   ├── app/
│   │   ├── providers/        # Providers React (Auth, Query, Theme, Router)
│   │   ├── router/           # Configuração de rotas
│   │   └── theme/            # Tema personalizado MUI
│   ├── components/
│   │   ├── common/           # Componentes reutilizáveis (cards, headers)
│   │   ├── data-display/     # Componentes de exibição de dados
│   │   ├── feedback/         # Componentes de feedback (alertas, loaders)
│   │   ├── forms/            # Componentes de formulário
│   │   └── layout/           # Shells de layout (Admin, Aluno)
│   ├── features/
│   │   ├── admin/            # Páginas do painel administrativo
│   │   ├── auth/             # Autenticação (login, cadastro, rotas protegidas)
│   │   ├── courses/          # Páginas de cursos para alunos
│   │   ├── modules/          # Gerenciamento de módulos
│   │   ├── playlists/        # Gerenciamento de playlists
│   │   ├── profile/          # Perfil do usuário
│   │   ├── progress/         # Rastreamento de progresso
│   │   └── quiz/             # Interface de quizzes
│   ├── services/
│   │   ├── supabase/         # Camada de serviço (auth, cursos, vídeos, quiz…)
│   │   ├── gemini/           # Integração com Google Gemini API
│   │   └── youtube/          # Utilitários do YouTube
│   ├── types/                # Tipos TypeScript globais
│   └── utils/                # Funções utilitárias
├── supabase/
│   ├── migrations/           # Migrações do banco de dados
│   └── functions/
│       └── generate-summary/ # Edge Function Deno para resumos por IA
├── .env.example              # Modelo de variáveis de ambiente
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- [npm](https://www.npmjs.com/) 9+ (ou pnpm/yarn)
- Conta no [Supabase](https://supabase.com/) (gratuita)
- Chave de API do [Google Gemini](https://aistudio.google.com/) (para resumos por IA)

---

## Configuração do Ambiente

### 1. Clone o repositório

```bash
git clone https://github.com/cafebugado/plataforma_cursos.git
cd plataforma_cursos
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo de exemplo e preencha com suas credenciais:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

> As credenciais do Supabase estão disponíveis em **Project Settings → API** no painel do Supabase.

### 4. Configure o banco de dados

No painel do Supabase, acesse **SQL Editor** e execute o conteúdo do arquivo:

```
supabase/migrations/001_schema_completo.sql
```

Esse script cria todas as tabelas, políticas RLS e buckets de storage necessários.

### 5. Configure a Edge Function (opcional — para resumos por IA)

```bash
# Instale o CLI do Supabase
npm install -g supabase

# Faça login
supabase login

# Vincule ao seu projeto
supabase link --project-ref SEU_PROJECT_REF

# Defina o secret da API do Gemini
supabase secrets set GEMINI_API_KEY=sua-chave-gemini

# Faça o deploy da função
supabase functions deploy generate-summary
```

---

## Executando o Projeto

### Modo desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

### Build de produção

```bash
npm run build
```

Os arquivos de saída serão gerados na pasta `dist/`.

### Preview do build

```bash
npm run preview
```

---

## Banco de Dados

O banco de dados é gerenciado pelo Supabase (PostgreSQL). As principais tabelas são:

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Perfis de usuário com papel (admin/aluno) |
| `courses` | Metadados dos cursos |
| `modules` | Módulos organizados por ordem |
| `playlists` | Agrupamentos de vídeos dentro de módulos |
| `videos` | Referências a vídeos do YouTube |
| `video_summaries` | Resumos gerados por IA (Gemini) |
| `enrollments` | Matrículas de alunos em cursos |
| `video_progress` | Progresso de vídeos por aluno |
| `module_quizzes` | Quizzes por módulo |
| `quiz_questions` | Questões dos quizzes |
| `quiz_options` | Alternativas das questões |
| `quiz_attempts` | Tentativas de quiz com pontuação |
| `quiz_answers` | Respostas individuais de cada tentativa |

### Row Level Security (RLS)

Todas as tabelas possuem políticas RLS configuradas:

- Alunos acessam apenas conteúdo publicado e de cursos em que estão matriculados
- Administradores têm acesso total ao gerenciamento de conteúdo
- Usuários só modificam seus próprios dados

---

## Edge Functions

### `generate-summary`

Gera resumos automáticos de vídeos usando a API do Google Gemini.

**Endpoint:** `POST /functions/v1/generate-summary`

**Cabeçalhos:**
```
Authorization: Bearer <token-do-usuario>
Content-Type: application/json
```

**Body:**
```json
{
  "videoId": "uuid-do-video"
}
```

**Resposta:**
```json
{
  "summary": "Resumo do conteúdo...",
  "bullets": ["Ponto 1", "Ponto 2", "Ponto 3"]
}
```

> A função possui cooldown de 60 segundos por vídeo por usuário para evitar abusos.

---

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm run preview` | Visualiza o build de produção localmente |
| `npm run lint` | Executa o linter (ESLint) |

---

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|----------|:-----------:|-----------|
| `VITE_SUPABASE_URL` | Sim | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Sim | Chave anônima do Supabase (acesso público) |

> **Nunca** commite o arquivo `.env` no repositório. Ele já está no `.gitignore`.
