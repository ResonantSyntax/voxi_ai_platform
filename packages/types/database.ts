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
  voxi: {
    Tables: {
      accounts: {
        Row: {
          created_at: string
          id: string
          tier: Database["voxi"]["Enums"]["tier"]
        }
        Insert: {
          created_at?: string
          id?: string
          tier?: Database["voxi"]["Enums"]["tier"]
        }
        Update: {
          created_at?: string
          id?: string
          tier?: Database["voxi"]["Enums"]["tier"]
        }
        Relationships: []
      }
      calls: {
        Row: {
          account_id: string
          arrival: Database["voxi"]["Enums"]["call_arrival"]
          caller_e164: string | null
          caller_name: string | null
          ended_at: string | null
          id: string
          livekit_room: string | null
          outcome: Database["voxi"]["Enums"]["call_outcome"]
          sip_call_id: string | null
          started_at: string
          summary: string | null
          urgency: Database["voxi"]["Enums"]["urgency"]
          voxi_number_id: string
        }
        Insert: {
          account_id: string
          arrival: Database["voxi"]["Enums"]["call_arrival"]
          caller_e164?: string | null
          caller_name?: string | null
          ended_at?: string | null
          id?: string
          livekit_room?: string | null
          outcome?: Database["voxi"]["Enums"]["call_outcome"]
          sip_call_id?: string | null
          started_at?: string
          summary?: string | null
          urgency?: Database["voxi"]["Enums"]["urgency"]
          voxi_number_id: string
        }
        Update: {
          account_id?: string
          arrival?: Database["voxi"]["Enums"]["call_arrival"]
          caller_e164?: string | null
          caller_name?: string | null
          ended_at?: string | null
          id?: string
          livekit_room?: string | null
          outcome?: Database["voxi"]["Enums"]["call_outcome"]
          sip_call_id?: string | null
          started_at?: string
          summary?: string | null
          urgency?: Database["voxi"]["Enums"]["urgency"]
          voxi_number_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calls_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_voxi_number_id_fkey"
            columns: ["voxi_number_id"]
            isOneToOne: false
            referencedRelation: "voxi_numbers"
            referencedColumns: ["id"]
          },
        ]
      }
      rules: {
        Row: {
          account_id: string
          caller_e164: string | null
          created_at: string
          id: string
          instruction: string | null
          label: string
          topic: string | null
          trigger: Database["voxi"]["Enums"]["rule_trigger"]
          urgency: Database["voxi"]["Enums"]["urgency"]
        }
        Insert: {
          account_id: string
          caller_e164?: string | null
          created_at?: string
          id?: string
          instruction?: string | null
          label: string
          topic?: string | null
          trigger: Database["voxi"]["Enums"]["rule_trigger"]
          urgency?: Database["voxi"]["Enums"]["urgency"]
        }
        Update: {
          account_id?: string
          caller_e164?: string | null
          created_at?: string
          id?: string
          instruction?: string | null
          label?: string
          topic?: string | null
          trigger?: Database["voxi"]["Enums"]["rule_trigger"]
          urgency?: Database["voxi"]["Enums"]["urgency"]
        }
        Relationships: [
          {
            foreignKeyName: "rules_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          account_id: string
          created_at: string
          display_name: string | null
          id: string
          personal_e164: string | null
        }
        Insert: {
          account_id: string
          created_at?: string
          display_name?: string | null
          id: string
          personal_e164?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string
          display_name?: string | null
          id?: string
          personal_e164?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscribers_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          account_id: string
          current_period_end: string | null
          id: string
          processor: string
          processor_ref: string | null
          status: Database["voxi"]["Enums"]["subscription_status"]
          tier: Database["voxi"]["Enums"]["tier"]
          updated_at: string
        }
        Insert: {
          account_id: string
          current_period_end?: string | null
          id?: string
          processor: string
          processor_ref?: string | null
          status?: Database["voxi"]["Enums"]["subscription_status"]
          tier: Database["voxi"]["Enums"]["tier"]
          updated_at?: string
        }
        Update: {
          account_id?: string
          current_period_end?: string | null
          id?: string
          processor?: string
          processor_ref?: string | null
          status?: Database["voxi"]["Enums"]["subscription_status"]
          tier?: Database["voxi"]["Enums"]["tier"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          account_id: string
          call_id: string | null
          created_at: string
          detail: string | null
          due_at: string | null
          id: string
          status: Database["voxi"]["Enums"]["task_status"]
          title: string
        }
        Insert: {
          account_id: string
          call_id?: string | null
          created_at?: string
          detail?: string | null
          due_at?: string | null
          id?: string
          status?: Database["voxi"]["Enums"]["task_status"]
          title: string
        }
        Update: {
          account_id?: string
          call_id?: string | null
          created_at?: string
          detail?: string | null
          due_at?: string | null
          id?: string
          status?: Database["voxi"]["Enums"]["task_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
        ]
      }
      transcripts: {
        Row: {
          account_id: string
          call_id: string
          created_at: string
          turns: Json
        }
        Insert: {
          account_id: string
          call_id: string
          created_at?: string
          turns?: Json
        }
        Update: {
          account_id?: string
          call_id?: string
          created_at?: string
          turns?: Json
        }
        Relationships: [
          {
            foreignKeyName: "transcripts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transcripts_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: true
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
        ]
      }
      voxi_numbers: {
        Row: {
          account_id: string
          created_at: string
          e164: string
          forwarding_verified_at: string | null
          id: string
          provider: string
          provider_ref: string | null
          status: Database["voxi"]["Enums"]["number_status"]
        }
        Insert: {
          account_id: string
          created_at?: string
          e164: string
          forwarding_verified_at?: string | null
          id?: string
          provider?: string
          provider_ref?: string | null
          status?: Database["voxi"]["Enums"]["number_status"]
        }
        Update: {
          account_id?: string
          created_at?: string
          e164?: string
          forwarding_verified_at?: string | null
          id?: string
          provider?: string
          provider_ref?: string | null
          status?: Database["voxi"]["Enums"]["number_status"]
        }
        Relationships: [
          {
            foreignKeyName: "voxi_numbers_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_account_id: { Args: never; Returns: string }
    }
    Enums: {
      call_arrival: "direct" | "forwarded"
      call_outcome:
        | "in_progress"
        | "handled"
        | "voicemail"
        | "abandoned"
        | "failed"
      number_status: "provisioning" | "active" | "released"
      rule_trigger: "caller" | "topic"
      subscription_status: "active" | "past_due" | "cancelled"
      task_status: "open" | "done" | "dismissed"
      tier: "starter" | "pro" | "business"
      urgency: "normal" | "high"
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
  voxi: {
    Enums: {
      call_arrival: ["direct", "forwarded"],
      call_outcome: [
        "in_progress",
        "handled",
        "voicemail",
        "abandoned",
        "failed",
      ],
      number_status: ["provisioning", "active", "released"],
      rule_trigger: ["caller", "topic"],
      subscription_status: ["active", "past_due", "cancelled"],
      task_status: ["open", "done", "dismissed"],
      tier: ["starter", "pro", "business"],
      urgency: ["normal", "high"],
    },
  },
} as const
