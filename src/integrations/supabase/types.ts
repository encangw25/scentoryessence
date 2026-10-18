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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      assets: {
        Row: {
          condition: string
          created_at: string
          id: string
          location: string | null
          name: string
          qty: number
        }
        Insert: {
          condition?: string
          created_at?: string
          id?: string
          location?: string | null
          name: string
          qty?: number
        }
        Update: {
          condition?: string
          created_at?: string
          id?: string
          location?: string | null
          name?: string
          qty?: number
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          detail: string | null
          id: string
          user_email: string | null
        }
        Insert: {
          action: string
          created_at?: string
          detail?: string | null
          id?: string
          user_email?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          detail?: string | null
          id?: string
          user_email?: string | null
        }
        Relationships: []
      }
      bulk_liquids: {
        Row: {
          formula_id: string
          min_ml: number
          volume_ml: number
        }
        Insert: {
          formula_id: string
          min_ml?: number
          volume_ml?: number
        }
        Update: {
          formula_id?: string
          min_ml?: number
          volume_ml?: number
        }
        Relationships: [
          {
            foreignKeyName: "bulk_liquids_formula_id_fkey"
            columns: ["formula_id"]
            isOneToOne: true
            referencedRelation: "formulas"
            referencedColumns: ["id"]
          },
        ]
      }
      bulk_productions: {
        Row: {
          created_at: string
          created_by: string | null
          formula_id: string
          id: string
          volume_ml: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          formula_id: string
          id?: string
          volume_ml: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          formula_id?: string
          id?: string
          volume_ml?: number
        }
        Relationships: [
          {
            foreignKeyName: "bulk_productions_formula_id_fkey"
            columns: ["formula_id"]
            isOneToOne: false
            referencedRelation: "formulas"
            referencedColumns: ["id"]
          },
        ]
      }
      formula_items: {
        Row: {
          formula_id: string
          id: string
          material_id: string
          qty_per_100ml: number
        }
        Insert: {
          formula_id: string
          id?: string
          material_id: string
          qty_per_100ml: number
        }
        Update: {
          formula_id?: string
          id?: string
          material_id?: string
          qty_per_100ml?: number
        }
        Relationships: [
          {
            foreignKeyName: "formula_items_formula_id_fkey"
            columns: ["formula_id"]
            isOneToOne: false
            referencedRelation: "formulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formula_items_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      formulas: {
        Row: {
          created_at: string
          id: string
          name: string
          notes: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          notes?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
        }
        Relationships: []
      }
      materials: {
        Row: {
          category: string
          created_at: string
          id: string
          min_stock: number
          name: string
          stock: number
          unit: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          min_stock?: number
          name: string
          stock?: number
          unit?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          min_stock?: number
          name?: string
          stock?: number
          unit?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          bottle_material_id: string | null
          created_at: string
          formula_id: string
          id: string
          min_stock: number
          name: string
          size_ml: number
          stock: number
        }
        Insert: {
          bottle_material_id?: string | null
          created_at?: string
          formula_id: string
          id?: string
          min_stock?: number
          name: string
          size_ml: number
          stock?: number
        }
        Update: {
          bottle_material_id?: string | null
          created_at?: string
          formula_id?: string
          id?: string
          min_stock?: number
          name?: string
          size_ml?: number
          stock?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_bottle_material_id_fkey"
            columns: ["bottle_material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_formula_id_fkey"
            columns: ["formula_id"]
            isOneToOne: false
            referencedRelation: "formulas"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          material_id: string
          qty: number
          supplier: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          material_id: string
          qty: number
          supplier?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          material_id?: string
          qty?: number
          supplier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      repacks: {
        Row: {
          bulk_used_ml: number
          created_at: string
          created_by: string | null
          id: string
          product_id: string
          qty: number
        }
        Insert: {
          bulk_used_ml: number
          created_at?: string
          created_by?: string | null
          id?: string
          product_id: string
          qty: number
        }
        Update: {
          bulk_used_ml?: number
          created_at?: string
          created_by?: string | null
          id?: string
          product_id?: string
          qty?: number
        }
        Relationships: [
          {
            foreignKeyName: "repacks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          qty: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          qty: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          qty?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "sales_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_orders: {
        Row: {
          channel: string
          created_at: string
          created_by: string | null
          customer: string | null
          id: string
          status: string
        }
        Insert: {
          channel: string
          created_at?: string
          created_by?: string | null
          customer?: string | null
          id?: string
          status?: string
        }
        Update: {
          channel?: string
          created_at?: string
          created_by?: string | null
          customer?: string | null
          id?: string
          status?: string
        }
        Relationships: []
      }
      staff_members: {
        Row: {
          added_by: string | null
          created_at: string
          email: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string
          email: string
        }
        Update: {
          added_by?: string | null
          created_at?: string
          email?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_first_staff: { Args: never; Returns: boolean }
      create_sale: {
        Args: {
          _channel: string
          _customer: string
          _items: Json
          _status: string
        }
        Returns: string
      }
      is_staff: { Args: never; Returns: boolean }
      log_action: {
        Args: { _action: string; _detail: string }
        Returns: undefined
      }
      produce_bulk: {
        Args: { _formula: string; _volume: number }
        Returns: undefined
      }
      receive_purchase: {
        Args: { _material: string; _qty: number; _supplier: string }
        Returns: undefined
      }
      repack_product: {
        Args: { _product: string; _qty: number }
        Returns: undefined
      }
      set_sale_status: {
        Args: { _order: string; _status: string }
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
  public: {
    Enums: {},
  },
} as const
