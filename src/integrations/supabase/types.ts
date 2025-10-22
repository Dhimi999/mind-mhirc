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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          conversation_type: string
          created_at: string
          full_summary: string | null
          id: string
          last_full_summary_message_count: number | null
          last_message_at: string | null
          messages_count: number
          summary: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          conversation_type?: string
          created_at?: string
          full_summary?: string | null
          id?: string
          last_full_summary_message_count?: number | null
          last_message_at?: string | null
          messages_count?: number
          summary?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          conversation_type?: string
          created_at?: string
          full_summary?: string | null
          id?: string
          last_full_summary_message_count?: number | null
          last_message_at?: string | null
          messages_count?: number
          summary?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          flag_urgent: boolean
          id: string
          sender: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          flag_urgent?: boolean
          id?: string
          sender: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          flag_urgent?: boolean
          id?: string
          sender?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      bfi_results: {
        Row: {
          anonymous_age: string | null
          anonymous_email: string | null
          anonymous_name: string | null
          answers: Json
          created_at: string | null
          for_other: boolean | null
          id: string
          other_person_name: string | null
          other_person_relationship: string | null
          result_summary: string | null
          test_id: string
          test_title: string
          user_id: string | null
        }
        Insert: {
          anonymous_age?: string | null
          anonymous_email?: string | null
          anonymous_name?: string | null
          answers: Json
          created_at?: string | null
          for_other?: boolean | null
          id?: string
          other_person_name?: string | null
          other_person_relationship?: string | null
          result_summary?: string | null
          test_id: string
          test_title: string
          user_id?: string | null
        }
        Update: {
          anonymous_age?: string | null
          anonymous_email?: string | null
          anonymous_name?: string | null
          answers?: Json
          created_at?: string | null
          for_other?: boolean | null
          id?: string
          other_person_name?: string | null
          other_person_relationship?: string | null
          result_summary?: string | null
          test_id?: string
          test_title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_avatar: string
          author_name: string
          category: string
          comments: Json | null
          content: string
          cover_image: string
          excerpt: string
          featured: boolean | null
          id: string
          likes: number | null
          published_date: string
          read_time: string | null
          references_cit: Json | null
          slug: string
          tags: string[] | null
          title: string
          updated_date: string
        }
        Insert: {
          author_avatar: string
          author_name: string
          category: string
          comments?: Json | null
          content: string
          cover_image: string
          excerpt: string
          featured?: boolean | null
          id?: string
          likes?: number | null
          published_date?: string
          read_time?: string | null
          references_cit?: Json | null
          slug: string
          tags?: string[] | null
          title: string
          updated_date?: string
        }
        Update: {
          author_avatar?: string
          author_name?: string
          category?: string
          comments?: Json | null
          content?: string
          cover_image?: string
          excerpt?: string
          featured?: boolean | null
          id?: string
          likes?: number | null
          published_date?: string
          read_time?: string | null
          references_cit?: Json | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_date?: string
        }
        Relationships: []
      }
      broadcast_recipients: {
        Row: {
          broadcast_id: string
          id: string
          is_read: boolean
          read_at: string | null
          received_at: string
          user_id: string
        }
        Insert: {
          broadcast_id: string
          id?: string
          is_read?: boolean
          read_at?: string | null
          received_at?: string
          user_id: string
        }
        Update: {
          broadcast_id?: string
          id?: string
          is_read?: boolean
          read_at?: string | null
          received_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_recipients_broadcast_id_fkey"
            columns: ["broadcast_id"]
            isOneToOne: false
            referencedRelation: "broadcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcasts: {
        Row: {
          content: string
          created_at: string
          created_by: string
          id: string
          priority: string
          recepient_id: Json | null
          recepient_read: Json | null
          recipients: string[] | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          id?: string
          priority?: string
          recepient_id?: Json | null
          recepient_read?: Json | null
          recipients?: string[] | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          priority?: string
          recepient_id?: Json | null
          recepient_read?: Json | null
          recipients?: string[] | null
          title?: string
        }
        Relationships: []
      }
      cbt_user_answers: {
        Row: {
          answer: string | null
          created_at: string
          id: number
          module_id: number | null
          task_id: string | null
          user_id: string | null
        }
        Insert: {
          answer?: string | null
          created_at?: string
          id?: number
          module_id?: number | null
          task_id?: string | null
          user_id?: string | null
        }
        Update: {
          answer?: string | null
          created_at?: string
          id?: number
          module_id?: number | null
          task_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cbt_user_answers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cbt_user_answers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cbt_user_progress: {
        Row: {
          created_at: string
          id: number
          module_id: number | null
          professional_comment: string | null
          professional_id: string | null
          progress: number | null
          status: Database["public"]["Enums"]["cbt_module_status"] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          module_id?: number | null
          professional_comment?: string | null
          professional_id?: string | null
          progress?: number | null
          status?: Database["public"]["Enums"]["cbt_module_status"] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          module_id?: number | null
          professional_comment?: string | null
          professional_id?: string | null
          progress?: number | null
          status?: Database["public"]["Enums"]["cbt_module_status"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cbt_user_progress_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cbt_user_progress_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cbt_user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cbt_user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          chat_room_id: string
          content: string
          created_at: string
          id: string
          read_by: Json | null
          sender_id: string
        }
        Insert: {
          chat_room_id: string
          content: string
          created_at?: string
          id?: string
          read_by?: Json | null
          sender_id: string
        }
        Update: {
          chat_room_id?: string
          content?: string
          created_at?: string
          id?: string
          read_by?: Json | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_chat_room_id_fkey"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey1"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey1"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_participants: {
        Row: {
          chat_room_id: string
          id: string
          joined_at: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          chat_room_id: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          chat_room_id?: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_participants_chat_room_id_fkey"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_participants_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_participants_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string
          created_by: string
          id: string
          last_message: string | null
          last_message_at: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string
        }
        Relationships: []
      }
      diary_entries: {
        Row: {
          background_image: string | null
          content: string
          created_at: string
          id: string
          theme_color: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          background_image?: string | null
          content: string
          created_at?: string
          id?: string
          theme_color?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          background_image?: string | null
          content?: string
          created_at?: string
          id?: string
          theme_color?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      forum_comments: {
        Row: {
          content: string
          created_at: string
          forum_user_id: string
          id: string
          likes_count: number
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          forum_user_id: string
          id?: string
          likes_count?: number
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          forum_user_id?: string
          id?: string
          likes_count?: number
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_comments_forum_user_id_fkey"
            columns: ["forum_user_id"]
            isOneToOne: false
            referencedRelation: "forum_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_likes: {
        Row: {
          comment_id: string | null
          created_at: string
          id: string
          post_id: string | null
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "forum_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          comments_count: number
          content: string
          created_at: string
          forum_type: string
          forum_user_id: string
          id: string
          likes_count: number
          professional_answer_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number
          content: string
          created_at?: string
          forum_type?: string
          forum_user_id: string
          id?: string
          likes_count?: number
          professional_answer_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number
          content?: string
          created_at?: string
          forum_type?: string
          forum_user_id?: string
          id?: string
          likes_count?: number
          professional_answer_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_professional_answer"
            columns: ["professional_answer_id"]
            isOneToOne: false
            referencedRelation: "forum_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_posts_forum_user_id_fkey"
            columns: ["forum_user_id"]
            isOneToOne: false
            referencedRelation: "forum_users"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_users: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      help_reports: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      hibrida_assignments: {
        Row: {
          answers: Json
          created_at: string | null
          id: string
          session_number: number
          submitted: boolean | null
          submitted_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          answers?: Json
          created_at?: string | null
          id?: string
          session_number: number
          submitted?: boolean | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string | null
          id?: string
          session_number?: number
          submitted?: boolean | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      hibrida_enrollments: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          enrollment_requested_at: string | null
          enrollment_status: Database["public"]["Enums"]["enrollment_status"]
          group_assignment: Database["public"]["Enums"]["hibrida_group"] | null
          id: string
          role: Database["public"]["Enums"]["hibrida_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          enrollment_requested_at?: string | null
          enrollment_status?: Database["public"]["Enums"]["enrollment_status"]
          group_assignment?: Database["public"]["Enums"]["hibrida_group"] | null
          id?: string
          role?: Database["public"]["Enums"]["hibrida_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          enrollment_requested_at?: string | null
          enrollment_status?: Database["public"]["Enums"]["enrollment_status"]
          group_assignment?: Database["public"]["Enums"]["hibrida_group"] | null
          id?: string
          role?: Database["public"]["Enums"]["hibrida_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      hibrida_meetings: {
        Row: {
          created_at: string | null
          date: string | null
          description: string | null
          guidance_audio_url: string | null
          guidance_links: Json | null
          guidance_pdf_url: string | null
          guidance_text: string | null
          guidance_video_url: string | null
          id: string
          link: string | null
          materials: Json | null
          session_number: number
          time: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          description?: string | null
          guidance_audio_url?: string | null
          guidance_links?: Json | null
          guidance_pdf_url?: string | null
          guidance_text?: string | null
          guidance_video_url?: string | null
          id?: string
          link?: string | null
          materials?: Json | null
          session_number: number
          time?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          description?: string | null
          guidance_audio_url?: string | null
          guidance_links?: Json | null
          guidance_pdf_url?: string | null
          guidance_text?: string | null
          guidance_video_url?: string | null
          id?: string
          link?: string | null
          materials?: Json | null
          session_number?: number
          time?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      hibrida_user_progress: {
        Row: {
          assignment_done: boolean | null
          counselor_name: string | null
          counselor_response: string | null
          created_at: string | null
          id: string
          meeting_done: boolean | null
          responded_at: string | null
          session_number: number
          session_opened: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assignment_done?: boolean | null
          counselor_name?: string | null
          counselor_response?: string | null
          created_at?: string | null
          id?: string
          meeting_done?: boolean | null
          responded_at?: string | null
          session_number: number
          session_opened?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assignment_done?: boolean | null
          counselor_name?: string | null
          counselor_response?: string | null
          created_at?: string | null
          id?: string
          meeting_done?: boolean | null
          responded_at?: string | null
          session_number?: number
          session_opened?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: string | null
          avatar_url: string | null
          birth_date: string | null
          city: string | null
          created_at: string | null
          deactive_at: string | null
          forwarding: string | null
          full_name: string | null
          id: string
          is_active: boolean
          is_admin: boolean | null
          parent_id: string | null
          profession: string | null
          safe_mother_additional_info: Json | null
          safe_mother_family_uuid: string | null
          safe_mother_role: string | null
          safe_mother_stage: string | null
          safe_mother_uuid: string | null
          subtypes: string[] | null
          updated_at: string | null
        }
        Insert: {
          account_type?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string | null
          deactive_at?: string | null
          forwarding?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          is_admin?: boolean | null
          parent_id?: string | null
          profession?: string | null
          safe_mother_additional_info?: Json | null
          safe_mother_family_uuid?: string | null
          safe_mother_role?: string | null
          safe_mother_stage?: string | null
          safe_mother_uuid?: string | null
          subtypes?: string[] | null
          updated_at?: string | null
        }
        Update: {
          account_type?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string | null
          deactive_at?: string | null
          forwarding?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          is_admin?: boolean | null
          parent_id?: string | null
          profession?: string | null
          safe_mother_additional_info?: Json | null
          safe_mother_family_uuid?: string | null
          safe_mother_role?: string | null
          safe_mother_stage?: string | null
          safe_mother_uuid?: string | null
          subtypes?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      psikoedukasi_assignments: {
        Row: {
          answers: Json
          created_at: string | null
          id: string
          session_number: number
          submitted: boolean | null
          submitted_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          answers?: Json
          created_at?: string | null
          id?: string
          session_number: number
          submitted?: boolean | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string | null
          id?: string
          session_number?: number
          submitted?: boolean | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      psikoedukasi_meetings: {
        Row: {
          created_at: string | null
          date: string | null
          description: string | null
          guidance_audio_url: string | null
          guidance_links: Json | null
          guidance_pdf_url: string | null
          guidance_text: string | null
          guidance_video_url: string | null
          id: string
          link: string | null
          materials: Json | null
          session_number: number
          time: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          description?: string | null
          guidance_audio_url?: string | null
          guidance_links?: Json | null
          guidance_pdf_url?: string | null
          guidance_text?: string | null
          guidance_video_url?: string | null
          id?: string
          link?: string | null
          materials?: Json | null
          session_number: number
          time?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          description?: string | null
          guidance_audio_url?: string | null
          guidance_links?: Json | null
          guidance_pdf_url?: string | null
          guidance_text?: string | null
          guidance_video_url?: string | null
          id?: string
          link?: string | null
          materials?: Json | null
          session_number?: number
          time?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      psikoedukasi_user_progress: {
        Row: {
          assignment_done: boolean | null
          counselor_name: string | null
          counselor_response: string | null
          created_at: string | null
          id: string
          meeting_done: boolean | null
          responded_at: string | null
          session_number: number
          session_opened: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assignment_done?: boolean | null
          counselor_name?: string | null
          counselor_response?: string | null
          created_at?: string | null
          id?: string
          meeting_done?: boolean | null
          responded_at?: string | null
          session_number: number
          session_opened?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assignment_done?: boolean | null
          counselor_name?: string | null
          counselor_response?: string | null
          created_at?: string | null
          id?: string
          meeting_done?: boolean | null
          responded_at?: string | null
          session_number?: number
          session_opened?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      safe_mother_materials: {
        Row: {
          author_id: string
          author_name: string
          category: string
          content: string | null
          created_at: string
          description: string
          hd_image_url: string | null
          id: string
          slug: string | null
          thumbnail_url: string | null
          title: string
          type: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          author_id: string
          author_name: string
          category: string
          content?: string | null
          created_at?: string
          description: string
          hd_image_url?: string | null
          id?: string
          slug?: string | null
          thumbnail_url?: string | null
          title: string
          type: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          author_id?: string
          author_name?: string
          category?: string
          content?: string | null
          created_at?: string
          description?: string
          hd_image_url?: string | null
          id?: string
          slug?: string | null
          thumbnail_url?: string | null
          title?: string
          type?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      test_results: {
        Row: {
          anonymous_birthdate: string | null
          anonymous_email: string | null
          anonymous_name: string | null
          answers: Json
          city: string | null
          created_at: string | null
          for_other: boolean | null
          id: string
          notes: string | null
          other_person_name: string | null
          result_summary: string | null
          test_id: string
          test_title: string
          user_id: string | null
        }
        Insert: {
          anonymous_birthdate?: string | null
          anonymous_email?: string | null
          anonymous_name?: string | null
          answers: Json
          city?: string | null
          created_at?: string | null
          for_other?: boolean | null
          id?: string
          notes?: string | null
          other_person_name?: string | null
          result_summary?: string | null
          test_id: string
          test_title: string
          user_id?: string | null
        }
        Update: {
          anonymous_birthdate?: string | null
          anonymous_email?: string | null
          anonymous_name?: string | null
          answers?: Json
          city?: string | null
          created_at?: string | null
          for_other?: boolean | null
          id?: string
          notes?: string | null
          other_person_name?: string | null
          result_summary?: string | null
          test_id?: string
          test_title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      urgent_cases: {
        Row: {
          child_user_id: string
          created_at: string
          id: string
          is_resolved: boolean
          parent_consultation_id: string | null
          parent_user_id: string
          source_conversation_id: string
          source_message_id: string
        }
        Insert: {
          child_user_id: string
          created_at?: string
          id?: string
          is_resolved?: boolean
          parent_consultation_id?: string | null
          parent_user_id: string
          source_conversation_id: string
          source_message_id: string
        }
        Update: {
          child_user_id?: string
          created_at?: string
          id?: string
          is_resolved?: boolean
          parent_consultation_id?: string | null
          parent_user_id?: string
          source_conversation_id?: string
          source_message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "urgent_cases_child_user_id_fkey"
            columns: ["child_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "urgent_cases_child_user_id_fkey"
            columns: ["child_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "urgent_cases_parent_consultation_id_fkey"
            columns: ["parent_consultation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "urgent_cases_parent_user_id_fkey"
            columns: ["parent_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "urgent_cases_parent_user_id_fkey"
            columns: ["parent_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "urgent_cases_source_conversation_id_fkey"
            columns: ["source_conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "urgent_cases_source_message_id_fkey"
            columns: ["source_message_id"]
            isOneToOne: false
            referencedRelation: "ai_messages"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_users: {
        Row: {
          id: string | null
        }
        Insert: {
          id?: string | null
        }
        Update: {
          id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_shared_chat_room: {
        Args: { room_type: string; user_id_1: string; user_id_2: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super" | "admin" | "user"
      cbt_module_status: "available" | "locked" | "completed"
      enrollment_status: "pending" | "approved" | "rejected"
      hibrida_group: "A" | "B" | "C" | "Admin"
      hibrida_role: "reguler" | "grup-int" | "grup-cont" | "super-admin"
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
  public: {
    Enums: {
      app_role: ["super", "admin", "user"],
      cbt_module_status: ["available", "locked", "completed"],
      enrollment_status: ["pending", "approved", "rejected"],
      hibrida_group: ["A", "B", "C", "Admin"],
      hibrida_role: ["reguler", "grup-int", "grup-cont", "super-admin"],
    },
  },
} as const
