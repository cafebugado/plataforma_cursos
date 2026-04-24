export type UserRole = 'admin' | 'student';

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  phone: string | null;
  bio: string | null;
  job_title: string | null;
  department: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  website_url: string | null;
  location: string | null;
  birth_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  thumbnail_url: string | null;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  modules?: Module[];
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order_index: number;
  is_published: boolean;
  has_final_quiz: boolean;
  created_at: string;
  updated_at: string;
  videos?: Video[];
}

export interface Playlist {
  id: string;
  course_id: string | null;
  module_id: string | null;
  title: string;
  description: string;
  order_index: number;
  created_at: string;
}

export type SummaryStatus = 'none' | 'generating' | 'ready' | 'error';

export interface Video {
  id: string;
  course_id: string;
  module_id: string;
  playlist_id: string | null;
  youtube_video_id: string;
  youtube_url: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  order_index: number;
  is_preview: boolean;
  summary_status: SummaryStatus;
  created_at: string;
  updated_at: string;
}

export interface VideoSummary {
  id: string;
  video_id: string;
  generated_by: string;
  summary_text: string;
  bullets: string[];
  model_name: string;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: 'active' | 'completed' | 'cancelled';
  enrolled_at: string;
  completed_at: string | null;
}

export interface VideoProgress {
  id: string;
  user_id: string;
  course_id: string;
  module_id: string;
  video_id: string;
  watched_seconds: number;
  is_completed: boolean;
  completed_at: string | null;
  last_position_seconds: number;
  updated_at: string;
}

export interface ModuleQuiz {
  id: string;
  module_id: string;
  title: string;
  description: string;
  passing_score: number;
  max_attempts: number;
  created_at: string;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  order_index: number;
  explanation: string | null;
  options?: QuizOption[];
}

export interface QuizOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  module_id: string;
  user_id: string;
  score: number;
  passed: boolean;
  attempt_number: number;
  created_at: string;
  answers?: QuizAnswer[];
}

export interface QuizAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  option_id: string;
  is_correct: boolean;
}

export interface AdminStats {
  total_students: number;
  total_courses: number;
  total_modules: number;
  total_videos: number;
  avg_completion_rate: number;
}
