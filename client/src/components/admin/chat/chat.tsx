import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import io from 'socket.io-client';
import { ChatSidebar } from './ChatSidebar';
import { ChatArea } from './ChatArea';
import { toast } from "../../../hooks/use-toast";
import "./chat.css"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../ui/dialog";
import { Search, UserPlus, Users2, Loader2 } from "lucide-react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { ScrollArea } from "../../../ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { useAuth } from '../../../context/authContext';
import { current } from '@reduxjs/toolkit';
import { getAccessToken } from '../../../api/api_utility';

const EVENTS = {
  NEW_MESSAGE: "NEW_MESSAGE",
  NEW_MESSAGE_ALERT: "NEW_MESSAGE_ALERT",
  START_TYPING: "START_TYPING",
  STOP_TYPING: "STOP_TYPING",
  CHAT_JOINED: "CHAT_JOINED",
  CHAT_LEAVED: "CHAT_LEAVED",
  ONLINE_USERS: "ONLINE_USERS",
};
interface Message {
  id: string;
  chatID?: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
  senderName?: string;
  senderAvatar?: string;
  isRead?: boolean;
  status?: "sending" | "sent" | "failed";
}
export interface Chat {
  id: string;
  name: string;
  memberCount?: number;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  avatar?: string;
  isGroup: boolean;
  members?: string[];
}

interface User {
  _id: string;
  name: string;
  avatar?: string;
  isOnline?: boolean;
}


