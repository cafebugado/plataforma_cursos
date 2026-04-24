export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          avatar_url: string | null;
          role: 'admin' | 'student';
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
        };
        Insert: {
          id: string;
          full_name: string;
          avatar_url?: string | null;
          role?: 'admin' | 'student';
          phone?: string | null;
          bio?: string | null;
          job_title?: string | null;
          department?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
          website_url?: string | null;
          location?: string | null;
          birth_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string;
          avatar_url?: string | null;
          role?: 'admin' | 'student';
          phone?: string | null;
          bio?: string | null;
          job_title?: string | null;
          department?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
          website_url?: string | null;
          location?: string | null;
          birth_date?: string | null;
          updated_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          slug: string;
          short_description: string;
          description: string;
          thumbnail_url: string | null;
          level: string;
          category: string;
          is_published: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          short_description: string;
          description: string;
          thumbnail_url?: string | null;
          level: string;
          category: string;
          is_published?: boolean;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          slug?: string;
          short_description?: string;
          description?: string;
          thumbnail_url?: string | null;
          level?: string;
          category?: string;
          is_published?: boolean;
          updated_at?: string;
        };
      };
      modules: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string;
          order_index: number;
          is_published: boolean;
          has_final_quiz: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description: string;
          order_index: number;
          is_published?: boolean;
          has_final_quiz?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          order_index?: number;
          is_published?: boolean;
          has_final_quiz?: boolean;
          updated_at?: string;
        };
      };
      playlists: {
        Row: {
          id: string;
          course_id: string | null;
          module_id: string | null;
          title: string;
          description: string;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id?: string | null;
          module_id?: string | null;
          title: string;
          description: string;
          order_index: number;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          order_index?: number;
        };
      };
      videos: {
        Row: {
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
          summary_status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          module_id: string;
          playlist_id?: string | null;
          youtube_video_id: string;
          youtube_url: string;
          title: string;
          description: string;
          thumbnail_url?: string | null;
          duration_seconds?: number | null;
          order_index: number;
          is_preview?: boolean;
          summary_status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          playlist_id?: string | null;
          title?: string;
          description?: string;
          thumbnail_url?: string | null;
          duration_seconds?: number | null;
          order_index?: number;
          is_preview?: boolean;
          summary_status?: string;
          updated_at?: string;
        };
      };
      video_summaries: {
        Row: {
          id: string;
          video_id: string;
          generated_by: string;
          summary_text: string;
          bullets: Json;
          model_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          video_id: string;
          generated_by: string;
          summary_text: string;
          bullets: Json;
          model_name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          summary_text?: string;
          bullets?: Json;
          updated_at?: string;
        };
      };
      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          status: string;
          enrolled_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          status?: string;
          enrolled_at?: string;
          completed_at?: string | null;
        };
        Update: {
          status?: string;
          completed_at?: string | null;
        };
      };
      video_progress: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          module_id: string;
          video_id: string;
          watched_seconds?: number;
          is_completed?: boolean;
          completed_at?: string | null;
          last_position_seconds?: number;
          updated_at?: string;
        };
        Update: {
          watched_seconds?: number;
          is_completed?: boolean;
          completed_at?: string | null;
          last_position_seconds?: number;
          updated_at?: string;
        };
      };
      module_quizzes: {
        Row: {
          id: string;
          module_id: string;
          title: string;
          description: string;
          passing_score: number;
          max_attempts: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          module_id: string;
          title: string;
          description: string;
          passing_score: number;
          max_attempts: number;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          passing_score?: number;
          max_attempts?: number;
        };
      };
      quiz_questions: {
        Row: {
          id: string;
          quiz_id: string;
          question_text: string;
          order_index: number;
          explanation: string | null;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          question_text: string;
          order_index: number;
          explanation?: string | null;
        };
        Update: {
          question_text?: string;
          order_index?: number;
          explanation?: string | null;
        };
      };
      quiz_options: {
        Row: {
          id: string;
          question_id: string;
          option_text: string;
          is_correct: boolean;
        };
        Insert: {
          id?: string;
          question_id: string;
          option_text: string;
          is_correct: boolean;
        };
        Update: {
          option_text?: string;
          is_correct?: boolean;
        };
      };
      quiz_attempts: {
        Row: {
          id: string;
          quiz_id: string;
          module_id: string;
          user_id: string;
          score: number;
          passed: boolean;
          attempt_number: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          module_id: string;
          user_id: string;
          score: number;
          passed: boolean;
          attempt_number: number;
          created_at?: string;
        };
        Update: Record<string, never>;
      };
      quiz_answers: {
        Row: {
          id: string;
          attempt_id: string;
          question_id: string;
          option_id: string;
          is_correct: boolean;
        };
        Insert: {
          id?: string;
          attempt_id: string;
          question_id: string;
          option_id: string;
          is_correct: boolean;
        };
        Update: Record<string, never>;
      };
    };
  };
}
