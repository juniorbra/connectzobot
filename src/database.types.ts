export interface Database {
  public: {
    Tables: {
      qa_pairs: {
        Row: {
          id: string;
          question: string;
          answer: string;
          agent_id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          question: string;
          answer: string;
          agent_id: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          question?: string;
          answer?: string;
          agent_id?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      agents: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description?: string;
          active: boolean;
          type: string;
          prompt?: string;
          model: string;
          webhook_url?: string;
          response_template?: string;
          advanced_settings?: {
            temperature: number;
            max_tokens: number;
          };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string;
          active?: boolean;
          type?: string;
          prompt?: string;
          model?: string;
          webhook_url?: string;
          response_template?: string;
          advanced_settings?: {
            temperature: number;
            max_tokens: number;
          };
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string;
          active?: boolean;
          type?: string;
          prompt?: string;
          model?: string;
          webhook_url?: string;
          response_template?: string;
          advanced_settings?: {
            temperature: number;
            max_tokens: number;
          };
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          nome?: string;
          telefone?: string;
          email: string;
          whatsapp?: string;
          assinatura?: boolean;
          consumo?: number;
          franquia?: number;
          prompt?: string;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id: string;
          nome?: string;
          telefone?: string;
          email: string;
          whatsapp?: string;
          assinatura?: boolean;
          consumo?: number;
          franquia?: number;
          prompt?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          telefone?: string;
          email?: string;
          whatsapp?: string;
          assinatura?: boolean;
          consumo?: number;
          franquia?: number;
          prompt?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      execute_sql: {
        Args: {
          sql_query: string;
        };
        Returns: void;
      };
      get_profile: {
        Args: Record<string, never>;
        Returns: Database["public"]["Tables"]["profiles"]["Row"][];
      };
    };
  };
}
