export type AppRole = "admin" | "editor" | "journalist" | "contributor" | "commercial";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; display_name: string | null; avatar_url: string | null; role: AppRole; created_at: string; updated_at: string };
        Insert: { id: string; display_name?: string | null; avatar_url?: string | null; role?: AppRole; created_at?: string; updated_at?: string };
        Update: { display_name?: string | null; avatar_url?: string | null; role?: AppRole; updated_at?: string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: { current_app_role: { Args: Record<PropertyKey, never>; Returns: AppRole } };
    Enums: { app_role: AppRole };
    CompositeTypes: Record<string, never>;
  };
};
