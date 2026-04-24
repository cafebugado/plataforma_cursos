# EduPlatform — LMS

Plataforma de ensino a distância (LMS) moderna e completa, construída com React 19, TypeScript e Supabase. Administradores gerenciam cursos, módulos, vídeos e quizzes; alunos assistem aulas, acompanham progresso e geram resumos por IA.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Tech Stack](#tech-stack)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Rotas da Aplicação](#rotas-da-aplicação)
- [Pré-requisitos](#pré-requisitos)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Executando o Projeto](#executando-o-projeto)
- [Banco de Dados](#banco-de-dados)
- [Edge Functions](#edge-functions)
- [Deploy (Vercel)](#deploy-vercel)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Variáveis de Ambiente](#variáveis-de-ambiente)

---

## Visão Geral

A **EduPlatform** é um sistema LMS que conecta administradores/instrutores e alunos em um ambiente de aprendizado digital. Com integração ao YouTube para vídeos, Google Gemini para resumos por IA e Supabase como backend completo (banco de dados, autenticação, storage e funções serverless), a plataforma oferece uma experiência rica e escalável.

Acesso público começa pela **Landing Page** (`/`), que apresenta a plataforma e direciona o visitante para login ou cadastro conforme seu perfil. Usuários autenticados são redirecionados automaticamente para o painel correto com base no seu papel (admin ou aluno).

---

## Funcionalidades

### Landing Page (pública)
- Apresentação da plataforma com hero section, CTAs e stats
- Seção "Como funciona" com os 3 passos da jornada do aluno
- Seção "Para quem é" com cards de benefícios por perfil
- Modal de seleção de perfil para login/cadastro (Aluno ou Instrutor)
- Navbar responsiva com menu hamburguer no mobile
- Footer com links de navegação

### Aluno
- Cadastro, login e recuperação de senha
- Navegação e busca no catálogo de cursos publicados
- Matrícula em cursos
- Player de videoaulas com rastreamento de progresso por vídeo
- Geração de resumos por IA (Google Gemini) para cada vídeo
- Realização de quizzes com pontuação e múltiplas tentativas
- Visualização do progresso por curso e por módulo
- Gerenciamento de perfil e avatar

### Administrador
- Dashboard com estatísticas gerais (alunos, cursos, módulos, vídeos)
- Gerenciamento completo de cursos (criar, editar, publicar/despublicar)
- Upload de capa do curso via arquivo (drag & drop, JPG/PNG/WEBP/GIF, máx. 5 MB) ou URL externa
- Categorias múltiplas por curso — inseridas como tags separadas por vírgula, exibidas como badges individuais nos cards
- Slug do curso gerado automaticamente a partir do título (editável, com label flutuante correta)
- Gerenciamento de módulos com reordenação
- Adição e organização de vídeos do YouTube com reordenação
- Criação de playlists dentro de módulos
- Criação e edição de quizzes com questões, alternativas e pontuação de aprovação
- Visualização e gerenciamento de usuários
- Relatórios e analytics
- Gerenciamento de perfil de administrador

---

## Tech Stack

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Frontend | React + TypeScript | 19 / 6 |
| Build | Vite | 8 |
| UI | Material-UI (MUI) + Emotion | 9 |
| Tipografia | Inter (@fontsource) | 5 |
| Formulários | React Hook Form + Zod | 7 / 4 |
| Roteamento | React Router DOM | 7 |
| Estado servidor | TanStack React Query | 5 |
| Backend / DB | Supabase (PostgreSQL + Auth + Storage) | 2 |
| Funções serverless | Supabase Edge Functions (Deno) | — |
| IA | Google Gemini Pro API | — |
| Vídeos | YouTube (embed) | — |
| Datas | Day.js | 1 |
| Linting | ESLint 9 + typescript-eslint | 9 / 8 |
| Deploy | Vercel | — |

---

## Estrutura do Projeto

```
lms-platform/
├── src/
│   ├── app/
│   │   ├── providers/        # Providers React (Auth, Query, Theme, Router)
│   │   ├── router/           # Configuração de rotas com lazy loading
│   │   └── theme/            # Tema MUI personalizado (paleta, tipografia)
│   ├── components/
│   │   ├── common/           # Componentes reutilizáveis (StatCard, VideoCard, EmptyState, CategoryChips, ThumbnailUpload…)
│   │   └── layout/           # Shells de layout (AdminShell, StudentShell)
│   ├── features/
│   │   ├── admin/            # Painel administrativo (dashboard, CRUD completo)
│   │   ├── auth/             # Autenticação (login, cadastro, rotas protegidas)
│   │   ├── courses/          # Páginas de cursos para alunos
│   │   ├── modules/          # Módulos de curso
│   │   ├── playlists/        # Playlists de vídeos
│   │   ├── profile/          # Perfil do usuário
│   │   ├── progress/         # Rastreamento de progresso
│   │   ├── quiz/             # Interface de quizzes
│   │   ├── summaries/        # Resumos gerados por IA
│   │   └── videos/           # Gerenciamento de vídeos
│   ├── pages/
│   │   └── Home/             # Landing Page pública
│   │       ├── index.tsx     # Página principal com redirecionamento por role
│   │       ├── Navbar.tsx    # Navbar fixa com menu hamburguer
│   │       ├── Hero.tsx      # Seção hero com CTAs e ilustração
│   │       ├── HowItWorks.tsx# Seção "Como funciona"
│   │       ├── ForWho.tsx    # Cards de perfil (aluno/instrutor)
│   │       ├── Footer.tsx    # Rodapé
│   │       └── AuthModal.tsx # Modal de seleção de perfil
│   ├── services/
│   │   ├── supabase/         # auth, courses, modules, videos, profiles, quiz, progress
│   │   ├── gemini/           # Geração e recuperação de resumos por IA
│   │   └── youtube/          # Extração de ID, embed URL e thumbnail
│   ├── types/                # Interfaces TypeScript globais
│   └── utils/                # Funções utilitárias
├── supabase/
│   ├── migrations/           # Migrações SQL do banco de dados
│   └── functions/
│       └── generate-summary/ # Edge Function Deno para resumos por IA
├── .env.example              # Modelo de variáveis de ambiente
├── vercel.json               # Rewrite para SPA routing na Vercel
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Rotas da Aplicação

### Públicas
| Rota | Página |
|------|--------|
| `/` | Landing Page |
| `/auth/login` | Login |
| `/auth/register` | Cadastro |
| `/auth/forgot-password` | Recuperação de senha |

### Aluno (autenticado — role: `student`)
| Rota | Página |
|------|--------|
| `/app` | Dashboard do aluno |
| `/app/courses` | Catálogo de cursos |
| `/app/courses/:slug` | Detalhe do curso |
| `/app/learn/:courseId/:moduleId/:videoId` | Player de aula |
| `/app/progress` | Progresso geral |
| `/app/profile` | Perfil |

### Administrador (autenticado — role: `admin`)
| Rota | Página |
|------|--------|
| `/admin` | Dashboard administrativo |
| `/admin/courses` | Gerenciar cursos |
| `/admin/courses/new` | Criar curso |
| `/admin/courses/:id/edit` | Editar curso |
| `/admin/modules` | Gerenciar módulos |
| `/admin/videos` | Gerenciar vídeos |
| `/admin/quizzes` | Gerenciar quizzes |
| `/admin/playlists` | Gerenciar playlists |
| `/admin/users` | Gerenciar usuários |
| `/admin/reports` | Relatórios |
| `/admin/profile` | Perfil do administrador |

**Lógica de redirecionamento:**
- Usuário não autenticado em rota protegida → `/auth/login`
- Usuário `student` tentando acessar `/admin` → `/app`
- Usuário autenticado acessando `/` → `/app` (student) ou `/admin` (admin)

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- [npm](https://www.npmjs.com/) 9+ (ou pnpm)
- Conta no [Supabase](https://supabase.com/) (gratuita)
- Chave de API do [Google Gemini](https://aistudio.google.com/) (para resumos por IA)

---

## Configuração do Ambiente

### 1. Clone o repositório

```bash
git clone https://github.com/cafebugado/plataforma_cursos.git
cd lms-platform
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

> As credenciais estão disponíveis em **Project Settings → API** no painel do Supabase.

### 4. Configure o banco de dados

No painel do Supabase, acesse **SQL Editor** e execute:

```
supabase/migrations/001_schema_completo.sql
```

Esse script cria todas as tabelas, políticas RLS e buckets de storage necessários.

### 5. Configure a Edge Function (opcional — resumos por IA)

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

### Desenvolvimento

```bash
npm run dev
```

Acesse em `http://localhost:5173`.

### Build de produção

```bash
npm run build
```

Arquivos gerados na pasta `dist/`.

### Preview do build

```bash
npm run preview
```

---

## Banco de Dados

Gerenciado pelo Supabase (PostgreSQL). Principais tabelas:

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Perfis de usuário com papel (`admin` / `student`) |
| `courses` | Cursos com slug, nível, categoria e status de publicação |
| `modules` | Módulos com ordem e flag de quiz final |
| `playlists` | Agrupamentos de vídeos dentro de módulos |
| `videos` | Referências a vídeos do YouTube com status de resumo |
| `video_summaries` | Resumos gerados por IA (texto + bullets + modelo) |
| `enrollments` | Matrículas de alunos com status (ativo/concluído/cancelado) |
| `video_progress` | Progresso por vídeo (segundos assistidos, conclusão) |
| `module_quizzes` | Quizzes por módulo (pontuação de aprovação, tentativas máximas) |
| `quiz_questions` | Questões com explicação |
| `quiz_options` | Alternativas (com flag de resposta correta) |
| `quiz_attempts` | Tentativas com pontuação e resultado |
| `quiz_answers` | Respostas individuais por tentativa |

### Storage Buckets

| Bucket | Acesso | Limite | Tipos permitidos |
|--------|--------|--------|-----------------|
| `avatars` | Público (leitura) | — | Qualquer imagem |
| `course-assets` | Público (leitura) | 5 MB | JPG, PNG, WEBP, GIF |

Upload no bucket `course-assets` é restrito a administradores via RLS.

### Row Level Security (RLS)

- Alunos acessam apenas conteúdo publicado e cursos em que estão matriculados
- Administradores têm acesso total ao gerenciamento de conteúdo
- Cada usuário só modifica seus próprios dados (perfil, progresso, avatares)

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
{ "videoId": "uuid-do-video" }
```

**Resposta:**
```json
{
  "summary": "Resumo do conteúdo...",
  "bullets": ["Ponto 1", "Ponto 2", "Ponto 3"]
}
```

> A função possui cooldown de 60 segundos por vídeo/usuário para evitar abusos.

---

## Deploy (Vercel)

O projeto está configurado para deploy na Vercel. O arquivo `vercel.json` na raiz garante que todas as rotas sejam redirecionadas para o `index.html`, permitindo que o React Router gerencie a navegação no cliente:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

> Sem essa configuração, acessar `/admin` ou qualquer rota diretamente (ou ao dar F5) retornaria 404, pois a Vercel trataria a URL como um arquivo estático inexistente.

**Para fazer o deploy:**

1. Importe o repositório na [Vercel](https://vercel.com/)
2. Configure as variáveis de ambiente (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`) em **Settings → Environment Variables**
3. O build é detectado automaticamente (Vite)

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

> **Nunca** commite o arquivo `.env`. Ele já está no `.gitignore`.
