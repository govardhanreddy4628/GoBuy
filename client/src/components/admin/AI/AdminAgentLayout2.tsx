import { useEffect, useState } from 'react';
import { Agent, Message, ChatHistory, AgentSettings, ChatState, } from '../types/Agent';
import { AgentSidebar } from './AgentSidebar';
import { AgentChat } from './AgentChat';
import { useToast } from '../../../hooks/use-toast';
import { useQuery } from "@tanstack/react-query";
import { GET, POST } from '../../../api/api_utility';

export function AdminAgentLayout() {
  const { toast } = useToast();
  // Store messages per agent to preserve chat data when switching
  const [agentMessages, setAgentMessages] = useState<Record<string, Message[]>>({});
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    currentAgent: null, // Default to sales agent
    chatHistories: [],
    currentHistoryId: undefined
  });

  const { data: agents = [] } = useQuery<Agent[]>({
  queryKey: ["agents"],
  queryFn: async () => {
    const res = await GET<Agent[]>("/api/v1/agents");
    return res.data;
  }
});

  useEffect(() => {
    if (agents.length) {
      setChatState(prev => ({
        ...prev,
        currentAgent: agents[0]
      }));
    }
  }, [agents]);

  const handleAgentSelect = (agent: Agent) => {
    // Save current agent's messages
    if (chatState.currentAgent && chatState.messages.length > 0) {
      setAgentMessages(prev => ({
        ...prev,
        [chatState.currentAgent!.id]: chatState.messages
      }));
    }

    // Load messages for the new agent
    const agentSpecificMessages = agentMessages[agent.id] || [];

    setChatState(prev => ({
      ...prev,
      currentAgent: agent,
      messages: agentSpecificMessages, // Load agent-specific messages
      currentHistoryId: undefined
    }));
  };

  const saveCurrentChatToHistory = () => {
    if (!chatState.currentAgent || chatState.messages.length === 0) return;

    const newHistory: ChatHistory = {
      id: Date.now().toString(),
      agentId: chatState.currentAgent.id,
      agentName: chatState.currentAgent.name,
      messages: [...chatState.messages],
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    setChatState(prev => ({
      ...prev,
      chatHistories: [newHistory, ...prev.chatHistories]
    }));
  };

  const handleLoadHistory = (historyId: string) => {
    const history = chatState.chatHistories.find(h => h.id === historyId);
    if (!history) return;

    setChatState(prev => ({
      ...prev,
      messages: [...history.messages],
      currentHistoryId: historyId
    }));

    toast({
      description: `Loaded chat history from ${new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(history.createdAt)}`,
    });
  };

  const handleDeleteHistory = (historyId: string) => {
    setChatState(prev => ({
      ...prev,
      chatHistories: prev.chatHistories.filter(h => h.id !== historyId),
      currentHistoryId: prev.currentHistoryId === historyId ? undefined : prev.currentHistoryId
    }));

    toast({
      description: 'Chat history deleted',
    });
  };

  const handleNewChat = () => {
    // Save current chat to history if it has messages
    if (chatState.messages.length > 0) {
      saveCurrentChatToHistory();
    }

    setChatState(prev => ({
      ...prev,
      messages: [],
      currentHistoryId: undefined
    }));
  };

  const handleExportHistory = (historyId: string) => {
    const history = chatState.chatHistories.find(h => h.id === historyId);
    if (!history) return;

    const exportData = {
      agent: history.agentName,
      date: history.createdAt.toISOString(),
      messages: history.messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp.toISOString()
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-history-${history.agentName}-${history.createdAt.toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      description: 'Chat history exported successfully',
    });
  };

  const handleSettingsUpdate = (settings: AgentSettings) => {
    if (!chatState.currentAgent) return;

    const updatedAgent = { ...chatState.currentAgent, settings };
    setChatState(prev => ({
      ...prev,
      currentAgent: updatedAgent
    }));

    toast({
      description: 'Agent settings updated',
    });
  };

  const handleRateMessage = (messageId: string, rating: 'like' | 'dislike') => {
    const updatedMessages = chatState.messages.map(msg =>
      msg.id === messageId
        ? { ...msg, rating: msg.rating === rating ? undefined : rating }
        : msg
    );

    setChatState(prev => ({
      ...prev,
      messages: updatedMessages
    }));

    // Update agent-specific messages with rating
    if (chatState.currentAgent) {
      setAgentMessages(prev => ({
        ...prev,
        [chatState.currentAgent!.id]: updatedMessages
      }));
    }
  };

  // const handleSendMessage = async (content: string, fileAttachment?: any) => {
  //   if (!chatState.currentAgent) return;

  //   const userMessage: Message = {
  //     id: Date.now().toString(),
  //     role: 'user' as const,
  //     content,
  //     timestamp: new Date(),
  //     fileAttachment
  //   };

  //   const newMessages = [...chatState.messages, userMessage];

  //   // Add user message and set loading
  //   setChatState(prev => ({
  //     ...prev,
  //     messages: newMessages,
  //     isLoading: true
  //   }));

  //   // Update agent-specific messages
  //   setAgentMessages(prev => ({
  //     ...prev,
  //     [chatState.currentAgent!.id]: newMessages
  //   }));

  //   // Simulate AI response
  //   setTimeout(() => {
  //     const assistantMessage: Message = {
  //       id: (Date.now() + 1).toString(),
  //       role: 'assistant' as const,
  //       content: getAgentResponse(chatState.currentAgent, content),
  //       timestamp: new Date()
  //     };

  //     const finalMessages = [...newMessages, assistantMessage];

  //     setChatState(prev => ({
  //       ...prev,
  //       messages: finalMessages,
  //       isLoading: false
  //     }));

  //     // Update agent-specific messages with AI response
  //     setAgentMessages(prev => ({
  //       ...prev,
  //       [chatState.currentAgent!.id]: finalMessages
  //     }));
  //   }, 1000 + Math.random() * 2000); // Random delay 1-3 seconds
  // };

  const handleSendMessage = async (content: string, fileAttachment?: any) => {
  if (!chatState.currentAgent) return;

  const userMessage: Message = {
    id: Date.now().toString(),
    role: 'user' as const,
    content,
    timestamp: new Date(),
    fileAttachment
  };

  const newMessages = [...chatState.messages, userMessage];

  setChatState(prev => ({
    ...prev,
    messages: newMessages,
    isLoading: true
  }));

  try {
    const data = await POST("/api/v1/agents/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        agentId: chatState.currentAgent.id,
        message: content
      })
    });

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant' as const,
      content: data.data.response,
      timestamp: new Date()
    };

    setChatState(prev => ({
      ...prev,
      messages: [...newMessages, assistantMessage],
      isLoading: false
    }));

  } catch (err) {
    console.error(err);
    setChatState(prev => ({ ...prev, isLoading: false }));
  }
};

  return (
    <div className="h-[calc(100vh-4.2rem)] flex bg-background">
      <AgentSidebar
        agents={agents}
        selectedAgent={chatState.currentAgent}
        onAgentSelect={handleAgentSelect}
        chatHistories={chatState.chatHistories}
        currentHistoryId={chatState.currentHistoryId}
        onLoadHistory={handleLoadHistory}
        onDeleteHistory={handleDeleteHistory}
        onNewChat={handleNewChat}
        onExportHistory={handleExportHistory}
        onSettingsUpdate={handleSettingsUpdate}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <AgentChat
          agent={chatState.currentAgent}
          messages={chatState.messages}
          isLoading={chatState.isLoading}
          onSendMessage={handleSendMessage}
          onRateMessage={handleRateMessage}
        />
      </div>
    </div>
  );
}

