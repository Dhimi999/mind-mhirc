export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      bfi_results: {
        Row: {
          anonymous_age: string | null;
          anonymous_email: string | null;
          anonymous_name: string | null;
          answers: Json;
          created_at: string | null;
          for_other: boolean | null;
          id: string;
          other_person_name: string | null;
          other_person_relationship: string | null;
          result_summary: string | null;
          test_id: string;
          test_title: string;
          user_id: string | null;
        };
        Insert: {
          anonymous_age?: string | null;
          anonymous_email?: string | null;
          anonymous_name?: string | null;
          answers: Json;
          created_at?: string | null;
          for_other?: boolean | null;
          id?: string;
          other_person_name?: string | null;
          other_person_relationship?: string | null;
          result_summary?: string | null;
          test_id: string;
          test_title: string;
          user_id?: string | null;
        };
        Update: {
          anonymous_age?: string | null;
          anonymous_email?: string | null;
          anonymous_name?: string | null;
          answers?: Json;
          created_at?: string | null;
          for_other?: boolean | null;
          id?: string;
          other_person_name?: string | null;
          other_person_relationship?: string | null;
          result_summary?: string | null;
          test_id?: string;
          test_title?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      blog_posts: {
        Row: {
          author_avatar: string;
          author_name: string;
          category: string;
          comments: Json | null;
          content: string;
          cover_image: string;
          excerpt: string;
          featured: boolean | null;
          id: string;
          likes: number | null;
          published_date: string;
          read_time: string | null;
          references_cit: Json | null;
          slug: string;
          tags: string[] | null;
          title: string;
          updated_date: string;
        };
        Insert: {
          author_avatar: string;
          author_name: string;
          category: string;
          comments?: Json | null;
          content: string;
          cover_image: string;
          excerpt: string;
          featured?: boolean | null;
          id?: string;
          likes?: number | null;
          published_date?: string;
          read_time?: string | null;
          references_cit?: Json | null;
          slug: string;
          tags?: string[] | null;
          title: string;
          updated_date?: string;
        };
        Update: {
          author_avatar?: string;
          author_name?: string;
          category?: string;
          comments?: Json | null;
          content?: string;
          cover_image?: string;
          excerpt?: string;
          featured?: boolean | null;
          id?: string;
          likes?: number | null;
          published_date?: string;
          read_time?: string | null;
          references_cit?: Json | null;
          slug?: string;
          tags?: string[] | null;
          title?: string;
          updated_date?: string;
        };
        Relationships: [];
      };
      broadcasts: {
        Row: {
          content: string;
          created_at: string;
          created_by: string;
          id: string;
          priority: string;
          recipients: string[] | null;
          title: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          created_by: string;
          id?: string;
          priority?: string;
          recipients?: string[] | null;
          title: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          created_by?: string;
          id?: string;
          priority?: string;
          recipients?: string[] | null;
          title?: string;
        };
        Relationships: [];
      };
      contact_messages: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          message: string;
          name: string;
          status: string;
          subject: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          message: string;
          name: string;
          status?: string;
          subject: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          message?: string;
          name?: string;
          status?: string;
          subject?: string;
        };
        Relationships: [];
      };
      help_reports: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          message: string;
          name: string;
          status: string;
          subject: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          message: string;
          name: string;
          status?: string;
          subject: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          message?: string;
          name?: string;
          status?: string;
          subject?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          account_type: string | null;
          avatar_url: string | null;
          birth_date: string | null;
          city: string | null;
          created_at: string | null;
          full_name: string | null;
          id: string;
          profession: string | null;
          is_admin: boolean | null;
          updated_at: string | null;
        };
        Insert: {
          account_type?: string | null;
          avatar_url?: string | null;
          birth_date?: string | null;
          city?: string | null;
          created_at?: string | null;
          full_name?: string | null;
          id: string;
          profession?: string | null;
          is_admin: boolean | null;
          updated_at?: string | null;
        };
        Update: {
          account_type?: string | null;
          avatar_url?: string | null;
          birth_date?: string | null;
          city?: string | null;
          created_at?: string | null;
          full_name?: string | null;
          id?: string;
          profession?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      test_results: {
        Row: {
          anonymous_age: string | null;
          anonymous_email: string | null;
          anonymous_name: string | null;
          answers: Json;
          created_at: string | null;
          for_other: boolean | null;
          id: string;
          other_person_name: string | null;
          other_person_relationship: string | null;
          result_summary: string | null;
          test_id: string;
          test_title: string;
          user_id: string | null;
        };
        Insert: {
          anonymous_age?: string | null;
          anonymous_email?: string | null;
          anonymous_name?: string | null;
          answers: Json;
          created_at?: string | null;
          for_other?: boolean | null;
          id?: string;
          other_person_name?: string | null;
          other_person_relationship?: string | null;
          result_summary?: string | null;
          test_id: string;
          test_title: string;
          user_id?: string | null;
        };
        Update: {
          anonymous_age?: string | null;
          anonymous_email?: string | null;
          anonymous_name?: string | null;
          answers?: Json;
          created_at?: string | null;
          for_other?: boolean | null;
          id?: string;
          other_person_name?: string | null;
          other_person_relationship?: string | null;
          result_summary?: string | null;
          test_id?: string;
          test_title?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string | null;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _user_id: string;
          _role: Database["public"]["Enums"]["app_role"];
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "super" | "admin" | "user";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
  ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;
