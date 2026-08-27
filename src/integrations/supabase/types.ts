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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          cover_note: string | null
          created_at: string
          id: string
          job_id: string
          status: Database["public"]["Enums"]["application_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          cover_note?: string | null
          created_at?: string
          id?: string
          job_id: string
          status?: Database["public"]["Enums"]["application_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          cover_note?: string | null
          created_at?: string
          id?: string
          job_id?: string
          status?: Database["public"]["Enums"]["application_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      education_entries: {
        Row: {
          created_at: string
          degree: string
          grade: string | null
          id: string
          institution: string
          student_id: string
          year: string | null
        }
        Insert: {
          created_at?: string
          degree: string
          grade?: string | null
          id?: string
          institution: string
          student_id: string
          year?: string | null
        }
        Update: {
          created_at?: string
          degree?: string
          grade?: string | null
          id?: string
          institution?: string
          student_id?: string
          year?: string | null
        }
        Relationships: []
      }
      employer_profiles: {
        Row: {
          company_name: string
          company_size: string | null
          created_at: string
          description: string | null
          hr_email: string | null
          hr_name: string | null
          hr_phone: string | null
          industry: string | null
          location: string | null
          logo_url: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          company_name?: string
          company_size?: string | null
          created_at?: string
          description?: string | null
          hr_email?: string | null
          hr_name?: string | null
          hr_phone?: string | null
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          company_name?: string
          company_size?: string | null
          created_at?: string
          description?: string | null
          hr_email?: string | null
          hr_name?: string | null
          hr_phone?: string | null
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      interview_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          interview_id: string
          sender_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          interview_id: string
          sender_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          interview_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_messages_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "interviews"
            referencedColumns: ["id"]
          },
        ]
      }
      interviews: {
        Row: {
          application_id: string | null
          created_at: string
          duration_minutes: number
          employer_id: string
          ended_at: string | null
          feedback: string | null
          id: string
          job_id: string | null
          notes: string | null
          rating: number | null
          room_id: string
          scheduled_at: string
          started_at: string | null
          status: Database["public"]["Enums"]["interview_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          application_id?: string | null
          created_at?: string
          duration_minutes?: number
          employer_id: string
          ended_at?: string | null
          feedback?: string | null
          id?: string
          job_id?: string | null
          notes?: string | null
          rating?: number | null
          room_id?: string
          scheduled_at: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["interview_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          application_id?: string | null
          created_at?: string
          duration_minutes?: number
          employer_id?: string
          ended_at?: string | null
          feedback?: string | null
          id?: string
          job_id?: string | null
          notes?: string | null
          rating?: number | null
          room_id?: string
          scheduled_at?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["interview_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interviews_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          created_at: string
          ctc: string | null
          deadline: string | null
          description: string | null
          employer_id: string
          id: string
          is_open: boolean
          job_type: string
          location: string | null
          skills: string[]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          ctc?: string | null
          deadline?: string | null
          description?: string | null
          employer_id: string
          id?: string
          is_open?: boolean
          job_type?: string
          location?: string | null
          skills?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          ctc?: string | null
          deadline?: string | null
          description?: string | null
          employer_id?: string
          id?: string
          is_open?: boolean
          job_type?: string
          location?: string | null
          skills?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          certifications: string[]
          created_at: string
          date_of_birth: string | null
          headline: string | null
          interests: string[]
          location: string | null
          resume_url: string | null
          skills: string[]
          university_id: string | null
          updated_at: string
          user_id: string
          verified: boolean
        }
        Insert: {
          certifications?: string[]
          created_at?: string
          date_of_birth?: string | null
          headline?: string | null
          interests?: string[]
          location?: string | null
          resume_url?: string | null
          skills?: string[]
          university_id?: string | null
          updated_at?: string
          user_id: string
          verified?: boolean
        }
        Update: {
          certifications?: string[]
          created_at?: string
          date_of_birth?: string | null
          headline?: string | null
          interests?: string[]
          location?: string | null
          resume_url?: string | null
          skills?: string[]
          university_id?: string | null
          updated_at?: string
          user_id?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "student_profiles_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "university_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      university_profiles: {
        Row: {
          accreditation: string | null
          address: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string
          logo_url: string | null
          name: string
          programs: string[]
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          accreditation?: string | null
          address?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          logo_url?: string | null
          name?: string
          programs?: string[]
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          accreditation?: string | null
          address?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          logo_url?: string | null
          name?: string
          programs?: string[]
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_role_name: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_interview_participant: {
        Args: { _interview_id: string; _user_id: string }
        Returns: boolean
      }
      owns_job: {
        Args: { _job_id: string; _user_id: string }
        Returns: boolean
      }
      student_university: { Args: { _student_id: string }; Returns: string }
    }
    Enums: {
      app_role: "student" | "university" | "employer"
      application_status:
        | "applied"
        | "shortlisted"
        | "selected"
        | "rejected"
        | "on_hold"
      interview_status: "scheduled" | "in_progress" | "completed" | "cancelled"
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
      app_role: ["student", "university", "employer"],
      application_status: [
        "applied",
        "shortlisted",
        "selected",
        "rejected",
        "on_hold",
      ],
      interview_status: ["scheduled", "in_progress", "completed", "cancelled"],
    },
  },
} as const
