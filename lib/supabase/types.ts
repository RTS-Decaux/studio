export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      User: {
        Row: {
          id: string;
          email: string;
          password: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          password?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          password?: string | null;
        };
        Relationships: [];
      };
      Chat: {
        Row: {
          id: string;
          createdAt: string;
          title: string;
          userId: string;
          visibility: "public" | "private";
          lastContext: Json | null;
        };
        Insert: {
          id?: string;
          createdAt: string;
          title: string;
          userId: string;
          visibility?: "public" | "private";
          lastContext?: Json | null;
        };
        Update: {
          id?: string;
          createdAt?: string;
          title?: string;
          userId?: string;
          visibility?: "public" | "private";
          lastContext?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "Chat_userId_fkey";
            columns: ["userId"];
            referencedRelation: "User";
            referencedColumns: ["id"];
          }
        ];
      };
      Message_v2: {
        Row: {
          id: string;
          chatId: string;
          role: string;
          parts: Json;
          attachments: Json;
          createdAt: string;
        };
        Insert: {
          id?: string;
          chatId: string;
          role: string;
          parts: Json;
          attachments: Json;
          createdAt: string;
        };
        Update: {
          id?: string;
          chatId?: string;
          role?: string;
          parts?: Json;
          attachments?: Json;
          createdAt?: string;
        };
        Relationships: [
          {
            foreignKeyName: "Message_v2_chatId_fkey";
            columns: ["chatId"];
            referencedRelation: "Chat";
            referencedColumns: ["id"];
          }
        ];
      };
      Vote_v2: {
        Row: {
          chatId: string;
          messageId: string;
          isUpvoted: boolean;
        };
        Insert: {
          chatId: string;
          messageId: string;
          isUpvoted: boolean;
        };
        Update: {
          chatId?: string;
          messageId?: string;
          isUpvoted?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "Vote_v2_chatId_fkey";
            columns: ["chatId"];
            referencedRelation: "Chat";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Vote_v2_messageId_fkey";
            columns: ["messageId"];
            referencedRelation: "Message_v2";
            referencedColumns: ["id"];
          }
        ];
      };
      Document: {
        Row: {
          id: string;
          createdAt: string;
          title: string;
          content: string | null;
          kind: "text" | "code" | "image" | "sheet";
          userId: string;
        };
        Insert: {
          id?: string;
          createdAt: string;
          title: string;
          content?: string | null;
          kind?: "text" | "code" | "image" | "sheet";
          userId: string;
        };
        Update: {
          id?: string;
          createdAt?: string;
          title?: string;
          content?: string | null;
          kind?: "text" | "code" | "image" | "sheet";
          userId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "Document_userId_fkey";
            columns: ["userId"];
            referencedRelation: "User";
            referencedColumns: ["id"];
          }
        ];
      };
      Suggestion: {
        Row: {
          id: string;
          documentId: string;
          documentCreatedAt: string;
          originalText: string;
          suggestedText: string;
          description: string | null;
          isResolved: boolean;
          userId: string;
          createdAt: string;
        };
        Insert: {
          id?: string;
          documentId: string;
          documentCreatedAt: string;
          originalText: string;
          suggestedText: string;
          description?: string | null;
          isResolved?: boolean;
          userId: string;
          createdAt: string;
        };
        Update: {
          id?: string;
          documentId?: string;
          documentCreatedAt?: string;
          originalText?: string;
          suggestedText?: string;
          description?: string | null;
          isResolved?: boolean;
          userId?: string;
          createdAt?: string;
        };
        Relationships: [
          {
            foreignKeyName: "Suggestion_document_ref_fkey";
            columns: ["documentId", "documentCreatedAt"];
            referencedRelation: "Document";
            referencedColumns: ["id", "createdAt"];
          },
          {
            foreignKeyName: "Suggestion_userId_fkey";
            columns: ["userId"];
            referencedRelation: "User";
            referencedColumns: ["id"];
          }
        ];
      };
      Stream: {
        Row: {
          id: string;
          chatId: string;
          createdAt: string;
        };
        Insert: {
          id?: string;
          chatId: string;
          createdAt: string;
        };
        Update: {
          id?: string;
          chatId?: string;
          createdAt?: string;
        };
        Relationships: [
          {
            foreignKeyName: "Stream_chatId_fkey";
            columns: ["chatId"];
            referencedRelation: "Chat";
            referencedColumns: ["id"];
          }
        ];
      };
      UserProfile: {
        Row: {
          id: string;
          userId: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          userId: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          userId?: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Relationships: [
          {
            foreignKeyName: "UserProfile_userId_fkey";
            columns: ["userId"];
            referencedRelation: "User";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {};
    Functions: {
      match_documents: {
        Args: {
          query_embedding: number[];
          match_threshold: number;
          match_count: number;
        };
        Returns: {
          id: string;
          title: string;
          content: string | null;
          similarity: number;
        }[];
      };
      paginate_chats: {
        Args: {
          user_id: string;
          limit_count: number;
          after?: string;
          before?: string;
        };
        Returns: {
          id: string;
          createdAt: string;
          title: string;
          visibility: "public" | "private";
          lastContext: Json | null;
        }[];
      };
      get_message_stats: {
        Args: {
          user_id: string;
          start_time: string;
        };
        Returns: number;
      };
    };
    Enums: {};
    CompositeTypes: {};
  };
}
