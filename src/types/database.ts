export type AppRole = "admin" | "editor" | "journalist" | "contributor" | "commercial";
export type ArticleStatus = "draft" | "in_review" | "approved" | "scheduled" | "published" | "archived";
export type ArticleType = "news" | "feature" | "interview" | "guide" | "press_release";
export type ArticleDisclosure = "none" | "sponsored" | "affiliate";
export type PropertyType = "resort" | "hotel" | "guesthouse";
export type PropertyStatus = "draft" | "in_review" | "verified" | "published" | "archived";
export type PropertyMediaReviewStatus = "pending" | "approved" | "rejected";

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
          is_featured: boolean; hero_image_url: string | null; hero_image_alt: string | null;
          hero_image_credit: string | null; reading_time_minutes: number | null; search_vector: unknown;
        } & Timestamps;
        Insert: {
          id?: string; slug: string; title: string; excerpt?: string | null; body?: Json;
          status?: ArticleStatus; article_type?: ArticleType; disclosure?: ArticleDisclosure;
          author_id: string; category_id?: string | null; created_by: string; reviewed_by?: string | null;
          published_by?: string | null; seo_title?: string | null; seo_description?: string | null;
          canonical_url?: string | null; scheduled_at?: string | null; published_at?: string | null;
          is_featured?: boolean; hero_image_url?: string | null; hero_image_alt?: string | null;
          hero_image_credit?: string | null; reading_time_minutes?: number | null; created_at?: string; updated_at?: string;
        };
        Update: {
          slug?: string; title?: string; excerpt?: string | null; body?: Json;
          status?: ArticleStatus; article_type?: ArticleType; disclosure?: ArticleDisclosure;
          author_id?: string; category_id?: string | null; reviewed_by?: string | null;
          published_by?: string | null; seo_title?: string | null; seo_description?: string | null;
          canonical_url?: string | null; scheduled_at?: string | null; published_at?: string | null;
          is_featured?: boolean; hero_image_url?: string | null; hero_image_alt?: string | null;
          hero_image_credit?: string | null; reading_time_minutes?: number | null; updated_at?: string;
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
        Update: Record<string, never>;
        Relationships: EditorialRelationships;
      };
      article_status_events: {
        Row: { id: string; article_id: string; from_status: ArticleStatus; to_status: ArticleStatus; actor_id: string; note: string | null; created_at: string };
        Insert: { id?: string; article_id: string; from_status: ArticleStatus; to_status: ArticleStatus; actor_id: string; note?: string | null; created_at?: string };
        Update: Record<string, never>;
        Relationships: EditorialRelationships;
      };
      atolls: {
        Row: { id: string; name: string; slug: string; description: string | null; sort_order: number; is_active: boolean; source_name: string | null; source_url: string | null; source_checked_at: string | null } & Timestamps;
        Insert: { id?: string; name: string; slug: string; description?: string | null; sort_order?: number; is_active?: boolean; source_name?: string | null; source_url?: string | null; source_checked_at?: string | null; created_at?: string; updated_at?: string };
        Update: { name?: string; slug?: string; description?: string | null; sort_order?: number; is_active?: boolean; source_name?: string | null; source_url?: string | null; source_checked_at?: string | null; updated_at?: string };
        Relationships: EditorialRelationships;
      };
      islands: {
        Row: { id: string; atoll_id: string; name: string; slug: string; description: string | null; classification: string | null; sort_order: number; is_active: boolean; source_name: string | null; source_url: string | null; source_checked_at: string | null } & Timestamps;
        Insert: { id?: string; atoll_id: string; name: string; slug: string; description?: string | null; classification?: string | null; sort_order?: number; is_active?: boolean; source_name?: string | null; source_url?: string | null; source_checked_at?: string | null; created_at?: string; updated_at?: string };
        Update: { atoll_id?: string; name?: string; slug?: string; description?: string | null; classification?: string | null; sort_order?: number; is_active?: boolean; source_name?: string | null; source_url?: string | null; source_checked_at?: string | null; updated_at?: string };
        Relationships: EditorialRelationships;
      };
      properties: {
        Row: { id: string; name: string; slug: string; property_type: PropertyType; status: PropertyStatus; summary: string | null; description: string | null; atoll_id: string | null; island_id: string | null; address: string | null; latitude: number | null; longitude: number | null; official_website_url: string | null; booking_url: string | null; public_email: string | null; public_phone: string | null; is_featured: boolean; is_active: boolean; assigned_to: string | null; created_by: string; updated_by: string | null; verified_at: string | null; verified_by: string | null; verification_source_name: string | null; verification_source_url: string | null; published_at: string | null; published_by: string | null } & Timestamps;
        Insert: { id?: string; name: string; slug: string; property_type: PropertyType; status?: PropertyStatus; summary?: string | null; description?: string | null; atoll_id?: string | null; island_id?: string | null; address?: string | null; latitude?: number | null; longitude?: number | null; official_website_url?: string | null; booking_url?: string | null; public_email?: string | null; public_phone?: string | null; is_featured?: boolean; is_active?: boolean; assigned_to?: string | null; created_by: string; updated_by?: string | null; verified_at?: string | null; verified_by?: string | null; verification_source_name?: string | null; verification_source_url?: string | null; published_at?: string | null; published_by?: string | null; created_at?: string; updated_at?: string };
        Update: { name?: string; slug?: string; property_type?: PropertyType; status?: PropertyStatus; summary?: string | null; description?: string | null; atoll_id?: string | null; island_id?: string | null; address?: string | null; latitude?: number | null; longitude?: number | null; official_website_url?: string | null; booking_url?: string | null; public_email?: string | null; public_phone?: string | null; is_featured?: boolean; is_active?: boolean; assigned_to?: string | null; updated_by?: string | null; verified_at?: string | null; verified_by?: string | null; verification_source_name?: string | null; verification_source_url?: string | null; published_at?: string | null; published_by?: string | null; updated_at?: string };
        Relationships: EditorialRelationships;
      };
      facilities: {
        Row: { id: string; name: string; slug: string; description: string | null; sort_order: number; is_active: boolean } & Timestamps;
        Insert: { id?: string; name: string; slug: string; description?: string | null; sort_order?: number; is_active?: boolean; created_at?: string; updated_at?: string };
        Update: { name?: string; slug?: string; description?: string | null; sort_order?: number; is_active?: boolean; updated_at?: string };
        Relationships: EditorialRelationships;
      };
      property_facilities: {
        Row: { property_id: string; facility_id: string; is_verified: boolean; source_url: string | null; verified_at: string | null; verified_by: string | null; created_at: string };
        Insert: { property_id: string; facility_id: string; is_verified?: boolean; source_url?: string | null; verified_at?: string | null; verified_by?: string | null; created_at?: string };
        Update: { is_verified?: boolean; source_url?: string | null; verified_at?: string | null; verified_by?: string | null };
        Relationships: EditorialRelationships;
      };
      property_media: {
        Row: { id: string; property_id: string; storage_path: string | null; media_url: string | null; alt_text: string; credit: string | null; source_url: string | null; sort_order: number; focal_x: number; focal_y: number; review_status: PropertyMediaReviewStatus; reviewed_at: string | null; reviewed_by: string | null; created_by: string; created_at: string };
        Insert: { id?: string; property_id: string; storage_path?: string | null; media_url?: string | null; alt_text: string; credit?: string | null; source_url?: string | null; sort_order?: number; focal_x?: number; focal_y?: number; review_status?: PropertyMediaReviewStatus; reviewed_at?: string | null; reviewed_by?: string | null; created_by: string; created_at?: string };
        Update: { storage_path?: string | null; media_url?: string | null; alt_text?: string; credit?: string | null; source_url?: string | null; sort_order?: number; focal_x?: number; focal_y?: number; review_status?: PropertyMediaReviewStatus; reviewed_at?: string | null; reviewed_by?: string | null };
        Relationships: EditorialRelationships;
      };
      property_verification_events: {
        Row: { id: string; property_id: string; source_name: string; source_url: string; actor_id: string; note: string | null; created_at: string };
        Insert: { id?: string; property_id: string; source_name: string; source_url: string; actor_id: string; note?: string | null; created_at?: string };
        Update: Record<string, never>;
        Relationships: EditorialRelationships;
      };
      property_status_events: {
        Row: { id: string; property_id: string; from_status: PropertyStatus | null; to_status: PropertyStatus; actor_id: string; note: string | null; created_at: string };
        Insert: { id?: string; property_id: string; from_status?: PropertyStatus | null; to_status: PropertyStatus; actor_id: string; note?: string | null; created_at?: string };
        Update: Record<string, never>;
        Relationships: EditorialRelationships;
      };
    };
    Views: Record<string, never>;
    Functions: {
      transition_article: {
        Args: { p_actor_id: string; p_article_id: string; p_to_status: ArticleStatus; p_scheduled_at?: string | null; p_note?: string | null };
        Returns: ArticleStatus;
      };
      transition_property: {
        Args: { p_actor_id: string; p_property_id: string; p_to_status: PropertyStatus; p_source_name?: string | null; p_source_url?: string | null; p_note?: string | null };
        Returns: PropertyStatus;
      };
    };
    Enums: {
      app_role: AppRole;
      article_status: ArticleStatus;
      article_type: ArticleType;
      article_disclosure: ArticleDisclosure;
      property_type: PropertyType;
      property_status: PropertyStatus;
      property_media_review_status: PropertyMediaReviewStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
