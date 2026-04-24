-- =====================================================
-- SCHEMA COMPLETO — LMS PLATFORM
-- Gerado a partir de: 001_initial_schema.sql
--                     002_rls_policies.sql
--                     003_profile_extended_fields.sql
-- =====================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =====================
-- PROFILES
-- =====================
create table public.profiles (
  id            uuid primary key references auth.users on delete cascade,
  full_name     text not null default '',
  avatar_url    text,
  role          text not null default 'student' check (role in ('admin', 'student')),
  phone         text,
  bio           text,
  job_title     text,
  department    text,
  linkedin_url  text,
  github_url    text,
  website_url   text,
  location      text,
  birth_date    date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================
-- COURSES
-- =====================
create table public.courses (
  id                uuid primary key default uuid_generate_v4(),
  title             text not null,
  slug              text not null unique,
  short_description text not null default '',
  description       text not null default '',
  thumbnail_url     text,
  level             text not null default 'beginner' check (level in ('beginner', 'intermediate', 'advanced')),
  category          text not null default '',
  is_published      boolean not null default false,
  created_by        uuid references public.profiles(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- =====================
-- MODULES
-- =====================
create table public.modules (
  id             uuid primary key default uuid_generate_v4(),
  course_id      uuid not null references public.courses(id) on delete cascade,
  title          text not null,
  description    text not null default '',
  order_index    int not null default 1,
  is_published   boolean not null default true,
  has_final_quiz boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- =====================
-- PLAYLISTS
-- =====================
create table public.playlists (
  id          uuid primary key default uuid_generate_v4(),
  course_id   uuid references public.courses(id) on delete cascade,
  module_id   uuid references public.modules(id) on delete cascade,
  title       text not null,
  description text not null default '',
  order_index int not null default 1,
  created_at  timestamptz not null default now()
);

-- =====================
-- VIDEOS
-- =====================
create table public.videos (
  id               uuid primary key default uuid_generate_v4(),
  course_id        uuid not null references public.courses(id) on delete cascade,
  module_id        uuid not null references public.modules(id) on delete cascade,
  playlist_id      uuid references public.playlists(id) on delete set null,
  youtube_video_id text not null,
  youtube_url      text not null,
  title            text not null,
  description      text not null default '',
  thumbnail_url    text,
  duration_seconds int,
  order_index      int not null default 1,
  is_preview       boolean not null default false,
  summary_status   text not null default 'none' check (summary_status in ('none', 'generating', 'ready', 'error')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- =====================
-- VIDEO SUMMARIES
-- =====================
create table public.video_summaries (
  id           uuid primary key default uuid_generate_v4(),
  video_id     uuid not null references public.videos(id) on delete cascade,
  generated_by uuid references public.profiles(id) on delete set null,
  summary_text text not null default '',
  bullets      jsonb not null default '[]',
  model_name   text not null default 'gemini-pro',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- =====================
-- ENROLLMENTS
-- =====================
create table public.enrollments (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  course_id    uuid not null references public.courses(id) on delete cascade,
  status       text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  enrolled_at  timestamptz not null default now(),
  completed_at timestamptz,
  unique(user_id, course_id)
);

-- =====================
-- VIDEO PROGRESS
-- =====================
create table public.video_progress (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references public.profiles(id) on delete cascade,
  course_id             uuid not null references public.courses(id) on delete cascade,
  module_id             uuid not null references public.modules(id) on delete cascade,
  video_id              uuid not null references public.videos(id) on delete cascade,
  watched_seconds       int not null default 0,
  is_completed          boolean not null default false,
  completed_at          timestamptz,
  last_position_seconds int not null default 0,
  updated_at            timestamptz not null default now(),
  unique(user_id, video_id)
);

-- =====================
-- MODULE QUIZZES
-- =====================
create table public.module_quizzes (
  id            uuid primary key default uuid_generate_v4(),
  module_id     uuid not null references public.modules(id) on delete cascade unique,
  title         text not null,
  description   text not null default '',
  passing_score int not null default 70,
  max_attempts  int not null default 3,
  created_at    timestamptz not null default now()
);

-- =====================
-- QUIZ QUESTIONS
-- =====================
create table public.quiz_questions (
  id            uuid primary key default uuid_generate_v4(),
  quiz_id       uuid not null references public.module_quizzes(id) on delete cascade,
  question_text text not null,
  order_index   int not null default 1,
  explanation   text
);

-- =====================
-- QUIZ OPTIONS
-- =====================
create table public.quiz_options (
  id          uuid primary key default uuid_generate_v4(),
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  option_text text not null,
  is_correct  boolean not null default false
);

-- =====================
-- QUIZ ATTEMPTS
-- =====================
create table public.quiz_attempts (
  id             uuid primary key default uuid_generate_v4(),
  quiz_id        uuid not null references public.module_quizzes(id) on delete cascade,
  module_id      uuid not null references public.modules(id) on delete cascade,
  user_id        uuid not null references public.profiles(id) on delete cascade,
  score          int not null default 0,
  passed         boolean not null default false,
  attempt_number int not null default 1,
  created_at     timestamptz not null default now()
);

-- =====================
-- QUIZ ANSWERS
-- =====================
create table public.quiz_answers (
  id          uuid primary key default uuid_generate_v4(),
  attempt_id  uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  option_id   uuid not null references public.quiz_options(id) on delete cascade,
  is_correct  boolean not null default false
);

-- =====================
-- INDEXES
-- =====================
create index idx_modules_course_id        on public.modules(course_id);
create index idx_videos_module_id         on public.videos(module_id);
create index idx_videos_course_id         on public.videos(course_id);
create index idx_enrollments_user_id      on public.enrollments(user_id);
create index idx_video_progress_user_id   on public.video_progress(user_id);
create index idx_video_progress_video_id  on public.video_progress(video_id);
create index idx_quiz_attempts_user_quiz  on public.quiz_attempts(user_id, quiz_id);

-- =====================
-- STORAGE: AVATARS BUCKET
-- =====================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================

alter table public.profiles        enable row level security;
alter table public.courses         enable row level security;
alter table public.modules         enable row level security;
alter table public.playlists       enable row level security;
alter table public.videos          enable row level security;
alter table public.video_summaries enable row level security;
alter table public.enrollments     enable row level security;
alter table public.video_progress  enable row level security;
alter table public.module_quizzes  enable row level security;
alter table public.quiz_questions  enable row level security;
alter table public.quiz_options    enable row level security;
alter table public.quiz_attempts   enable row level security;
alter table public.quiz_answers    enable row level security;

-- Helper: check if current user is admin
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- =====================
-- RLS: PROFILES
-- =====================
create policy "profiles_select_own"   on public.profiles for select using (auth.uid() = id);
create policy "profiles_select_admin" on public.profiles for select using (public.is_admin());
create policy "profiles_update_own"   on public.profiles for update using (auth.uid() = id);
create policy "profiles_update_admin" on public.profiles for update using (public.is_admin());

-- =====================
-- RLS: COURSES
-- =====================
create policy "courses_select_published" on public.courses for select using (is_published = true);
create policy "courses_select_admin"     on public.courses for select using (public.is_admin());
create policy "courses_insert_admin"     on public.courses for insert with check (public.is_admin());
create policy "courses_update_admin"     on public.courses for update using (public.is_admin());
create policy "courses_delete_admin"     on public.courses for delete using (public.is_admin());

-- =====================
-- RLS: MODULES
-- =====================
create policy "modules_select_enrolled" on public.modules
  for select using (
    is_published = true and exists (
      select 1 from public.enrollments
      where user_id = auth.uid() and course_id = modules.course_id and status = 'active'
    )
  );
create policy "modules_select_admin" on public.modules for select using (public.is_admin());
create policy "modules_write_admin"  on public.modules for all    using (public.is_admin());

-- =====================
-- RLS: VIDEOS
-- =====================
create policy "videos_select_enrolled" on public.videos
  for select using (
    exists (
      select 1 from public.enrollments
      where user_id = auth.uid() and course_id = videos.course_id and status = 'active'
    )
  );
create policy "videos_select_preview" on public.videos for select using (is_preview = true);
create policy "videos_select_admin"   on public.videos for select using (public.is_admin());
create policy "videos_write_admin"    on public.videos for all    using (public.is_admin());

-- =====================
-- RLS: PLAYLISTS
-- =====================
create policy "playlists_select_all"  on public.playlists for select using (true);
create policy "playlists_write_admin" on public.playlists for all    using (public.is_admin());

-- =====================
-- RLS: VIDEO SUMMARIES
-- =====================
create policy "summaries_select_enrolled" on public.video_summaries
  for select using (
    exists (
      select 1 from public.videos v
      join public.enrollments e on e.course_id = v.course_id
      where v.id = video_summaries.video_id and e.user_id = auth.uid() and e.status = 'active'
    )
  );
create policy "summaries_select_admin"    on public.video_summaries for select using (public.is_admin());
create policy "summaries_insert_enrolled" on public.video_summaries for insert with check (auth.uid() = generated_by);

-- =====================
-- RLS: ENROLLMENTS
-- =====================
create policy "enrollments_select_own"   on public.enrollments for select using (user_id = auth.uid());
create policy "enrollments_select_admin" on public.enrollments for select using (public.is_admin());
create policy "enrollments_insert_own"   on public.enrollments for insert with check (user_id = auth.uid());
create policy "enrollments_update_admin" on public.enrollments for update using (public.is_admin());

-- =====================
-- RLS: VIDEO PROGRESS
-- =====================
create policy "progress_select_own"   on public.video_progress for select using (user_id = auth.uid());
create policy "progress_select_admin" on public.video_progress for select using (public.is_admin());
create policy "progress_upsert_own"   on public.video_progress for insert with check (user_id = auth.uid());
create policy "progress_update_own"   on public.video_progress for update using (user_id = auth.uid());

-- =====================
-- RLS: QUIZZES
-- =====================
create policy "quizzes_select_enrolled" on public.module_quizzes
  for select using (
    exists (
      select 1 from public.modules m
      join public.enrollments e on e.course_id = m.course_id
      where m.id = module_quizzes.module_id and e.user_id = auth.uid() and e.status = 'active'
    )
  );
create policy "quizzes_select_admin" on public.module_quizzes for select using (public.is_admin());
create policy "quizzes_write_admin"  on public.module_quizzes for all    using (public.is_admin());

create policy "questions_select_enrolled" on public.quiz_questions
  for select using (
    exists (
      select 1 from public.module_quizzes mq
      join public.modules m on m.id = mq.module_id
      join public.enrollments e on e.course_id = m.course_id
      where mq.id = quiz_questions.quiz_id and e.user_id = auth.uid() and e.status = 'active'
    )
  );
create policy "questions_admin" on public.quiz_questions for all using (public.is_admin());

create policy "options_select_enrolled" on public.quiz_options
  for select using (
    exists (
      select 1 from public.quiz_questions qq
      join public.module_quizzes mq on mq.id = qq.quiz_id
      join public.modules m on m.id = mq.module_id
      join public.enrollments e on e.course_id = m.course_id
      where qq.id = quiz_options.question_id and e.user_id = auth.uid() and e.status = 'active'
    )
  );
create policy "options_admin" on public.quiz_options for all using (public.is_admin());

create policy "attempts_own"   on public.quiz_attempts for all    using (user_id = auth.uid());
create policy "attempts_admin" on public.quiz_attempts for select using (public.is_admin());

create policy "answers_own" on public.quiz_answers
  for all using (
    exists (
      select 1 from public.quiz_attempts a
      where a.id = quiz_answers.attempt_id and a.user_id = auth.uid()
    )
  );

-- =====================
-- RLS: STORAGE — AVATARS
-- =====================
create policy "avatars_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_update_own" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_select_public" on storage.objects
  for select to public
  using (bucket_id = 'avatars');

create policy "avatars_delete_own" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
