// src/integrations/supabase/types.ts
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      Interviews: {
        Row: {
          id: number;
          created_at: string;
          jobPosition: string | null;
          jobDescription: string | null;
          duration: string | null;
          type: string | null;
          questionList: Json | null;
          userEmail: string | null;
          interview_id: string | null;
        };
        Insert: {
          jobPosition: string;
          jobDescription: string;
          duration: string;
          type: string;
          questionList: Json;
          userEmail: string;
          interview_id: string;
        };
        Update: {
          jobPosition?: string;
          jobDescription?: string;
          duration?: string;
          type?: string;
          questionList?: Json;
          userEmail?: string;
          interview_id?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};