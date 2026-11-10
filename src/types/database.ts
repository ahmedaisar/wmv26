export type AppRole = "admin" | "editor" | "journalist" | "contributor" | "commercial";
export type ArticleStatus = "draft" | "in_review" | "approved" | "scheduled" | "published" | "archived";
export type ArticleType = "news" | "feature" | "interview" | "guide" | "press_release";
export type ArticleDisclosure = "none" | "sponsored" | "affiliate";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Timestamps = { created_at: string; updated_at: string };
type EditorialRelationships = [];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; display_name: string | null; avatar_url: string | null; role: AppRole; created_at: string; updated_at: string };
        Insert: { id: string; display_name?: string | null; avatar_url?: string | null; role?: AppRole; created_at?: string; updated_at?: string };
        Update: { display_name?: string | null; avatar_url?: string | null; role?: AppRole; updated_at?: string };
        Relationships: [];
      };
      authors: {
        Row: { id: string; profile_id: string | null; slug: string; display_name: string; bio: string | null; avatar_url: string | null; is_active: boolean } & Timestamps;
        Insert: { id?: string; profile_id?: string | null; slug: string; display_name: string; bio?: string | null; avatar_url?: string | null; is_active?: boolean; created_at?: string; updated_at?: string };
        Update: { profile_id?: string | null; slug?: string; display_name?: string; bio?: string | null; avatar_url?: string | null; is_active?: boolean; updated_at?: string };
        Relationships: EditorialRelationships;
      };
      categories: {
        Row: { id: string; slug: string; name: string; description: string | null; sort_order: number; is_active: boolean } & Timestamps;
        Insert: { id?: string; slug: string; name: string; description?: string | null; sort_order?: number; is_active?: boolean; created_at?: string; updated_at?: string };
        Update: { slug?: string; name?: string; description?: string | null; sort_order?: number; is_active?: boolean; updated_at?: string };
        Relationships: EditorialRelationships;
      };
      tags: {
        Row: { id: string; slug: string; name: string; description: string | null; is_active: boolean } & Timestamps;
        Insert: { id?: string; slug: string; name: string; description?: string | null; is_active?: boolean; created_at?: string; updated_at?: string };
        Update: { slug?: string; name?: string; description?: string | null; is_active?: boolean; updated_at?: string };
        Relationships: EditorialRelationships;
      };
      articles: {
        Row: {
          id: string; slug: string; title: string; excerpt: string | null; body: Json;
          status: ArticleStatus; article_type: ArticleType; disclosure: ArticleDisclosure;
          author_id: string; category_id: string | null; created_by: string; reviewed_by: string | null;
          published_by: string | null; seo_title: string | null; seo_description: string | null;
          canonical_url: string | null; scheduled_at: string | null; published_at: string | null;
          is_featured: boolean; search_vector: unknown;
        } & Timestamps;
        Insert: {
          id?: string; slug: string; title: string; excerpt?: string | null; body?: Json;
          status?: ArticleStatus; article_type?: ArticleType; disclosure?: ArticleDisclosure;
          author_id: string; category_id?: string | null; created_by: string; reviewed_by?: string | null;
          published_by?: string | null; seo_title?: string | null; seo_description?: string | null;
          canonical_url?: string | null; scheduled_at?: string | null; published_at?: string | null;
          is_featured?: boolean; created_at?: string; updated_at?: string;
        };
        Update: {
          slug?: string; title?: string; excerpt?: string | null; body?: Json;
          status?: ArticleStatus; article_type?: ArticleType; disclosure?: ArticleDisclosure;
          author_id?: string; category_id?: string | null; reviewed_by?: string | null;
          published_by?: string | null; seo_title?: string | null; seo_description?: string | null;
          canonical_url?: string | null; scheduled_at?: string | null; published_at?: string | null;
          is_featured?: boolean; updated_at?: string;
        };
        Relationships: EditorialRelationships;
      };
      article_tags: {
        Row: { article_id: string; tag_id: string; created_at: string };
        Insert: { article_id: string; tag_id: string; created_at?: string };
        Update: Record<string, never>;
        Relationships: EditorialRelationships;
      };
      article_revisions: {
        Row: { id: string; article_id: string; revision_number: number; snapshot: Json; change_summary: string | null; created_by: string; created_at: string };
        Insert: { id?: string; article_id: string; revision_number: number; snapshot: Json; change_summary?: string | null; created_by: string; created_at?: string };
        Update: {};
        Relationships: EditorialRelationships;
      };
    };
    Views: Record<string, never>;
    Functions: { current_app_role: { Args: Record<PropertyKey, never>; Returns: AppRole } };
    Enums: {
      app_role: AppRole;
      article_status: ArticleStatus;
      article_type: ArticleType;
      article_disclosure: ArticleDisclosure;
    };
    CompositeTypes: Record<string, never>;
  };
};
