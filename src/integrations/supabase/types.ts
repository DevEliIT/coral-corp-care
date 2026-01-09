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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          cnpj: string
          created_at: string | null
          estimated_lines: number | null
          id: string
          legal_name: string
          owner_id: string | null
          segment: string | null
          status: Database["public"]["Enums"]["company_status"]
          updated_at: string | null
        }
        Insert: {
          cnpj: string
          created_at?: string | null
          estimated_lines?: number | null
          id?: string
          legal_name: string
          owner_id?: string | null
          segment?: string | null
          status?: Database["public"]["Enums"]["company_status"]
          updated_at?: string | null
        }
        Update: {
          cnpj?: string
          created_at?: string | null
          estimated_lines?: number | null
          id?: string
          legal_name?: string
          owner_id?: string | null
          segment?: string | null
          status?: Database["public"]["Enums"]["company_status"]
          updated_at?: string | null
        }
        Relationships: []
      }
      company_contacts: {
        Row: {
          birth_date: string | null
          company_id: string
          contact_type: Database["public"]["Enums"]["contact_type"] | null
          cpf: string | null
          created_at: string | null
          decision_role: Database["public"]["Enums"]["decision_role"] | null
          email: string | null
          id: string
          landline_phone: string | null
          mobile_phone: string | null
          name: string
          phone: string | null
          rg: string | null
          role: string | null
        }
        Insert: {
          birth_date?: string | null
          company_id: string
          contact_type?: Database["public"]["Enums"]["contact_type"] | null
          cpf?: string | null
          created_at?: string | null
          decision_role?: Database["public"]["Enums"]["decision_role"] | null
          email?: string | null
          id?: string
          landline_phone?: string | null
          mobile_phone?: string | null
          name: string
          phone?: string | null
          rg?: string | null
          role?: string | null
        }
        Update: {
          birth_date?: string | null
          company_id?: string
          contact_type?: Database["public"]["Enums"]["contact_type"] | null
          cpf?: string | null
          created_at?: string | null
          decision_role?: Database["public"]["Enums"]["decision_role"] | null
          email?: string | null
          id?: string
          landline_phone?: string | null
          mobile_phone?: string | null
          name?: string
          phone?: string | null
          rg?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_documents: {
        Row: {
          company_id: string
          created_at: string | null
          file_name: string
          file_path: string
          file_type: string | null
          id: string
          uploaded_by: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          file_name: string
          file_path: string
          file_type?: string | null
          id?: string
          uploaded_by?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_type?: string | null
          id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          notes: string | null
          proposal_id: string
          start_date: string
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          proposal_id: string
          start_date: string
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          proposal_id?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: true
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          active: boolean | null
          base_price: number
          created_at: string | null
          id: string
          name: string
          notes: string | null
          request_type: Database["public"]["Enums"]["request_type"] | null
        }
        Insert: {
          active?: boolean | null
          base_price: number
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          request_type?: Database["public"]["Enums"]["request_type"] | null
        }
        Update: {
          active?: boolean | null
          base_price?: number
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          request_type?: Database["public"]["Enums"]["request_type"] | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      proposal_attachments: {
        Row: {
          created_at: string | null
          file_name: string
          file_path: string
          file_type: string | null
          id: string
          proposal_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_path: string
          file_type?: string | null
          id?: string
          proposal_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_type?: string | null
          id?: string
          proposal_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_attachments_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_cedents: {
        Row: {
          birth_date: string | null
          contact_id: string | null
          cpf: string | null
          created_at: string | null
          email: string | null
          id: string
          is_existing_contact: boolean | null
          landline_phone: string | null
          mobile_phone: string | null
          name: string | null
          proposal_id: string
          rg: string | null
          role: string | null
        }
        Insert: {
          birth_date?: string | null
          contact_id?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_existing_contact?: boolean | null
          landline_phone?: string | null
          mobile_phone?: string | null
          name?: string | null
          proposal_id: string
          rg?: string | null
          role?: string | null
        }
        Update: {
          birth_date?: string | null
          contact_id?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_existing_contact?: boolean | null
          landline_phone?: string | null
          mobile_phone?: string | null
          name?: string | null
          proposal_id?: string
          rg?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_cedents_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "company_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_cedents_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: true
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_status_history: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          id: string
          new_status: Database["public"]["Enums"]["proposal_status"]
          old_status: Database["public"]["Enums"]["proposal_status"] | null
          proposal_id: string
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_status: Database["public"]["Enums"]["proposal_status"]
          old_status?: Database["public"]["Enums"]["proposal_status"] | null
          proposal_id: string
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_status?: Database["public"]["Enums"]["proposal_status"]
          old_status?: Database["public"]["Enums"]["proposal_status"] | null
          proposal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_status_history_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          company_id: string
          created_at: string | null
          donor_carrier: string | null
          id: string
          line_quantity: number
          notes: string | null
          operational_status:
            | Database["public"]["Enums"]["operational_status"]
            | null
          plan_id: string | null
          price_per_line: number
          product: string | null
          request_type: Database["public"]["Enums"]["request_type"] | null
          seller_id: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["proposal_status"]
          total_monthly: number | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          donor_carrier?: string | null
          id?: string
          line_quantity: number
          notes?: string | null
          operational_status?:
            | Database["public"]["Enums"]["operational_status"]
            | null
          plan_id?: string | null
          price_per_line: number
          product?: string | null
          request_type?: Database["public"]["Enums"]["request_type"] | null
          seller_id?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["proposal_status"]
          total_monthly?: number | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          donor_carrier?: string | null
          id?: string
          line_quantity?: number
          notes?: string | null
          operational_status?:
            | Database["public"]["Enums"]["operational_status"]
            | null
          plan_id?: string | null
          price_per_line?: number
          product?: string | null
          request_type?: Database["public"]["Enums"]["request_type"] | null
          seller_id?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["proposal_status"]
          total_monthly?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      is_manager: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "seller" | "manager"
      company_status: "lead" | "proposal" | "active" | "lost"
      contact_type: "legal_representative" | "account_manager" | "cedent"
      decision_role: "decision_maker" | "influencer" | "financial"
      operational_status:
        | "analysis"
        | "documentation"
        | "activation"
        | "completed"
        | "cancelled"
      proposal_status:
        | "qualified"
        | "diagnosis"
        | "sent"
        | "negotiation"
        | "signed"
        | "lost"
      request_type: "portability" | "new_line" | "migration"
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
      app_role: ["seller", "manager"],
      company_status: ["lead", "proposal", "active", "lost"],
      contact_type: ["legal_representative", "account_manager", "cedent"],
      decision_role: ["decision_maker", "influencer", "financial"],
      operational_status: [
        "analysis",
        "documentation",
        "activation",
        "completed",
        "cancelled",
      ],
      proposal_status: [
        "qualified",
        "diagnosis",
        "sent",
        "negotiation",
        "signed",
        "lost",
      ],
      request_type: ["portability", "new_line", "migration"],
    },
  },
} as const
