import { useEffect, useState } from 'react';
import { Agent, Message, ChatHistory, AgentSettings, ChatState, } from '../types/Agent';
import { AgentSidebar } from './AgentSidebar';
import { AgentChat } from './AgentChat';
import { useToast } from '../../../hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GET, POST, PUT } from '../../../api/api_utility';

export function AdminAgentLayout() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | undefined>();

  const [messageRatings, setMessageRatings] = useState<Record<string, 'like' | 'dislike' | undefined>>({});

  const { data: agents = [] } = useQuery<Agent[]>({
    queryKey: ["agents"],
    queryFn: async () => {
      const res = await GET<Agent[]>("/api/v1/agents");
      console.log("Fetched agents:", res)
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // ✅ cache 5 min
    refetchOnWindowFocus: false,
    retry: false
  });


  // ✅ Set default agent
  useEffect(() => {
    if (agents.length && !currentAgent) {
      setCurrentAgent(agents[0]);
    }
  }, [agents, currentAgent]);



  // ✅ Fetch chats (sidebar)
  const { data: chats = [] } = useQuery({
    queryKey: ["chats", currentAgent?.id],
    queryFn: async () => {
      if (!currentAgent) return [];
      return (await GET(`/api/v1/agents/${currentAgent.id}/chats`)).data;
    },
    enabled: !!currentAgent
  });


  // ✅ Fetch messages of selected chat
  const { data: messagesData = [] } = useQuery<Message[]>({
    queryKey: ["messages", currentConversationId],
    queryFn: async () => {
      if (!currentConversationId) return [];
      const res = await GET(`/api/v1/agents/chat/${currentConversationId}`);
      return res.data.map((m: any) => ({
        id: m._id,
        role: m.role,
        rating: m.rating,
        content: m.content,
        timestamp: new Date(m.createdAt),
      }));
    },
    enabled: !!currentConversationId
  });


  // ✅ Sync messages
  useEffect(() => {
    if (!currentConversationId) return;

    setMessages(prev => {
      const same =
        prev.length === messagesData.length &&
        prev.every((m, i) => m.id === messagesData[i]?.id && m.content === messagesData[i]?.content);

      return same ? prev : messagesData;
    });
  }, [messagesData, currentConversationId]);

  const createChatMutation = useMutation({
    mutationFn: async (agentId: string) => {
      const res = await POST("/api/v1/agents/new-chat", { agentId });
      return res.data;
    },
    onSuccess: (data) => {
      setCurrentConversationId(data._id);
      queryClient.invalidateQueries({ queryKey: ["chats", currentAgent?.id] });
    }
  });

  // ✅ Send message
  const sendMessageMutation = useMutation({
    mutationFn: async (payload: { message: string; conversationId: string }) => {
      return await POST('/api/v1/agents/chat', {
        agentId: currentAgent!.id,
        conversationId: payload.conversationId,
        message: payload.message
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", currentConversationId] });
    }
  });


  // ✅ Update settings (FULLY DYNAMIC)
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: AgentSettings) => {
      return await PUT(`/api/v1/agents/${currentAgent!.id}/settings`, settings);
    },
    onSuccess: (res) => {
      const updatedAgent = res.data;

      // ✅ Update current agent
      setCurrentAgent(updatedAgent);

      // ✅ Update agents cache properly
      queryClient.setQueryData<Agent[]>(["agents"], (oldAgents) => {
        if (!oldAgents) return [];

        return oldAgents.map(agent =>
          agent.id === updatedAgent.id ? updatedAgent : agent
        );
      });

      toast({ description: "Agent settings updated" });
    }
  });


  // ✅ Handlers
  const handleAgentSelect = async (agent: Agent) => {
  setCurrentAgent(agent);
  setMessages([]);

  await createChatMutation.mutateAsync(agent.id);
};

  const handleNewChat = () => {
    if (!currentAgent) return;
    createChatMutation.mutate(currentAgent.id);
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentConversationId(chatId);
  };


  const handleSettingsUpdate = (settings: AgentSettings) => {
    if (!currentAgent) return;

    // optimistic UI
    setCurrentAgent(prev => prev ? { ...prev, settings } : prev);

    updateSettingsMutation.mutate(settings);
  };


  const saveCurrentChatToHistory = () => {
    if (!currentAgent || messagesData.length === 0) return;

    const newHistory: ChatHistory = {
      id: Date.now().toString(),
      agentId: currentAgent.id,
      agentName: currentAgent.name,
      messages,
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    setChatHistories(prev => [newHistory, ...prev]);

    toast({ description: "Chat saved to history" });
  };

  const handleLoadHistory = (historyId: string) => {
    const history = chatHistories.find(h => h.id === historyId);
    if (!history) return;

    setMessages(history.messages);
    setCurrentHistoryId(historyId);

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
    setChatHistories(prev => prev.filter(h => h.id !== historyId));
    if (currentHistoryId === historyId) setCurrentHistoryId(undefined);

    toast({ description: "Chat history deleted" });
  };


  const handleExportHistory = (historyId: string) => {
    const history = chatHistories.find(h => h.id === historyId);
    if (!history) return;

    // const exportData = {
    //   agent: history.agentName,
    //   date: history.createdAt.toISOString(),
    //   messages: history.messages.map(m => ({
    //     role: m.role,
    //     content: m.content,
    //     timestamp: m.timestamp.toISOString(),
    //     rating: m.rating
    //   }))
    // };
    // const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });

    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-history-${history.agentName}-${history.createdAt.toISOString().split('T')[0]}.json`;
    //document.body.appendChild(a);
    a.click();
    //document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({ description: 'Chat history exported successfully' });
  };

  //   setChatState(prev => ({
  //     ...prev,
  //     messages: updatedMessages
  //   }));

  //   // Update agent-specific messages with rating
  //   if (currentAgent) {
  //     setAgentMessages(prev => ({
  //       ...prev,
  //       [currentAgent!.id]: updatedMessages
  //     }));
  //   }
  // };

  const handleRateMessage = (messageId: string, rating: 'like' | 'dislike') => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? { ...msg, rating: msg.rating === rating ? undefined : rating }
          : msg
      )
    );
  };

  const handleSendMessage = async (content: string, fileAttachment?: any) => {
    if (!currentAgent) return;

    let convoId = currentConversationId;

    // create chat if not exists
    if (!convoId) {
      const chat = await createChatMutation.mutateAsync(currentAgent.id);
      convoId = chat._id;
      setCurrentConversationId(convoId);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user' as const,
      content,
      timestamp: new Date(),
      fileAttachment
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await sendMessageMutation.mutateAsync({ message: content, conversationId: convoId! });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: res.data.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      console.error(err);
      toast({
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="h-[calc(100vh-4.2rem)] flex bg-background">
      <AgentSidebar
        agents={agents}
        selectedAgent={currentAgent}
        chats={chats}
        onSelectChat={handleSelectChat}
        onAgentSelect={handleAgentSelect}
        onNewChat={handleNewChat}
        chatHistories={chatHistories}
        currentHistoryId={currentHistoryId}
        onLoadHistory={handleLoadHistory}
        onDeleteHistory={handleDeleteHistory}
        onExportHistory={handleExportHistory}
        onSettingsUpdate={handleSettingsUpdate}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <AgentChat
          agent={currentAgent}
          messages={messages}
          isLoading={isLoading}
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