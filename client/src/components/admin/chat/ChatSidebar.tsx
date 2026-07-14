import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../ui/dialog";
import { toast } from "../../../hooks/use-toast";
import { Search, Plus, Settings, MessageCircle } from "lucide-react";
import { Button } from "../../../ui/button";
import { Label } from "../../../ui/label";
import { Switch } from "../../../ui/switch";
import { Input } from "../../../ui/input";
import { Separator } from "../../../ui/separator";
import { ScrollArea } from "../../../ui/scroll-area";
import { IoFilterSharp } from "react-icons/io5";
import { Chat } from "./chat";
import { ChatListItem } from "./ChatListItem";

interface ChatSidebarProps {
  chats: Chat[];
  selectedChatId?: string;
  onChatSelect: (chatId: string) => void;
  handleNewChat?: () => void;
}

export function ChatSidebar({ selectedChatId, onChatSelect, handleNewChat, chats }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [lastSeen, setLastSeen] = useState(false);
  const [filter, setFilter] = useState<"all" | "group" | "individual">("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);


  const FILTER_OPTIONS = [
    { label: "All", value: "all" },
    { label: "Groups", value: "group" },
    { label: "Individual", value: "individual" },
  ] as const;

  const filteredChats = useMemo(() => {
    return chats
      .filter(chat => {
        // 🔍 search filter
        const matchesSearch =
          (chat.chatName ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (chat.lastMessage ?? "").toLowerCase().includes(searchQuery.toLowerCase());

        // 🎯 type filter
        if (filter === "group") return matchesSearch && chat.isGroup;
        if (filter === "individual") return matchesSearch && !chat.isGroup;

        return matchesSearch; // "all"
      });
  }, [chats, searchQuery, filter]);

  const sortedChats = useMemo(
    () =>
      [...filteredChats].sort(
        (a, b) =>
          new Date(b.updatedAt ?? b.createdAt ?? 0).getTime() -
          new Date(a.updatedAt ?? a.createdAt ?? 0).getTime()
      ),
    [filteredChats]
  );

  const handleSelect = useCallback((id: string) => {
    onChatSelect(id);
  }, [onChatSelect]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  return (
    <div className="w-80 bg-chat-sidebar border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-foreground">Messages</h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleNewChat}>
              <Plus className="h-4 w-4" />
            </Button>
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Chat Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Notifications</h4>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notifications" className="text-sm">Enable notifications</Label>
                      <Switch
                        id="notifications"
                        checked={notifications}
                        onCheckedChange={(checked) => {
                          setNotifications(checked);
                          toast({
                            title: checked ? "Notifications enabled" : "Notifications disabled",
                            description: checked ? "You'll receive message notifications" : "You won't receive message notifications"
                          });
                        }}
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Privacy</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="read-receipts" className="text-sm">Read receipts</Label>
                        <Switch
                          id="read-receipts"
                          checked={readReceipts}
                          onCheckedChange={(checked) => {
                            setReadReceipts(checked);
                            toast({
                              title: checked ? "Read receipts enabled" : "Read receipts disabled",
                              description: checked ? "Others can see when you read messages" : "Others can't see when you read messages"
                            });
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="last-seen" className="text-sm">Show last seen</Label>
                        <Switch
                          id="last-seen"
                          checked={lastSeen}
                          onCheckedChange={(checked) => {
                            setLastSeen(checked);
                            toast({
                              title: checked ? "Last seen visible" : "Last seen hidden",
                              description: checked ? "Others can see when you were last online" : "Others can't see when you were last online"
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-10 pr-3 bg-chat-input border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFilterOpen(prev => !prev);
              }}
              className="h-10 w-10 flex items-center justify-center rounded-md border border-border bg-chat-input hover:bg-accent transition"
            >
              <IoFilterSharp className="h-4 w-4 text-muted-foreground" />
            </button>

            {filterOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-background border border-border rounded-lg shadow-lg z-50">
                {FILTER_OPTIONS.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => {
                      setFilter(opt.value);
                      setFilterOpen(false);
                    }}
                    className={`px-4 py-2 cursor-pointer hover:bg-accent transition ${filter === opt.value ? "bg-accent font-medium" : ""
                      }`}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {sortedChats.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "No conversations found" : "No conversations yet"}
              </p>
            </div>
          ) : (
            sortedChats.map((chat) => (
               <ChatListItem
                key={chat.id}
                chat={chat}
                isSelected={selectedChatId === chat.id}
                onSelect={handleSelect}
              />
            )))}
        </div>
      </ScrollArea>
    </div>
  );
}