import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { Message, Agent } from '../types/Agent';
import { FileUpload } from './FileUpload';
import { MessageActions } from './MessageActions';
import { ExportChat } from './ExportChat';
import { SearchMessages } from './SearchMessages';
import { MessageStats } from './MessageStats';
import { Input } from '../../../ui/input';
import { Button } from '../../../ui/button';

interface AgentChatProps {
  agent: Agent | null;
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (content: string, fileAttachment?: any) => void;
  onRateMessage: (messageId: string, rating: 'like' | 'dislike') => void;
}

export function AgentChat({ agent, messages, isLoading, onSendMessage, onRateMessage }: AgentChatProps) {
  const [input, setInput] = useState('');
  const [attachedFile, setAttachedFile] = useState<any>(null);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToMessage = (messageId: string) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight the message briefly
      messageElement.classList.add('ring-2', 'ring-primary/50');
      setTimeout(() => {
        messageElement.classList.remove('ring-2', 'ring-primary/50');
      }, 2000);
    }
  };


  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    // Focus input when agent changes
    inputRef.current?.focus();
  }, [agent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim(), attachedFile);
      setInput('');
      setAttachedFile(null);
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <div className="flex flex-col h-full bg-admin-chat-bg">
      {/* Chat Header */}
      <div className="border-b border-border bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {agent && (
              <>
                <div className={`p-2 rounded-lg bg-${agent.color}/10`}>
                  <span className="text-xl">{agent.icon}</span>
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">{agent.name}</h2>
                  <p className="text-sm text-muted-foreground">{agent.description}</p>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <SearchMessages messages={messages} onMessageSelect={scrollToMessage} />
            <MessageStats messages={messages} agent={agent} />
            <ExportChat messages={messages} agent={agent} />
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && agent && (
          <div className="text-center py-12">
            <div className={`inline-block p-4 rounded-full bg-${agent.color}/10 mb-4`}>
              <span className="text-3xl">{agent.icon}</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Welcome to {agent.name}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              I'm here to help you with {agent.description.toLowerCase()}. What would you like to know?
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} id={`message-${message.id}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} group transition-all duration-200`}>
            <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
              {/* Avatar */}
              <div className={`
                flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                ${message.role === 'user'
                  ? 'bg-admin-user-message text-admin-user-message-fg ml-3'
                  : 'bg-admin-assistant-message border border-border mr-3'
                }
              `}>
                {message.role === 'user' ? (
                  <User size={16} />
                ) : (
                  <Bot size={16} className="text-muted-foreground" />
                )}
              </div>

              {/* Message Bubble */}
              <div className={`
                rounded-2xl px-4 py-3 shadow-sm relative
                ${message.role === 'user'
                  ? 'bg-admin-user-message text-admin-user-message-fg rounded-br-md'
                  : 'bg-admin-assistant-message text-admin-assistant-message-fg rounded-bl-md border border-border'
                }
              `}>
                {/* File Attachment */}
                {message.fileAttachment && (
                  <div className="mb-2 p-2 bg-black/5 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{message.fileAttachment.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({Math.round(message.fileAttachment.size / 1024)}KB)
                      </span>
                    </div>
                  </div>
                )}

                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>

                <div className="flex items-center justify-between mt-2">
                  <div className={`
                    text-xs 
                    ${message.role === 'user'
                      ? 'text-admin-user-message-fg/70'
                      : 'text-muted-foreground'
                    }
                  `}>
                    {formatTime(message.timestamp)}
                  </div>

                  <MessageActions
                    message={message}
                    onRateMessage={onRateMessage}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3 max-w-[80%]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-admin-assistant-message border border-border flex items-center justify-center">
                <Bot size={16} className="text-muted-foreground" />
              </div>
              <div className="bg-admin-assistant-message text-admin-assistant-message-fg rounded-2xl rounded-bl-md px-4 py-3 border border-border">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-white p-6">
        {attachedFile && (
          <div className="mb-4">
            <FileUpload
              onFileUpload={setAttachedFile}
              onRemoveFile={() => setAttachedFile(null)}
              attachedFile={attachedFile}
              disabled={isLoading}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex space-x-3">
          <div className="flex-1 flex items-end gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={agent ? `Ask ${agent.name} anything...` : 'Type your message...'}
              disabled={isLoading}
              className="bg-admin-input-bg border-admin-input-border focus:border-admin-input-focus focus:ring-admin-input-focus/20"
              onKeyDown={(e) => {
                // Prevent file explorer from opening on Ctrl+O, etc.
                if (e.ctrlKey && (e.key === 'o' || e.key === 'O')) {
                  e.preventDefault();
                }
              }}
            />
            {agent?.settings?.enableFileUpload && !attachedFile && (
              <FileUpload
                onFileUpload={setAttachedFile}
                onRemoveFile={() => setAttachedFile(null)}
                attachedFile={null}
                disabled={isLoading}
              />
            )}
          </div>
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
          >
            <Send size={16} />
          </Button>
        </form>
      </div>
    </div>
  );
}
