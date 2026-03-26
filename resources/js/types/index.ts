export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  monthly_price: number;
  yearly_price: number;
  requests_per_day?: number;
  requests_per_month?: number;
  tokens_per_day?: number;
  tokens_per_month?: number;
  images_per_day?: number;
  images_per_month?: number;
  features?: string[];
  supports_api?: boolean;
  supports_voice?: boolean;
  supports_email_automation?: boolean;
  supports_projects?: boolean;
  priority_support?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  email_verified_at?: string;
  language?: string;
  google_id?: string;
  avatar?: string;
  is_admin?: boolean;
  current_plan?: SubscriptionPlan;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  context?: any;
  created_at: string;
  updated_at: string;
    project_id?: string;

  chats?: Chat[];
  user?: User;
}

export interface Chat {
  id: string;
  conversation_id: string;
  message?: string;
  response?: string;
  metadata?: any;
  role: 'user' | 'assistant';
  type: 'text' | 'image';
  created_at: string;
  updated_at: string;
  conversation?: Conversation;
  files?: ChatFile[];
  imageGeneration?: ImageGeneration;
}

export interface ChatFile {
  id: string;
  chat_id: string;
  user_id: string;
  filename: string;
  filepath: string;
  mime_type: string;
  file_size: number;
  hash: string;
  metadata?: any;
  status: 'pending' | 'processing' | 'processed' | 'failed';
  processing_results?: any;
  processed_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  chat?: Chat;
  user?: User;
}

export interface ImageGeneration {
  id: string;
  user_id: string;
  ip_address?: string;
  email?: string;
  prompt: string;
  image_url: string;
  chat_id?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  chat?: Chat;
}

export interface NavigationItem {
  name: string;
  href: string;
  icon: string;
  current: boolean;
}


// resources/js/types/index.ts
export interface Projects {
    id: string;
    title: string;
    project_type: string;
    description?: string;
    settings: Record<string, any>;
    conversations?: Conversation[];
    files?: ProjectFile[];
    created_at: string;
    updated_at: string;
}



export interface ProjectFile {
    id: string;
    file_path: string;
    file_size: number;
    file_type: string;
    meta: Record<string, any>;
    project_id: string;
}
