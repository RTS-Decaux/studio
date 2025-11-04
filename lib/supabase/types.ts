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
    PostgrestVersion: "13.0.5"
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
      AuditLog: {
        Row: {
          action: string
          createdAt: string
          id: string
          ipAddress: unknown
          metadata: Json | null
          resource: string
          resourceId: string | null
          userAgent: string | null
          userId: string
        }
        Insert: {
          action: string
          createdAt?: string
          id?: string
          ipAddress?: unknown
          metadata?: Json | null
          resource: string
          resourceId?: string | null
          userAgent?: string | null
          userId: string
        }
        Update: {
          action?: string
          createdAt?: string
          id?: string
          ipAddress?: unknown
          metadata?: Json | null
          resource?: string
          resourceId?: string | null
          userAgent?: string | null
          userId?: string
        }
        Relationships: []
      }
      Chat: {
        Row: {
          createdAt: string
          id: string
          lastContext: Json | null
          title: string
          userId: string
          visibility: string
        }
        Insert: {
          createdAt: string
          id?: string
          lastContext?: Json | null
          title: string
          userId: string
          visibility?: string
        }
        Update: {
          createdAt?: string
          id?: string
          lastContext?: Json | null
          title?: string
          userId?: string
          visibility?: string
        }
        Relationships: []
      }
      Document: {
        Row: {
          content: string | null
          createdAt: string
          id: string
          kind: string
          title: string
          userId: string
        }
        Insert: {
          content?: string | null
          createdAt: string
          id?: string
          kind?: string
          title: string
          userId: string
        }
        Update: {
          content?: string | null
          createdAt?: string
          id?: string
          kind?: string
          title?: string
          userId?: string
        }
        Relationships: []
      }
      Message: {
        Row: {
          chatId: string
          content: Json
          createdAt: string
          id: string
          role: string
        }
        Insert: {
          chatId: string
          content: Json
          createdAt: string
          id?: string
          role: string
        }
        Update: {
          chatId?: string
          content?: Json
          createdAt?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "Message_chatId_fkey"
            columns: ["chatId"]
            isOneToOne: false
            referencedRelation: "Chat"
            referencedColumns: ["id"]
          },
        ]
      }
      Message_v2: {
        Row: {
          attachments: Json
          chatId: string
          createdAt: string
          id: string
          parts: Json
          role: string
        }
        Insert: {
          attachments: Json
          chatId: string
          createdAt: string
          id?: string
          parts: Json
          role: string
        }
        Update: {
          attachments?: Json
          chatId?: string
          createdAt?: string
          id?: string
          parts?: Json
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "Message_v2_chatId_fkey"
            columns: ["chatId"]
            isOneToOne: false
            referencedRelation: "Chat"
            referencedColumns: ["id"]
          },
        ]
      }
      RateLimit: {
        Row: {
          count: number
          key: string
          resetAt: string
        }
        Insert: {
          count?: number
          key: string
          resetAt: string
        }
        Update: {
          count?: number
          key?: string
          resetAt?: string
        }
        Relationships: []
      }
      Stream: {
        Row: {
          chatId: string
          createdAt: string
          id: string
        }
        Insert: {
          chatId: string
          createdAt: string
          id?: string
        }
        Update: {
          chatId?: string
          createdAt?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Stream_chatId_fkey"
            columns: ["chatId"]
            isOneToOne: false
            referencedRelation: "Chat"
            referencedColumns: ["id"]
          },
        ]
      }
      StudioAsset: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          name: string
          project_id: string | null
          source_generation_id: string | null
          source_type: string | null
          thumbnail_url: string | null
          type: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          name: string
          project_id?: string | null
          source_generation_id?: string | null
          source_type?: string | null
          thumbnail_url?: string | null
          type: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          name?: string
          project_id?: string | null
          source_generation_id?: string | null
          source_type?: string | null
          thumbnail_url?: string | null
          type?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_asset_source_generation"
            columns: ["source_generation_id"]
            isOneToOne: false
            referencedRelation: "StudioGeneration"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "StudioAsset_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "StudioProject"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "StudioAsset_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      StudioGeneration: {
        Row: {
          completed_at: string | null
          cost: number | null
          created_at: string
          error: string | null
          fal_request_id: string | null
          fal_response: Json | null
          first_frame_url: string | null
          generation_type: string
          id: string
          input_asset_id: string | null
          last_frame_url: string | null
          model_id: string
          negative_prompt: string | null
          output_asset_id: string | null
          parameters: Json
          processing_time: number | null
          project_id: string | null
          prompt: string | null
          reference_image_url: string | null
          reference_video_url: string | null
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          cost?: number | null
          created_at?: string
          error?: string | null
          fal_request_id?: string | null
          fal_response?: Json | null
          first_frame_url?: string | null
          generation_type: string
          id?: string
          input_asset_id?: string | null
          last_frame_url?: string | null
          model_id: string
          negative_prompt?: string | null
          output_asset_id?: string | null
          parameters?: Json
          processing_time?: number | null
          project_id?: string | null
          prompt?: string | null
          reference_image_url?: string | null
          reference_video_url?: string | null
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          cost?: number | null
          created_at?: string
          error?: string | null
          fal_request_id?: string | null
          fal_response?: Json | null
          first_frame_url?: string | null
          generation_type?: string
          id?: string
          input_asset_id?: string | null
          last_frame_url?: string | null
          model_id?: string
          negative_prompt?: string | null
          output_asset_id?: string | null
          parameters?: Json
          processing_time?: number | null
          project_id?: string | null
          prompt?: string | null
          reference_image_url?: string | null
          reference_video_url?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "StudioGeneration_input_asset_id_fkey"
            columns: ["input_asset_id"]
            isOneToOne: false
            referencedRelation: "StudioAsset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "StudioGeneration_output_asset_id_fkey"
            columns: ["output_asset_id"]
            isOneToOne: false
            referencedRelation: "StudioAsset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "StudioGeneration_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "StudioProject"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "StudioGeneration_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      StudioProject: {
        Row: {
          created_at: string
          description: string | null
          id: string
          settings: Json | null
          thumbnail: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          settings?: Json | null
          thumbnail?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          settings?: Json | null
          thumbnail?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "StudioProject_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      StudioTemplate: {
        Row: {
          config: Json
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          model_id: string | null
          name: string
          thumbnail: string | null
          type: string
          usage_count: number | null
          user_id: string | null
        }
        Insert: {
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          model_id?: string | null
          name: string
          thumbnail?: string | null
          type: string
          usage_count?: number | null
          user_id?: string | null
        }
        Update: {
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          model_id?: string | null
          name?: string
          thumbnail?: string | null
          type?: string
          usage_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "StudioTemplate_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Suggestion: {
        Row: {
          createdAt: string
          description: string | null
          documentCreatedAt: string
          documentId: string
          id: string
          isResolved: boolean
          originalText: string
          suggestedText: string
          userId: string
        }
        Insert: {
          createdAt: string
          description?: string | null
          documentCreatedAt: string
          documentId: string
          id?: string
          isResolved?: boolean
          originalText: string
          suggestedText: string
          userId: string
        }
        Update: {
          createdAt?: string
          description?: string | null
          documentCreatedAt?: string
          documentId?: string
          id?: string
          isResolved?: boolean
          originalText?: string
          suggestedText?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Suggestion_document_ref_fkey"
            columns: ["documentId", "documentCreatedAt"]
            isOneToOne: false
            referencedRelation: "Document"
            referencedColumns: ["id", "createdAt"]
          },
        ]
      }
      Vote: {
        Row: {
          chatId: string
          isUpvoted: boolean
          messageId: string
        }
        Insert: {
          chatId: string
          isUpvoted: boolean
          messageId: string
        }
        Update: {
          chatId?: string
          isUpvoted?: boolean
          messageId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Vote_chatId_fkey"
            columns: ["chatId"]
            isOneToOne: false
            referencedRelation: "Chat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Vote_messageId_fkey"
            columns: ["messageId"]
            isOneToOne: false
            referencedRelation: "Message"
            referencedColumns: ["id"]
          },
        ]
      }
      Vote_v2: {
        Row: {
          chatId: string
          isUpvoted: boolean
          messageId: string
        }
        Insert: {
          chatId: string
          isUpvoted: boolean
          messageId: string
        }
        Update: {
          chatId?: string
          isUpvoted?: boolean
          messageId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Vote_v2_chatId_fkey"
            columns: ["chatId"]
            isOneToOne: false
            referencedRelation: "Chat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Vote_v2_messageId_fkey"
            columns: ["messageId"]
            isOneToOne: false
            referencedRelation: "Message_v2"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      User: {
        Row: {
          email: string | null
          id: string | null
          password: string | null
        }
        Insert: {
          email?: string | null
          id?: string | null
          password?: never
        }
        Update: {
          email?: string | null
          id?: string | null
          password?: never
        }
        Relationships: []
      }
    }
    Functions: {
      check_rate_limit: {
        Args: {
          p_key: string
          p_max_requests: number
          p_window_seconds: number
        }
        Returns: boolean
      }
      get_message_stats: {
        Args: { start_time: string; user_id: string }
        Returns: number
      }
      log_audit_event: {
        Args: {
          p_action: string
          p_metadata?: Json
          p_resource: string
          p_resource_id?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
    Enums: {},
  },
} as const