const Chat = () => {
  // ✅ Infer the correct type from the io() return
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  const [selectedChatId, setSelectedChatId] = useState<string>();
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const token = getAccessToken(); 

  const { user } = useAuth();
  console.log(user)
  const currentUserId = user?.id as string | undefined;

  // Pending chat = a temp chat that has no DB id yet
  const [pendingChat, setPendingChat] = useState<{
    id: string;
    name: string;
    members: string[];
  } | null>(null);

  // Derive selectedChat from chats list OR pendingChat
  const selectedChat = useMemo(() => {
    const found = chats.find((c) => c.id === selectedChatId);
    if (found) return found;
    if (pendingChat && selectedChatId === pendingChat.id) {
      return {
        id: pendingChat.id,
        name: pendingChat.name,
        lastMessage: "",
        timestamp: new Date().toISOString(),
        unreadCount: 0,
        isOnline: false,
        isGroup: pendingChat.members.length > 2,
        members: pendingChat.members,
      } as Chat;
    }
    return null;
  }, [chats, selectedChatId, pendingChat]);

  // Dialog state
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [chatType, setChatType] = useState<"individual" | "group">("individual");
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [creatingChat, setCreatingChat] = useState(false);

  console.log(isConnected)

  useEffect(() => {
    if (!currentUserId) return;
    const fetchChats = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL_LOCAL}/api/v1/chat`, { credentials: "include", headers: {Authorization: `Bearer ${token}`}});
        const data = await res.json();

        const formatted: Chat[] = data.map((chat: any) => ({
          id: chat._id,
          name: chat.isGroup
            ? chat.chatName
            : chat.members.find((m: any) => m._id !== currentUserId)?.fullName ?? "Unknown",
          lastMessage: chat.lastMessage?.content ?? "",
          timestamp: chat.updatedAt,
          unreadCount: 0,
          isOnline: false,
          avatar: chat.members.find((m: any) => m._id !== currentUserId)?.avatar,
          isGroup: chat.isGroup,
          members: chat.members.map((m: any) => m._id),
        }));

        setChats(formatted);
      } catch (err) {
        console.error("fetchChats error:", err);
      }
    };

    fetchChats();
  }, [currentUserId, token]);

  // fetch messages when a real chat is selected
  useEffect(() => {
    if (!selectedChatId || selectedChatId.startsWith("temp")) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL_LOCAL}/api/v1/chat/messages/${selectedChatId}`,
          { credentials: "include", headers: {Authorization: `Bearer ${token}`} }
        );
        const data = await res.json();

        const formatMessage: Message[] = data.map((msg: any) => ({
          id: msg._id,
          content: msg.content,
          timestamp: new Date(msg.createdAt),
          isOwn: msg.sender._id === currentUserId,
          senderName: msg.sender.fullName,
          senderAvatar: msg.sender.avatar,
          isRead: msg.readby?.includes(currentUserId),
          status: "sent" as const,
        }));

        setMessages(prev => ({ ...prev, [selectedChatId]: formatMessage }));
      } catch (err) {
        console.error("fetchMessages error:", err);
      }
    };

    fetchMessages();
  }, [selectedChatId, currentUserId, token]);


  // ✅ SOCKET CONNECTION
  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL_LOCAL as string;

    if (!backendUrl) {
      console.error('Backend URL is not defined.');
      return;
    }
    if (!currentUserId) {
      console.error('User ID is not available.');
      return;
    }

    socketRef.current = io(backendUrl + "/admin", {
      auth: {
        token, 
      },
      withCredentials: true, // Add this at the top level
      transports: ["websocket", "polling"], // Add polling as fallback
      transportOptions: {
        websocket: {
          withCredentials: true,
        },
      },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });


    const sock = socketRef.current;

    sock.on("connect", () => {
      console.log("🟢 Connected to socket", sock.id);
      setIsConnected(true);
    });
    sock.on("disconnect", () => {
      console.log("🔴 Disconnected from socket");
      setIsConnected(false);
    });

    sock.emit("MARK_SEEN", {
    chatId: selectedChatId,
    userId: currentUserId,
  });

    // Listen for icoming messages or Receive message
    sock.on(EVENTS.NEW_MESSAGE, ({ chatId, message, chat: incomingChat }) => {
      const realChatId = chatId.toString();

      const formatted: Message = {
        id: message._id,
        content: message.content,
        timestamp: new Date(message.createdAt),
        isOwn: message.sender._id === currentUserId,
        senderName: message.sender.fullName,
        senderAvatar: message.sender.avatar,
        //isRead: isActiveChat,
        status: "sent",
      };

      // Update messages — migrate any pending temp entry to real chatId
      setMessages((prev) => {
        const next: Record<string, Message[]> = {};

        for (const [key, val] of Object.entries(prev)) {
          if (key.startsWith("temp")) {
            // Replace temp key with real chatId
            next[realChatId] = [
              ...(next[realChatId] ?? []),
              ...val.filter((m) => !m.id.startsWith("temp")), // drop optimistic dupes
            ];
          } else {
            next[key] = val;
          }
        }

        // Deduplicate then append
        const existing = next[realChatId] ?? [];
        if (existing.some((m) => m.id === formatted.id)) return next;
        next[realChatId] = [...existing, formatted];
        return next;
      });

      // If selectedChatId was temp → update it to real
      setSelectedChatId((prev) => {
        if (prev?.startsWith("temp")) return realChatId;
        return prev;
      });

      // Clear pendingChat once we have a real id
      setPendingChat(null);

      // Update chats sidebar
      setChats((prev) => {
        const exists = prev.find((c) => c.id === realChatId);

        if (!exists) {
          // New chat arriving (e.g. someone messaged us first)
          const newChat: Chat = {
            id: realChatId,
            name:
              incomingChat?.chatName ||
              message.sender.fullName ||
              "Unknown",
            lastMessage: message.content,
            timestamp: new Date().toISOString(),
            unreadCount: 1,
            isOnline: false,
            isGroup: incomingChat?.isGroup ?? false,
            members: incomingChat?.members?.map((m: any) =>
              m._id ?? m
            ),
          };
          return [newChat, ...prev];
        }

        // Update existing — bring to top
        const updated = prev.map((c) =>
          c.id === realChatId
            ? {
              ...c,
              lastMessage: message.content,
              timestamp: new Date().toISOString(),
              // unread only for non-active chats; handled below via selectedChatId
            }
            : c
        );
        const target = updated.find((c) => c.id === realChatId)!;
        return [target, ...updated.filter((c) => c.id !== realChatId)];
      });
    });

    // ✅ ALERT (unread count)
    // Only increment unread for chats that are NOT currently selected
    sock.on(EVENTS.NEW_MESSAGE_ALERT, ({ chatId }) => {
      setSelectedChatId((activeChatId) => {
        if (activeChatId !== chatId.toString()) {
          setChats((prev) =>
            prev.map((c) =>
              c.id === chatId.toString()
                ? { ...c, unreadCount: c.unreadCount + 1 }
                : c
            )
          );
        }
        return activeChatId;
      });
    });

    // ── Online users ────────────────────────────────────────────────────────
    sock.on(EVENTS.ONLINE_USERS, (users: string[]) => {
      setOnlineUsers(users);
      setChats((prev) =>
        prev.map((c) => ({
          ...c,
          isOnline: !c.isGroup && c.members
            ? c.members.some(
              (id) => id !== currentUserId && users.includes(id)
            )
            : false,
        }))
      );
    });

    // ✅ ERROR HANDLING
    sock.on("error", (err: { message: string }) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    });

    return () => {
      sock.off("connect");
      sock.off("disconnect");
      sock.off(EVENTS.NEW_MESSAGE);
      sock.off(EVENTS.NEW_MESSAGE_ALERT);
      sock.off(EVENTS.ONLINE_USERS);
      sock.off("error");
      sock.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]); // only re-run if user changes


  // ─── Emit CHAT_JOINED / CHAT_LEAVED on chat switch ────────────────────────
  const prevChatRef = useRef<string | undefined>();
  useEffect(() => {
    if (!socketRef.current) return;

    const prevId = prevChatRef.current;
    const prevChat = chats.find((c) => c.id === prevId);

    // Leave previous chat
    if (prevId && prevChat) {
      socketRef.current.emit(EVENTS.CHAT_LEAVED, {
        userId: currentUserId,
        members: prevChat.members ?? [],
      });
    }

    // Join new chat
    if (selectedChatId && selectedChat) {
      socketRef.current.emit(EVENTS.CHAT_JOINED, {
        userId: currentUserId,
        members: selectedChat.members ?? [],
      });

      // Clear unread for this chat
      setChats((prev) =>
        prev.map((c) =>
          c.id === selectedChatId ? { ...c, unreadCount: 0 } : c
        )
      );
    }

    prevChatRef.current = selectedChatId;
  }, [selectedChatId]); // eslint-disable-line react-hooks/exhaustive-deps  

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await fetch("http://localhost:8080/api/v1/chat/users", { credentials: "include" });

        if (!res.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await res.json();

        setAllUsers(data.users); // make sure backend returns array
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({ title: "Error", description: "Failed to load users" });
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // useEffect(() => {
  //   //Auto scroll to bottom when new message arrives
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth"})
  // },[chat])


  const handleCreateIndividualChat = () => {
    setNewChatOpen(false);
    setShowUsersModal(true);
    setSelectedUsers([]);
    setSearchQuery("");
    setGroupName("");
    setChatType("individual")
    toast({
      title: "New Individual Chat",
      description: "Creating a new individual conversation..."
    });
  };

  const handleCreateGroupChat = () => {
    setNewChatOpen(false);
    setShowUsersModal(true);
    setSelectedUsers([]);
    setSearchQuery("");
    setGroupName("");
    setChatType("group")
    toast({
      title: "New Group Chat",
      description: "Creating a new group conversation..."
    });
  };

  // 🔍 Filtered users based on search
  const filteredUsers = useMemo(() => {
    return allUsers.filter((user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allUsers]);

  // ✅ Select/unselect logic
  const toggleUser = (id: string) => {
    if (chatType === "individual") {
      setSelectedUsers([id]);
    } else {
      setSelectedUsers((prev) =>
        prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
      );
      //      // or
      // if (selectedUsers.includes(id)) {
      //   setSelectedUsers(selectedUsers.filter((u) => u !== id));
      // } else {
      //   setSelectedUsers([...selectedUsers, id]);
      // }
    }
  };


  const handleUsersSelected = async (contacts: any[]) => {
    setCreatingChat(true);

    // 🔥 normalize member IDs
    const memberIds = contacts.map((c) => c._id || c);

    // ✅ CHECK IF INDIVIDUAL CHAT ALREADY EXISTS
    if (chatType === "individual") {
      // Check if chat already exists
      const existing = chats.find(
        (c) =>
          !c.isGroup &&
          c.members?.length === 2 &&
          c.members.includes(memberIds[0])
      );

      if (existing) {
        setSelectedChatId(existing.id);
        setCreatingChat(false);
        setShowUsersModal(false);
        return;
      }

      // Create temp chat (no API call — chat created on first message)
      const tempId = `temp-${Date.now()}`;
      const contactName =
        contacts[0]?.name ?? "Unknown User";

      setPendingChat({ id: tempId, name: contactName, members: [currentUserId!, memberIds[0]] });
      setMessages((prev) => ({ ...prev, [tempId]: [] }));
      setSelectedChatId(tempId);
      setCreatingChat(false);
      setShowUsersModal(false);

      toast({ title: "Chat Ready", description: "Send a message to start the conversation" });
      return;
    }

    //  group chat
    if (chatType === "group") {
      // ❌ prevent empty group name
      if (!groupName.trim()) {
        toast({ title: "Group name required", variant: "destructive" });
        setCreatingChat(false);
        return;
      }

      const memberIds = contacts.map((c) => c._id || c);

      // 🚀 MULTI USERS → TEMP GROUP CHAT
      if (memberIds.length > 1) {
        const tempId = `temp-${Date.now()}`;

        setPendingChat({
          id: tempId,
          name: "New Group",
          members: [currentUserId!, ...memberIds],
        });

        setMessages((prev) => ({ ...prev, [tempId]: [] }));
        setSelectedChatId(tempId);

        setCreatingChat(false);
        setShowUsersModal(false);

        toast({
          title: "Group Ready",
          description: "Send a message to create the group",
        });

        return;
        // try {
        //   const res = await fetch(
        //     `${import.meta.env.VITE_BACKEND_URL_LOCAL}/api/chats/newgroup`,
        //     {
        //       method: "POST",
        //       headers: { "Content-Type": "application/json" },
        //       credentials: "include",
        //       body: JSON.stringify({ isGroup: true, members: memberIds, name: groupName }),
        //     }
        //   );

        //   if (!res.ok) throw new Error("Failed to create group");

        //   const result = await res.json();
        //   const chat = result.data;

        //   const formatted: Chat = {
        //     id: chat._id,
        //     name: chat.chatName ?? groupName ?? "Unnamed Group",
        //     lastMessage: "",
        //     timestamp: chat.updatedAt,
        //     unreadCount: 0,
        //     isOnline: false,
        //     isGroup: true,
        //     members: chat.members.map((m: any) => m._id ?? m),
        //   };

        //   setChats((prev) => [formatted, ...prev]);
        //   setMessages((prev) => ({ ...prev, [formatted.id]: [] }));
        //   setSelectedChatId(formatted.id);

        //   toast({ title: "Group Created", description: `Group created with ${contacts.length} members` });
        // } catch {
        //   toast({ title: "Error", description: "Failed to create group", variant: "destructive" });
        // } 
        // finally {
        // setCreatingChat(false);
        // setShowUsersModal(false);
        // setGroupName("");
        // setSelectedUsers([]);
        // }
      }
    }
  };

  // const handleBackFromContacts = () => {
  //   setShowUsersModal(false);
  //   setNewChatOpen(true);
  // };


  // ✅ SEND MESSAGE (SOCKET ONLY)
  const handleSendMessage = useCallback(
    (content: string) => {
      if (!selectedChatId || !socketRef.current || !content.trim()) return;

      // Get members from selected chat or pending chat
      let members: string[] = [];

      if (selectedChat?.members) {
        members = selectedChat.members;
      } else if (pendingChat?.members) {
        members = pendingChat.members;
      }

      // Ensure we have the other member(s) to send to
      const otherMembers = members.filter((id: string) => id !== currentUserId);

      if (otherMembers.length === 0) {
        console.error("No recipients for message");
        return;
      }

      // Optimistic message
      const tempMsgId = `temp-msg-${Date.now()}`;
      const optimistic: Message = {
        id: tempMsgId,
        content: content.trim(),
        timestamp: new Date(),
        isOwn: true,
        senderName: user?.fullName ?? "You",
        status: "sending",
      };

      setMessages((prev) => ({
        ...prev,
        [selectedChatId]: [...(prev[selectedChatId] ?? []), optimistic],
      }));

      // Emit to server - send only OTHER members
      socketRef.current.emit(EVENTS.NEW_MESSAGE, {
        chatId: selectedChatId.startsWith("temp") ? null : selectedChatId,
        members: otherMembers,
        message: content.trim(),
        groupName: selectedChat?.isGroup ? selectedChat.name : undefined,
      });
    },
    [selectedChatId, selectedChat, pendingChat, currentUserId, user]
  );


  // ─── Current messages for selected chat ──────────────────────────────────
  const currentMessages = useMemo(
    () => (selectedChatId ? (messages[selectedChatId] ?? []) : []),
    [messages, selectedChatId]
  );

  return <div className="h-[calc(100vh-4rem)] flex bg-background">
    <ChatSidebar
      chats={chats}
      selectedChatId={selectedChatId}
      onChatSelect={(id) => { setSelectedChatId(id); }}
      handleNewChat={() => setNewChatOpen(true)}
    />
    <ChatArea
      selectedChat={selectedChat}
      messages={currentMessages}
      selectedChatId={selectedChatId}
      onSendMessage={handleSendMessage}
      handleNewChat={() => setNewChatOpen(true)}
      socketRef={socketRef}
    />
    {/* New Chat Dialog */}
    <Dialog open={newChatOpen} onOpenChange={setNewChatOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start New Chat</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Button
            onClick={handleCreateIndividualChat}
            className="w-full justify-start"
            variant="outline"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Start Individual Chat
          </Button>
          <Button
            onClick={handleCreateGroupChat}
            className="w-full justify-start"
            variant="outline"
          >
            <Users2 className="h-4 w-4 mr-2" />
            Create Group Chat
          </Button>
        </div>
      </DialogContent>
    </Dialog>


    {/* New Chat Dialog */}
    <Dialog open={showUsersModal} onOpenChange={setShowUsersModal}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle>
            {chatType === "individual" ? "Start New Chat" : "Create Group Chat"}
          </DialogTitle>
        </DialogHeader>

        {/* 🧠 Group name input */}
        {chatType === "group" && (
          <div className="mb-3">
            <Input
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
        )}

        {/* 🔍 Search bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* 👥 User list */}
        <ScrollArea className="h-64 border rounded-lg">
          <div className="divide-y divide-border">
            {loadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading users...</span>
              </div>
            ) :
              filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground text-sm">
                  No users found
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = selectedUsers.includes(user._id);
                  return (
                    <div
                      key={user._id}
                      className={`flex items-center gap-3 p-3 cursor-pointer transition-all ${isSelected
                        ? "bg-primary/10 hover:bg-primary/20"
                        : "hover:bg-accent"
                        }`}
                      onClick={() => toggleUser(user._id)}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1"><p className="text-sm font-medium text-foreground truncate">{user.name}</p></div>
                      {isSelected && (<span className="text-primary font-semibold text-xs"> ✓</span>)}
                    </div>
                  );
                })
              )}
          </div>
        </ScrollArea>
        <Button className="w-full mt-4"
          onClick={() => {
            const selectedContacts = allUsers.filter(user =>
              selectedUsers.includes(user._id)
            );
            handleUsersSelected(selectedContacts);
          }}
          disabled={creatingChat}>
          {creatingChat ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          {chatType === "individual" ? "Start Chat" : "Create Group"}
        </Button>
      </DialogContent>
    </Dialog>
  </div>
};

export default Chat;