// Mock AI responses based on agent type
function getAgentResponse(agent: Agent | null, userMessage: string): string {
  if (!agent) return 'Hello! How can I help you today?';

  const responses: Record<string, string[]> = {
    'sales-agent': [
      'Based on current sales data, I can see some interesting trends. What specific metrics would you like me to analyze?',
      'Our Q4 sales forecast shows a 15% increase compared to last year. Would you like me to break this down by product category?',
      'I\'ve identified 3 key opportunities for revenue growth. Let me walk you through each one.',
      'Sales performance this month is trending 8% above target. Here are the contributing factors...'
    ],
    'inventory-agent': [
      'Current inventory levels show we have 15 items below reorder threshold. Should I prepare the restocking report?',
      'I\'ve detected unusual stock movement patterns for several SKUs. Let me analyze the data for you.',
      'Supply chain efficiency has improved by 12% this quarter. Here\'s what\'s driving the improvement...',
      'Based on seasonal trends, I recommend adjusting inventory levels for the following categories...'
    ],
    'support-agent': [
      'Customer satisfaction scores have increased 7% this month. The main drivers appear to be faster response times.',
      'I\'ve analyzed recent support tickets and found 3 recurring issues that could be addressed proactively.',
      'Support team productivity is up 23% since implementing the new workflow. Here\'s the breakdown...',
      'Customer sentiment analysis shows positive trends, with resolution times improving across all categories.'
    ]
  };

  const agentResponses = responses[agent.id] || responses['sales-agent'];
  return agentResponses[Math.floor(Math.random() * agentResponses.length)];
}