export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      schools: {
        Row: {
          id: string
          name: string
          helcim_merchant_id: string | null
          bank_account_info: Json | null
          contact_email: string
          address: Json | null
          revenue_share_percentage: number
          status: 'pending' | 'active' | 'suspended'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          helcim_merchant_id?: string | null
          bank_account_info?: Json | null
          contact_email: string
          address?: Json | null
          revenue_share_percentage?: number
          status?: 'pending' | 'active' | 'suspended'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          helcim_merchant_id?: string | null
          bank_account_info?: Json | null
          contact_email?: string
          address?: Json | null
          revenue_share_percentage?: number
          status?: 'pending' | 'active' | 'suspended'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          id: string
          school_id: string
          student_name: string
          student_identifier: string | null
          parent_email: string
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          student_name: string
          student_identifier?: string | null
          parent_email: string
          created_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          student_name?: string
          student_identifier?: string | null
          parent_email?: string
          created_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          school_id: string
          student_id: string
          amount: number
          helcim_transaction_id: string | null
          card_last_four: string | null
          processing_fee: number | null
          revenue_share_amount: number | null
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          school_id: string
          student_id: string
          amount: number
          helcim_transaction_id?: string | null
          card_last_four?: string | null
          processing_fee?: number | null
          revenue_share_amount?: number | null
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          student_id?: string
          amount?: number
          helcim_transaction_id?: string | null
          card_last_four?: string | null
          processing_fee?: number | null
          revenue_share_amount?: number | null
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      credit_cards: {
        Row: {
          id: string
          card_name: string
          issuer: string
          signup_bonus_value: number | null
          signup_bonus_requirement: string | null
          signup_bonus_timeframe: string | null
          annual_fee: number
          first_year_waived: boolean
          rewards_rate: number | null
          rewards_type: string | null
          category_bonuses: Json | null
          min_credit_score: number | null
          is_business_card: boolean
          application_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          card_name: string
          issuer: string
          signup_bonus_value?: number | null
          signup_bonus_requirement?: string | null
          signup_bonus_timeframe?: string | null
          annual_fee?: number
          first_year_waived?: boolean
          rewards_rate?: number | null
          rewards_type?: string | null
          category_bonuses?: Json | null
          min_credit_score?: number | null
          is_business_card?: boolean
          application_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          card_name?: string
          issuer?: string
          signup_bonus_value?: number | null
          signup_bonus_requirement?: string | null
          signup_bonus_timeframe?: string | null
          annual_fee?: number
          first_year_waived?: boolean
          rewards_rate?: number | null
          rewards_type?: string | null
          category_bonuses?: Json | null
          min_credit_score?: number | null
          is_business_card?: boolean
          application_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      assessment_responses: {
        Row: {
          id: string
          session_id: string
          school_id: string | null
          student_name: string | null
          student_identifier: string | null
          tuition_amount: number | null
          credit_score_range: string | null
          current_cards: string[] | null
          monthly_spend_capacity: number | null
          preferred_rewards_type: string | null
          open_to_business_cards: boolean
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          school_id?: string | null
          student_name?: string | null
          student_identifier?: string | null
          tuition_amount?: number | null
          credit_score_range?: string | null
          current_cards?: string[] | null
          monthly_spend_capacity?: number | null
          preferred_rewards_type?: string | null
          open_to_business_cards?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          school_id?: string | null
          student_name?: string | null
          student_identifier?: string | null
          tuition_amount?: number | null
          credit_score_range?: string | null
          current_cards?: string[] | null
          monthly_spend_capacity?: number | null
          preferred_rewards_type?: string | null
          open_to_business_cards?: boolean
          created_at?: string
        }
        Relationships: []
      }
      card_recommendations: {
        Row: {
          id: string
          assessment_id: string
          card_id: string
          card_name: string
          estimated_savings: number | null
          rank: number | null
          was_selected: boolean
          created_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          card_id: string
          card_name: string
          estimated_savings?: number | null
          rank?: number | null
          was_selected?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string
          card_id?: string
          card_name?: string
          estimated_savings?: number | null
          rank?: number | null
          was_selected?: boolean
          created_at?: string
        }
        Relationships: []
      }
      school_admins: {
        Row: {
          id: string
          school_id: string
          email: string
          role: 'admin' | 'viewer'
          created_at: string
        }
        Insert: {
          id: string
          school_id: string
          email: string
          role?: 'admin' | 'viewer'
          created_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          email?: string
          role?: 'admin' | 'viewer'
          created_at?: string
        }
        Relationships: []
      }
      school_applications: {
        Row: {
          id: string
          school_name: string
          school_type: 'catholic' | 'christian' | 'private_secular' | 'montessori' | 'other'
          address: Json
          contact_name: string
          contact_title: string
          contact_email: string
          contact_phone: string
          estimated_students: string
          average_tuition: string
          current_payment_system: string | null
          additional_notes: string | null
          status: 'pending' | 'approved' | 'rejected' | 'onboarding'
          reviewed_at: string | null
          reviewed_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          school_name: string
          school_type: 'catholic' | 'christian' | 'private_secular' | 'montessori' | 'other'
          address: Json
          contact_name: string
          contact_title: string
          contact_email: string
          contact_phone: string
          estimated_students: string
          average_tuition: string
          current_payment_system?: string | null
          additional_notes?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'onboarding'
          reviewed_at?: string | null
          reviewed_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          school_name?: string
          school_type?: 'catholic' | 'christian' | 'private_secular' | 'montessori' | 'other'
          address?: Json
          contact_name?: string
          contact_title?: string
          contact_email?: string
          contact_phone?: string
          estimated_students?: string
          average_tuition?: string
          current_payment_system?: string | null
          additional_notes?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'onboarding'
          reviewed_at?: string | null
          reviewed_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type School = Database['public']['Tables']['schools']['Row']
export type Student = Database['public']['Tables']['students']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type CreditCard = Database['public']['Tables']['credit_cards']['Row']
export type AssessmentResponse = Database['public']['Tables']['assessment_responses']['Row']
export type CardRecommendation = Database['public']['Tables']['card_recommendations']['Row']
export type SchoolAdmin = Database['public']['Tables']['school_admins']['Row']
export type SchoolApplication = Database['public']['Tables']['school_applications']['Row']
