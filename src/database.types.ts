export interface Database {
  public: {
    Tables: {
      subscription: {
        Row: {
          id: string;
          number_workflows: number;
          subscription: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          number_workflows?: number;
          subscription?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          number_workflows?: number;
          subscription?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      fup_stages: {
        Row: {
          id: string;
          workflow_id: string;
          instancia: string;
          key: string;
          numero: string;
          created_at: string;
          estagio: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workflow_id: string;
          instancia?: string;
          key?: string;
          numero?: string;
          created_at?: string;
          estagio?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workflow_id?: string;
          instancia?: string;
          key?: string;
          numero?: string;
          created_at?: string;
          estagio?: number;
          updated_at?: string;
        };
      };
      fup_msg: {
        Row: {
          id: string;
          workflow_id: string;
          estagio_1?: string;
          estagio_2?: string;
          estagio_3?: string;
          estagio_4?: string;
          estagio_5?: string;
          intervalo_1?: number;
          intervalo_2?: number;
          intervalo_3?: number;
          intervalo_4?: number;
          intervalo_5?: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workflow_id: string;
          estagio_1?: string;
          estagio_2?: string;
          estagio_3?: string;
          estagio_4?: string;
          estagio_5?: string;
          intervalo_1?: number;
          intervalo_2?: number;
          intervalo_3?: number;
          intervalo_4?: number;
          intervalo_5?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workflow_id?: string;
          estagio_1?: string;
          estagio_2?: string;
          estagio_3?: string;
          estagio_4?: string;
          estagio_5?: string;
          intervalo_1?: number;
          intervalo_2?: number;
          intervalo_3?: number;
          intervalo_4?: number;
          intervalo_5?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      workflows: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description?: string;
          active: boolean;
          created_at: string;
          updated_at: string;
          stop_bot_on_message: boolean;
          pause_window_minutes: number;
          split_long_messages: boolean;
          show_typing_indicator: boolean;
          typing_delay_per_char_ms: number;
          concat_messages: boolean;
          concat_time_seconds: number;
          workflow_json?: any;
          followup: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
          stop_bot_on_message?: boolean;
          pause_window_minutes?: number;
          split_long_messages?: boolean;
          show_typing_indicator?: boolean;
          typing_delay_per_char_ms?: number;
          concat_messages?: boolean;
          concat_time_seconds?: number;
          workflow_json?: any;
          followup?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
          stop_bot_on_message?: boolean;
          pause_window_minutes?: number;
          split_long_messages?: boolean;
          show_typing_indicator?: boolean;
          typing_delay_per_char_ms?: number;
          concat_messages?: boolean;
          concat_time_seconds?: number;
          workflow_json?: any;
          followup?: boolean;
        };
      };
      connections: {
        Row: {
          id: string;
          user_id: string;
          workflow_id: string;
          instance_name: string;
          state?: string;
          wa_number?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workflow_id: string;
          instance_name: string;
          state?: string;
          wa_number?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          workflow_id?: string;
          instance_name?: string;
          state?: string;
          wa_number?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
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
