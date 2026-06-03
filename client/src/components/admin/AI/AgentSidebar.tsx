import { Agent, ChatHistory as ChatHistoryType, AgentSettings as AgentSettingsType } from '../types/Agent';
import { AgentSettings } from './AgentSettings';
import { ChatHistory } from './ChatHistory';

interface AgentSidebarProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  onAgentSelect: (agent: Agent) => void;
  chatHistories: ChatHistoryType[];
  currentHistoryId?: string;
  onLoadHistory: (historyId: string) => void;
  onDeleteHistory: (historyId: string) => void;
  onNewChat: () => void;
  onExportHistory: (historyId: string) => void;
  onSettingsUpdate: (settings: AgentSettingsType) => void;
}

export function AgentSidebar({
  agents,
  selectedAgent,
  onAgentSelect,
  chatHistories,
  currentHistoryId,
  onLoadHistory,
  onDeleteHistory,
  onNewChat,
  onExportHistory,
  onSettingsUpdate
}: AgentSidebarProps) {

  type AgentType = 'sales' | 'inventory' | 'support';

  const colorMap: Record<AgentType, string> = {
    sales: 'bg-blue-500/10',
    inventory: 'bg-green-500/10',
    support: 'bg-purple-500/10'
  };

  return (
    <div className="w-64 bg-admin-sidebar text-admin-sidebar-fg flex flex-col border-r border-border shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-admin-sidebar-hover">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-admin-sidebar-fg">AI Agents</h1>
            <p className="text-sm text-admin-sidebar-fg/70 mt-1">Choose your assistant</p>
          </div>
          <div className="flex items-center gap-2">
            <ChatHistory
              agent={selectedAgent}
              histories={chatHistories}
              currentHistoryId={currentHistoryId}
              onLoadHistory={onLoadHistory}
              onDeleteHistory={onDeleteHistory}
              onNewChat={onNewChat}
              onExportHistory={onExportHistory}
            />
            <AgentSettings
              agent={selectedAgent}
              onSettingsUpdate={onSettingsUpdate}
            />
          </div>
        </div>
      </div>

      {/* Agents List */}
      <div className="flex-1 p-4 space-y-2">
        {agents.map((agent) => {
          const colorClass = colorMap[agent.type];
        return (
          <button
            key={agent.id}
            onClick={() => onAgentSelect(agent)}
            className={`
              w-full text-left p-4 rounded-lg transition-all duration-200 group
              ${selectedAgent?.id === agent.id
                ? 'bg-admin-sidebar-active shadow-md border border-dotted border-primary'
                : 'hover:bg-admin-sidebar-hover text-admin-sidebar-fg/90 hover:text-admin-sidebar-fg'
              }
            `}
          >
            <div className="flex items-start space-x-3">
              <div
                className={`
                  text-2xl p-2 rounded-lg transition-colors duration-200
                  ${selectedAgent?.id === agent.id
                    ? 'bg-white/20'
                    : `${colorClass} group-hover:opacity-80`
                  }
                `}
              >
                {agent.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mb-1 truncate">
                  {agent.name}
                </h3>
                <p
                  className={`
                    text-xs leading-relaxed
                    ${selectedAgent?.id === agent.id
                      ? ''
                      : 'text-admin-sidebar-fg/60 group-hover:text-admin-sidebar-fg/80'
                    }
                  `}
                >
                  {agent.description}
                </p>
              </div>
            </div>

            {/* Active indicator */}
            {selectedAgent?.id === agent.id && (
              <div className="mt-3 w-full h-0.5 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full animate-pulse" />
              </div>
            )}
          </button>
        )})}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-admin-sidebar-hover">
        <div className="flex items-center space-x-2 text-xs text-admin-sidebar-fg/50">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>AI Agents Online</span>
        </div>
      </div>
    </div>
  );
}