export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  rating?: 'like' | 'dislike';
  fileAttachment?: {
    name: string;
    size: number;
    type: string;
    url: string;
  };
}

export interface ChatHistory {
  id: string;
  agentId: string;
  agentName: string;
  messages: Message[];
  createdAt: Date;
  lastUpdated: Date;
}

export interface AgentSettings {
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  enableFileUpload: boolean;
  enableHistory: boolean;
}

export interface Agent {
  id: string;
  name: string;
  type: 'sales' | 'inventory' | 'support';
  description: string;
  icon: string;
  settings: AgentSettings;
}

export interface ChatState {
  messages: Message[];
  currentAgent: Agent | null;
  chatHistories: ChatHistory[];
  currentHistoryId?: string;
}