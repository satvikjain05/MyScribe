export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      medical_reports: {
        Row: {
          id: string;
          created_at: string;
          image_url: string;
          analysis: string | null;
          status: string;
        };
        Insert: {
          image_url?: string;
          analysis?: string | null;
          status?: string;
        };
        Update: {
          image_url?: string;
          analysis?: string | null;
          status?: string;
        };
      };
    };
    Functions: Record<string, never>;
    Views: Record<string, never>;
    Enums: Record<string, never>;
  };
}
