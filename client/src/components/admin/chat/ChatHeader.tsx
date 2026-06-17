import { Phone, Video, MoreVertical, Users, UserMinus, Volume2, Search, Archive } from "lucide-react";
import { toast } from "../../../hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { Button } from "../../../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../../ui/dropdown-menu";

interface ChatHeaderProps {
  chatName: string;
  isOnline?: boolean;
  isGroup?: boolean;
  memberCount?: number;
  chatAvatar?: string;
}

export function ChatHeader({ chatName, isOnline, isGroup, memberCount, chatAvatar }: ChatHeaderProps) {
  const handleCall = () => {
    toast({
      title: "Voice Call",
      description: `Starting voice call with ${chatName}...`
    });
  };

  const handleVideoCall = () => {
    toast({
      title: "Video Call", 
      description: `Starting video call with ${chatName}...`
    });
  };

  const handleSearch = () => {
    toast({
      title: "Search Chat",
      description: "Opening search in conversation..."
    });
  };

  const handleMute = () => {
    toast({
      title: "Notifications Muted",
      description: `Muted notifications for ${chatName}`
    });
  };

  const handleBlock = () => {
    toast({
      title: "User Blocked",
      description: `Blocked ${chatName}`
    });
  };

  const handleArchive = () => {
    toast({
      title: "Chat Archived",
      description: `Archived conversation with ${chatName}`
    });
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={chatAvatar} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {isGroup ? (
                <Users className="h-5 w-5" />
              ) : (
                chatName.split(' ').map(n => n[0]).join('')
              )}
            </AvatarFallback>
          </Avatar>
          {isOnline && !isGroup && (
            <div className="absolute -bottom-0 -right-0 w-3 h-3 bg-green-600 rounded-full border-2 border-chat-sidebar"></div>
          )}
        </div>
        
        <div>
          <h2 className="font-semibold text-foreground">{chatName}</h2>
          <p className="text-sm text-muted-foreground">
            {isGroup ? (
              `${memberCount} members`
            ) : (
              isOnline ? "Online" : "Last seen recently"
            )}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={handleCall}>
          <Phone className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleVideoCall}>
          <Video className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search in chat
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleMute}>
              <Volume2 className="h-4 w-4 mr-2" />
              Mute notifications
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleArchive}>
              <Archive className="h-4 w-4 mr-2" />
              Archive chat
            </DropdownMenuItem>
            {!isGroup && (
              <DropdownMenuItem onClick={handleBlock} className="text-destructive">
                <UserMinus className="h-4 w-4 mr-2" />
                Block user
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}