export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      activity_event: {
        Row: {
          action: string
          actor_member_id: string | null
          actor_operator_id: string | null
          entity_id: string | null
          entity_type: string
          id: string
          occurred_at: string
          payload: Json | null
          tenant_id: string
        }
        Insert: {
          action: string
          actor_member_id?: string | null
          actor_operator_id?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          occurred_at?: string
          payload?: Json | null
          tenant_id: string
        }
        Update: {
          action?: string
          actor_member_id?: string | null
          actor_operator_id?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          occurred_at?: string
          payload?: Json | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_event_actor_member_id_fkey"
            columns: ["actor_member_id"]
            isOneToOne: false
            referencedRelation: "member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_event_actor_operator_id_fkey"
            columns: ["actor_operator_id"]
            isOneToOne: false
            referencedRelation: "operator"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_event_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_rendition: {
        Row: {
          archived_at: string | null
          bucket: string
          byte_size: number
          content_type: string
          created_at: string
          created_by: string | null
          height_px: number | null
          id: string
          media_asset_id: string
          object_key: string
          provider: string
          tenant_id: string
          tier: Database["public"]["Enums"]["rendition_tier"]
          updated_at: string
          width_px: number | null
        }
        Insert: {
          archived_at?: string | null
          bucket: string
          byte_size: number
          content_type: string
          created_at?: string
          created_by?: string | null
          height_px?: number | null
          id?: string
          media_asset_id: string
          object_key: string
          provider: string
          tenant_id: string
          tier: Database["public"]["Enums"]["rendition_tier"]
          updated_at?: string
          width_px?: number | null
        }
        Update: {
          archived_at?: string | null
          bucket?: string
          byte_size?: number
          content_type?: string
          created_at?: string
          created_by?: string | null
          height_px?: number | null
          id?: string
          media_asset_id?: string
          object_key?: string
          provider?: string
          tenant_id?: string
          tier?: Database["public"]["Enums"]["rendition_tier"]
          updated_at?: string
          width_px?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_rendition_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_rendition_media_asset_id_tenant_id_fkey"
            columns: ["media_asset_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "media_asset"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "asset_rendition_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      brand: {
        Row: {
          archived_at: string | null
          created_at: string
          created_by: string | null
          current_profile_id: string | null
          id: string
          name_key_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          current_profile_id?: string | null
          id?: string
          name_key_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          current_profile_id?: string | null
          id?: string
          name_key_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_current_profile_fk"
            columns: ["current_profile_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "brand_profile"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "brand_name_key_id_tenant_id_fkey"
            columns: ["name_key_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "translation_key"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "brand_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_guideline: {
        Row: {
          archived_at: string | null
          body_key_id: string
          created_at: string
          created_by: string | null
          id: string
          ordinal: number
          profile_id: string
          tenant_id: string
          title_key_id: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          body_key_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          ordinal: number
          profile_id: string
          tenant_id: string
          title_key_id: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          body_key_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          ordinal?: number
          profile_id?: string
          tenant_id?: string
          title_key_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_guideline_body_key_id_tenant_id_fkey"
            columns: ["body_key_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "translation_key"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "brand_guideline_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_guideline_profile_id_tenant_id_fkey"
            columns: ["profile_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "brand_profile"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "brand_guideline_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_guideline_title_key_id_tenant_id_fkey"
            columns: ["title_key_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "translation_key"
            referencedColumns: ["id", "tenant_id"]
          },
        ]
      }
      brand_line: {
        Row: {
          archived_at: string | null
          brand_id: string
          created_at: string
          created_by: string | null
          id: string
          name_key_id: string
          profile_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          brand_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          name_key_id: string
          profile_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          brand_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name_key_id?: string
          profile_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_line_brand_id_tenant_id_fkey"
            columns: ["brand_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "brand"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "brand_line_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_line_name_key_id_tenant_id_fkey"
            columns: ["name_key_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "translation_key"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "brand_line_profile_id_tenant_id_fkey"
            columns: ["profile_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "brand_profile"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "brand_line_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_profile: {
        Row: {
          brand_id: string
          created_at: string
          created_by: string | null
          id: string
          supersedes_id: string | null
          tenant_id: string
          version: number
        }
        Insert: {
          brand_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          supersedes_id?: string | null
          tenant_id: string
          version: number
        }
        Update: {
          brand_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          supersedes_id?: string | null
          tenant_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "brand_profile_brand_id_tenant_id_fkey"
            columns: ["brand_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "brand"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "brand_profile_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_profile_supersedes_id_tenant_id_fkey"
            columns: ["supersedes_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "brand_profile"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "brand_profile_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_theme: {
        Row: {
          archived_at: string | null
          created_at: string
          created_by: string | null
          id: string
          is_default: boolean
          name_key_id: string
          profile_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_default?: boolean
          name_key_id: string
          profile_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_default?: boolean
          name_key_id?: string
          profile_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_theme_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_theme_name_key_id_tenant_id_fkey"
            columns: ["name_key_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "translation_key"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "brand_theme_profile_id_tenant_id_fkey"
            columns: ["profile_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "brand_profile"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "brand_theme_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      color_value: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["color_role"]
          srgb: string
          tenant_id: string
          theme_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["color_role"]
          srgb: string
          tenant_id: string
          theme_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["color_role"]
          srgb?: string
          tenant_id?: string
          theme_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "color_value_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "color_value_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "color_value_theme_id_tenant_id_fkey"
            columns: ["theme_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "brand_theme"
            referencedColumns: ["id", "tenant_id"]
          },
        ]
      }
      consent_grant: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string
          granted_by: string
          id: string
          revoked_at: string | null
          scope: Database["public"]["Enums"]["consent_scope"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at: string
          granted_by: string
          id?: string
          revoked_at?: string | null
          scope: Database["public"]["Enums"]["consent_scope"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string
          granted_by?: string
          id?: string
          revoked_at?: string | null
          scope?: Database["public"]["Enums"]["consent_scope"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consent_grant_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_grant_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_grant_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          archived_at: string | null
          created_at: string
          created_by: string | null
          email: string
          expires_at: string
          id: string
          role: Database["public"]["Enums"]["role"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          email: string
          expires_at: string
          id?: string
          role: Database["public"]["Enums"]["role"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          email?: string
          expires_at?: string
          id?: string
          role?: Database["public"]["Enums"]["role"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitation_accepted_by_fkey"
            columns: ["accepted_by"]
            isOneToOne: false
            referencedRelation: "member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitation_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitation_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      logo_variant: {
        Row: {
          archived_at: string | null
          created_at: string
          created_by: string | null
          ground: Database["public"]["Enums"]["logo_ground"]
          id: string
          kind: Database["public"]["Enums"]["logo_kind"]
          media_asset_id: string
          profile_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          ground: Database["public"]["Enums"]["logo_ground"]
          id?: string
          kind: Database["public"]["Enums"]["logo_kind"]
          media_asset_id: string
          profile_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          ground?: Database["public"]["Enums"]["logo_ground"]
          id?: string
          kind?: Database["public"]["Enums"]["logo_kind"]
          media_asset_id?: string
          profile_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "logo_variant_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "logo_variant_media_asset_id_tenant_id_fkey"
            columns: ["media_asset_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "media_asset"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "logo_variant_profile_id_tenant_id_fkey"
            columns: ["profile_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "brand_profile"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "logo_variant_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      media_asset: {
        Row: {
          archived_at: string | null
          bucket: string
          byte_size: number
          checksum: string
          content_type: string
          created_at: string
          created_by: string | null
          id: string
          object_key: string
          original_filename: string | null
          provider: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          bucket: string
          byte_size: number
          checksum: string
          content_type: string
          created_at?: string
          created_by?: string | null
          id?: string
          object_key: string
          original_filename?: string | null
          provider: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          bucket?: string
          byte_size?: number
          checksum?: string
          content_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          object_key?: string
          original_filename?: string | null
          provider?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_asset_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_asset_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      member: {
        Row: {
          archived_at: string | null
          created_at: string
          created_by: string | null
          display_name: string | null
          email: string
          id: string
          preferred_locale: string | null
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          display_name?: string | null
          email: string
          id: string
          preferred_locale?: string | null
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          display_name?: string | null
          email?: string
          id?: string
          preferred_locale?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "member"
            referencedColumns: ["id"]
          },
        ]
      }
      membership: {
        Row: {
          accepted_at: string | null
          archived_at: string | null
          created_at: string
          created_by: string | null
          id: string
          invited_by: string | null
          member_id: string
          role: Database["public"]["Enums"]["role"]
          status: Database["public"]["Enums"]["membership_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          invited_by?: string | null
          member_id: string
          role: Database["public"]["Enums"]["role"]
          status: Database["public"]["Enums"]["membership_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          invited_by?: string | null
          member_id?: string
          role?: Database["public"]["Enums"]["role"]
          status?: Database["public"]["Enums"]["membership_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "membership_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membership_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membership_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membership_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      operator: {
        Row: {
          granted_at: string
          granted_by: string | null
          id: string
          revoked_at: string | null
        }
        Insert: {
          granted_at: string
          granted_by?: string | null
          id: string
          revoked_at?: string | null
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          revoked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operator_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "operator"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant: {
        Row: {
          archived_at: string | null
          base_currency: string
          created_at: string
          created_by: string | null
          default_locale: string
          id: string
          name: string
          slug: string
          status: Database["public"]["Enums"]["tenant_status"]
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          base_currency: string
          created_at?: string
          created_by?: string | null
          default_locale: string
          id?: string
          name: string
          slug: string
          status: Database["public"]["Enums"]["tenant_status"]
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          base_currency?: string
          created_at?: string
          created_by?: string | null
          default_locale?: string
          id?: string
          name?: string
          slug?: string
          status?: Database["public"]["Enums"]["tenant_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "member"
            referencedColumns: ["id"]
          },
        ]
      }
      translation_entry: {
        Row: {
          archived_at: string | null
          created_at: string
          created_by: string | null
          id: string
          key_id: string
          locale: string
          tenant_id: string
          updated_at: string
          value: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          key_id: string
          locale: string
          tenant_id: string
          updated_at?: string
          value: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          key_id?: string
          locale?: string
          tenant_id?: string
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "translation_entry_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "translation_entry_key_id_tenant_id_fkey"
            columns: ["key_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "translation_key"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "translation_entry_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      translation_key: {
        Row: {
          archived_at: string | null
          created_at: string
          created_by: string | null
          id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "translation_key_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "translation_key_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      typeface: {
        Row: {
          archived_at: string | null
          created_at: string
          created_by: string | null
          family: string
          font_asset_id: string | null
          id: string
          is_italic: boolean
          profile_id: string
          role: Database["public"]["Enums"]["typeface_role"]
          script: Database["public"]["Enums"]["script_kind"]
          tenant_id: string
          updated_at: string
          weight: number
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          family: string
          font_asset_id?: string | null
          id?: string
          is_italic?: boolean
          profile_id: string
          role: Database["public"]["Enums"]["typeface_role"]
          script: Database["public"]["Enums"]["script_kind"]
          tenant_id: string
          updated_at?: string
          weight: number
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          family?: string
          font_asset_id?: string | null
          id?: string
          is_italic?: boolean
          profile_id?: string
          role?: Database["public"]["Enums"]["typeface_role"]
          script?: Database["public"]["Enums"]["script_kind"]
          tenant_id?: string
          updated_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "typeface_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "typeface_font_asset_id_tenant_id_fkey"
            columns: ["font_asset_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "media_asset"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "typeface_profile_id_tenant_id_fkey"
            columns: ["profile_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "brand_profile"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "typeface_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: { Args: { p_invitation_id: string }; Returns: string }
      caller_email_is_verified: { Args: never; Returns: boolean }
      current_tenant_id: { Args: never; Returns: string }
      has_live_consent_grant: {
        Args: { p_tenant_id: string }
        Returns: boolean
      }
      is_current_tenant_owner: { Args: never; Returns: boolean }
      is_operator: { Args: never; Returns: boolean }
      operator_read_activity_event: {
        Args: { p_tenant_id: string }
        Returns: {
          action: string
          actor_member_id: string
          actor_operator_id: string
          entity_id: string
          entity_type: string
          id: string
          occurred_at: string
          tenant_id: string
        }[]
      }
      provision_tenant: {
        Args: {
          p_base_currency: string
          p_default_locale: string
          p_name: string
          p_slug: string
        }
        Returns: string
      }
    }
    Enums: {
      color_role:
        | "primary"
        | "secondary"
        | "accent"
        | "background"
        | "foreground"
        | "muted"
        | "critical"
      consent_scope: "read_only"
      logo_ground: "light" | "dark"
      logo_kind: "full" | "mark" | "wordmark"
      membership_status: "invited" | "active" | "suspended"
      rendition_tier: "display" | "print"
      role: "owner" | "manager" | "designer" | "approver" | "viewer"
      script_kind: "latin" | "arabic"
      tenant_status: "active" | "suspended" | "closed"
      typeface_role: "heading" | "body"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      color_role: [
        "primary",
        "secondary",
        "accent",
        "background",
        "foreground",
        "muted",
        "critical",
      ],
      consent_scope: ["read_only"],
      logo_ground: ["light", "dark"],
      logo_kind: ["full", "mark", "wordmark"],
      membership_status: ["invited", "active", "suspended"],
      rendition_tier: ["display", "print"],
      role: ["owner", "manager", "designer", "approver", "viewer"],
      script_kind: ["latin", "arabic"],
      tenant_status: ["active", "suspended", "closed"],
      typeface_role: ["heading", "body"],
    },
  },
} as const
