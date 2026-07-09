import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { DELETE, GET, getAccessToken, POST, PUT } from '../../../api/api_utility';
import { MessageFromApi } from '../types/chat/message.api';
import { ChatFromApi } from '../types/chat/chat.api';
import axios from "axios";
import { socket, connectSocket } from "../../admin/socket";

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
  text?: string;
  media?: any[];
  type?: string; // ✅ REQUIRED
  location?: { address?: string }; // ✅ REQUIRED
  contact?: { name?: string }; // ✅ REQUIRED
  isOwn: boolean;
  senderName?: string;
  senderAvatar?: string;
  isRead?: boolean;
  status?: "sent" | "delivered" | "read" | "failed";
  createdAt: Date;
  clientId?: string;
}
export interface Chat {
  id: string;
  chatName: string;
  memberCount?: number;
  lastMessage: string;
  unreadCount: number;
  isOnline: boolean;
  chatAvatar?: string;
  isGroup: boolean;
  members?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface User {
  _id: string;
  fullName: string;
  avatar?: string;
  isOnline?: boolean;
}

export interface Member {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  isOnline?: boolean;
  isAdmin?: boolean;
  isYou?: boolean;
}

const Chat = () => {
  const [selectedChatId, setSelectedChatId] = useState<string>();
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const token = getAccessToken();

  const { user } = useAuth();
  console.log(user)
  const currentUserId = (user?._id || user?.id) as string | undefined;


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
        chatName: pendingChat.name,
        lastMessage: "",
        unreadCount: 0,
        isOnline: false,
        isGroup: pendingChat.members.length > 2,
        members: pendingChat.members,
        createdAt: new Date().toISOString(),
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
  // Draft chat: selected but not yet visible in sidebar until first message is sent
  const [draftChat, setDraftChat] = useState<Chat | null>(null);

  function getLastMessagePreview(message: Message): string {
    if (!message) return "";

    switch (message.type) {
      case "text":
        return message.text?.trim() || "New message";

      case "image":
        return message.text
          ? `📷 ${message.text}`
          : "📷 Photo";

      case "video":
        return message.text
          ? `🎥 ${message.text}`
          : "🎥 Video";

      case "audio":
        return "🎵 Audio";

      case "document":
        return message.text
          ? `📄 ${message.text}`
          : "📄 Document";

      case "location":
        return `📍 ${message.location?.address || "Location"}`;

      case "contact":
        return `👤 ${message.contact?.name || "Contact"}`;

      case "sticker":
        return "😊 Sticker";

      case "call":
        return "📞 Call";

      case "system":
        return message.text || "System message";

      default:
        return "New message";
    }
  }
  useEffect(() => {
    if (!currentUserId) return;
    const fetchChats = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL_LOCAL}/api/v1/chat`, { credentials: "include", headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        console.log(data)

        const formatted: Chat[] = data.map((chat: ChatFromApi) => {
          let chatName = chat.chatName;
          let chatAvatar = chat.chatAvatar;
          console.log(chat.members)
          // ✅ ONLY for direct chats
          if (!chat.isGroup) {
            const otherUser = chat.members?.find(
              (m: any) => m._id !== currentUserId
            );
            chatName = otherUser?.fullName || "Unknown";
            chatAvatar = otherUser?.avatar;
          }
          return {
            id: chat.id,
            chatName,
            lastMessage: chat.lastMessagePreview,
            unreadCount:
              chat.unreadCounts?.find(
                (u: any) => (u.user?._id || u.user) === currentUserId
              )?.count || 0,             //later handle this unreadCount in backend
            chatAvatar,
            isGroup: chat.isGroup,
            members: chat.members,
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt || chat.createdAt,
            isOnline: false
          };
        });
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
          { credentials: "include", headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        const formatMessage: Message[] = data.map((msg: MessageFromApi) => ({
          id: msg._id,
          chatID: msg.chatId,
          text: msg.text,
          media: msg.media,
          type: msg.type,
          isOwn: msg.sender?._id === currentUserId,
          senderName: msg.sender?.fullName,
          senderAvatar: msg.sender?.avatar,

          // ✅ FIX readBy
          isRead: msg.readBy?.some(
            (r) => (typeof r.user === "string" ? r.user : r.user._id) === currentUserId
          ),
          status: msg.status,
          createdAt: new Date(msg.createdAt),
        }));
        setMessages(prev => ({ ...prev, [selectedChatId]: formatMessage }));
      } catch (err) {
        console.error("fetchMessages error:", err);
      }
    };
    fetchMessages();
  }, [selectedChatId, currentUserId, token]);

  useEffect(() => {
    if (!selectedChatId || !socket) return;
    socket.emit("MARK_SEEN", {
      chatId: selectedChatId,
      userId: currentUserId,
    });
  }, [selectedChatId]);

  // ✅ SOCKET CONNECTION
  useEffect(() => {

    // if (!currentUserId) {
    //   console.error('User ID is not available.');
    //   return;
    // }

    if (!currentUserId) return; // silently wait

    // ✅ CONNECT SOCKET WITH TOKEN
    connectSocket();

    socket.on("connect", () => {
      console.log("🟢 Connected to socket", socket.id);
      setIsConnected(true);
    });
    socket.on("disconnect", () => {
      console.log("🔴 Disconnected from socket");
      setIsConnected(false);
    });

    // Listen for icoming messages or Receive message
    socket.on(EVENTS.NEW_MESSAGE, ({ chatId, message, chat: incomingChat }) => {
      const realChatId = chatId.toString();
      const formatted: Message = {
        id: message._id,
        text: message.text,
        type: message.type,
        media: message.media,
        isOwn: String(message.sender?._id) === String(currentUserId),
        senderName: message.sender?.fullName,
        senderAvatar: message.sender?.avatar,
        //isRead: isActiveChat,
        status: "sent",
        createdAt: new Date(message.createdAt),
        clientId: message.clientId,
      };

      // Update messages — migrate any pending temp entry to real chatId
      setMessages((prev) => {
        const next: Record<string, Message[]> = { ...prev };
        const existing = next[realChatId] ?? [];
        let updated = [...existing];

        // ✅ STEP 1: FIND MATCHING OPTIMISTIC MESSAGE
        const index = updated.findIndex(
          (m) =>
            m.clientId &&
            message.clientId &&
            m.clientId === message.clientId
        );

        if (index !== -1) {
          // ✅ REPLACE (NOT ADD)
          updated[index] = {
            ...updated[index],
            id: message._id,
            createdAt: new Date(message.createdAt),
            status: "sent",
          };
        } else {
          // ✅ NORMAL MESSAGE (OTHER USER)
          const alreadyExists = updated.some((m) => m.id === message._id);
          if (!alreadyExists) { updated.push(formatted); }
        }
        next[realChatId] = updated;
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
      // 🔥 FIXED CHAT SIDEBAR LOGIC
      setChats((prev) => {
        const exists = prev.find((c) => c.id === realChatId);
        const tempChat = prev.find((c) => c.id.startsWith("temp"));

        // ✅ CASE 1: replace temp chat (YOUR BUG FIX)
        if (!exists && tempChat) {
          let chatName = tempChat.chatName;
          let chatAvatar = tempChat.chatAvatar;

          if (!incomingChat?.isGroup) {
            const otherUser = incomingChat?.members?.find(
              (m: any) => (m._id ?? m) !== currentUserId
            );
            chatName = otherUser?.fullName || chatName;
            chatAvatar = otherUser?.avatar || chatAvatar;
          }

          const updated = prev.map((c) =>
            c.id === tempChat.id
              ? {
                ...c,
                id: realChatId,
                chatName,
                chatAvatar,
                lastMessage: message.text || "New message",
                updatedAt: message.createdAt,
              }
              : c
          );

          const target = updated.find((c) => c.id === realChatId)!;
          return [target, ...updated.filter((c) => c.id !== realChatId)];
        }
        // ✅ CASE 2: new incoming chat (someone messaged first)
        if (!exists) {
          let chatName = "Unknown";
          let chatAvatar = "";

          if (incomingChat?.isGroup) {
            chatName = incomingChat.chatName || "Group";
          } else {
            // ✅ FIX: find the OTHER user (not current user)
            const otherUser = incomingChat?.members?.find(
              (m: any) => (m._id ?? m) !== currentUserId
            );

            chatName = otherUser?.fullName || "Unknown";
            chatAvatar = otherUser?.avatar || "";
          }

          const newChat: Chat = {
            id: realChatId,
            chatName,
            chatAvatar,
            lastMessage: message.text || "New message",
            unreadCount: 1,
            isOnline: false,
            isGroup: incomingChat?.isGroup ?? false,
            members: incomingChat?.members?.map((m: any) => m._id ?? m),
            createdAt: incomingChat?.createdAt,
          };
          return [newChat, ...prev];
        }
        // ✅ CASE 3: normal update
        const updated = prev.map((c) =>
          c.id === realChatId
            ? {
              ...c,
              lastMessage: message.text || "New message",
              updatedAt: message.createdAt,
            }
            : c
        );

        const target = updated.find((c) => c.id === realChatId)!;
        return [target, ...updated.filter((c) => c.id !== realChatId)];
      });
    });

    // ✅ ALERT (unread count)
    // Only increment unread for chats that are NOT currently selected
    socket.on(EVENTS.NEW_MESSAGE_ALERT, ({ chatId }) => {
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

    // ── Online users ──────────────────
    socket.on(EVENTS.ONLINE_USERS, (users: string[]) => {
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
    socket.on("error", (err: { message: string }) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off(EVENTS.NEW_MESSAGE);
      socket.off(EVENTS.NEW_MESSAGE_ALERT);
      socket.off(EVENTS.ONLINE_USERS);
      socket.off("error");
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]); // only re-run if user changes


  // ─── Emit CHAT_JOINED / CHAT_LEAVED on chat switch ────────────────────────
  const prevChatRef = useRef<string | undefined>();
  useEffect(() => {
    if (!socket) return;

    const prevId = prevChatRef.current;
    const prevChat = chats.find((c) => c.id === prevId);

    // Leave previous chat
    if (prevId && prevChat) {
      socket.emit(EVENTS.CHAT_LEAVED, {
        userId: currentUserId,
        members: prevChat.members ?? [],
      });
    }

    // Join new chat
    if (selectedChatId && selectedChat) {
      socket.emit(EVENTS.CHAT_JOINED, {
        userId: currentUserId,
        members: selectedChat.members ?? [],
        chatId: selectedChatId,
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

  // fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await GET("/api/v1/chat/users");
        //if (!res.data.ok) { throw new Error("Failed to fetch users"); }
        console.log("users list:" + res.data)

        setAllUsers(res.data?.users || []); // make sure backend returns array
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
      user?.fullName?.toLowerCase().includes(searchQuery?.toLowerCase())
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
    if (creatingChat) return; // 🔒 prevent double click
    setCreatingChat(true);

    try {
      if (!contacts?.length) {
        throw new Error("No users selected");
      }

      // 🔥 normalize member IDs safely
      const memberIds: string[] = contacts
        .map((c) => c?._id || c)
        .filter(Boolean);

      if (!memberIds.length) {
        throw new Error("Invalid users");
      }

      // ✅ CHECK IF INDIVIDUAL CHAT ALREADY EXISTS
      if (chatType === "individual") {
        const targetUserId = memberIds[0];
        // Check if chat already exists
        const existing = chats.find(
          (c) =>
            !c.isGroup &&
            c.members?.length === 2 &&
            c.members.includes(targetUserId)
        );

        if (existing) {
          setSelectedChatId(existing.id);
          return;
        }

        // Create temp chat (no API call — chat created on first message)
        const tempId = `temp-${Date.now()}`;
        const contactName = contacts[0]?.fullName ?? "Unknown User";

        setPendingChat({ id: tempId, name: contactName, members: [currentUserId!, targetUserId] });
        setMessages((prev) => ({ ...prev, [tempId]: [] }));
        setSelectedChatId(tempId);

        toast({ title: "Chat Ready", description: "Send a message to start the conversation" });
        return;
      }

      //  group chat
      if (chatType === "group") {
        const trimmedName = groupName.trim();
        // ❌ prevent empty group name
        if (!trimmedName) {
          toast({ title: "Group name required", variant: "destructive" });
          setCreatingChat(false);
          return;
        }

        if (memberIds.length < 2) {
          toast({ title: "Select at least 2 users", variant: "destructive" });
          setCreatingChat(false);
          return;
        }
        console.log("this is group chat")

        // 🔥 API call using axios utility
        const { data } = await POST("/api/v1/chat/newgroup", {
          members: memberIds, name: trimmedName,
        });

        const chat = data.data;
        console.log("chat:" + chat)

        if (!chat?._id) {
          throw new Error("Invalid server response");
        }

        const formatted: Chat = {
          id: chat._id,
          chatName: chat.chatName,
          lastMessage: "",
          unreadCount: 0,
          isOnline: false,
          isGroup: true,
          chatAvatar: chat.groupIcon?.url || "",
          members: chat.members.map((m: any) => m._id),
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
        };

        setChats((prev) => [formatted, ...prev]);
        setMessages((prev) => ({ ...prev, [formatted.id]: [] }));
        setSelectedChatId(formatted.id);

        toast({ title: "Group Created", description: `Group ${trimmedName} created with ${contacts.length} members` });
        setShowUsersModal(false);
        setGroupName("");
        setSelectedUsers([]);
      }
    } catch (error: any) {
      // 🔥 Axios-aware error handling
      let message = "Something went wrong";

      if (axios.isAxiosError(error)) {
        message =
          error.response?.data?.message ||
          error.message ||
          message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      toast({ title: "Error", description: "Failed to create group", variant: "destructive" });
    } finally {
      setCreatingChat(false);
      setGroupName("");
      setSelectedUsers([]);
    }
  };

  // const handleBackFromContacts = () => {
  //   setShowUsersModal(false);
  //   setNewChatOpen(true);
  // };


  // ─── Current messages for selected chat ──────────────────────────────────
  const currentMessages = useMemo(
    () => (selectedChatId ? (messages[selectedChatId] ?? []) : []),
    [messages, selectedChatId]
  );

  console.log(chats.map(c => c.id));

  const handleAddMembers = async (chatId: string, newMembers: Member[]) => {
    try {
      await axios.post("/api/chat/add-members", { chatId, newMembers });
      socket?.emit("refreshChats");
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveMember = async (chatId: string, memberId: string) => {
    try {
      await axios.post("/api/chat/remove-member", { chatId, memberId });
      socket?.emit("refreshChats");
    } catch (err) {
      console.error(err);
    }
  };

  const updateChat = (chatId: string, updater: (c: Chat) => Chat) => {
    setDraftChat(prev => (prev && prev.id === chatId ? updater(prev) : prev));
  };


  const handleLeaveGroup = async (chatId: string) => {
    try {
      await DELETE(`/api/v1/chat/leave/${chatId}`);

      // ✅ Remove chat from sidebar
      setChats((prev) => prev.filter((c) => c.id !== chatId));

      // ✅ Remove messages
      setMessages((prev) => {
        const updated = { ...prev };
        delete updated[chatId];
        return updated;
      });

      // ✅ Reset selected chat if needed
      setSelectedChatId((prev) =>
        prev === chatId ? undefined : prev
      );

      // ✅ Notify others (optional, backend already emits usually)
      socket?.emit("REFETCH_CHATS");

      toast({
        title: "Left Group",
        description: "You left the group successfully",
      });

    } catch (err) {
      console.error("Leave group error:", err);
      toast({
        title: "Error",
        description: "Failed to leave group",
        variant: "destructive",
      });
    }
  };


  const handleRenameGroup = async (chatId: string, name: string) => {
    try {
      if (!name.trim()) {
        return toast({
          title: "Invalid name",
          description: "Group name cannot be empty",
          variant: "destructive",
        });
      }

      await PUT(`/api/v1/chat/rename/${chatId}`, { name });

      // ✅ Optimistic UI update
      updateChat(chatId, (c) => ({ ...c, name }));
      // or
      //setChats((prev) => prev.map((c) => c.id === chatId ? { ...c, chatName: name } : c));

      socket?.emit("REFETCH_CHATS");

      toast({
        title: "Success",
        description: "Group renamed successfully",
      });

    } catch (err) {
      console.error("Rename error:", err);
      toast({
        title: "Error",
        description: "Failed to rename group",
        variant: "destructive",
      });
    }
  };

  const handleToggleAdmin = async (chatId: string, memberId: string) => {
    try {
      await axios.post("/api/chat/toggle-admin", {
        chatId,
        memberId,
      });

      // optional optimistic update
      updateChat(chatId, (c) => ({
        ...c,
        members: (c.members ?? []).map((m) =>
          m.id === memberId ? { ...m, isAdmin: !m.isAdmin } : m
        ),
      }));

      socket?.emit("REFETCH_CHATS");

    } catch (err) {
      console.error(err);
    }
  };

  // const promoteDraftIfNeeded = (content: string) => {
  //   if (draftChat && draftChat.id === selectedChatId) {
  //     const promoted: Chat = {
  //       ...draftChat,
  //       lastMessage: content,
  //       timestamp: 'now',
  //     } as Chat;
  //     setExtraChats(prev => [promoted, ...prev]);
  //     setDraftChat(null);
  //   }
  // };


  // ✅ SEND MESSAGE (SOCKET ONLY)
  const handleSendMessage = useCallback(
    async (payload: { text?: string; files?: File[] }) => {
      if (!selectedChatId || !socket) return;

      const text = payload.text?.trim();
      const files = payload.files;

      if (!text && (!files || files.length === 0)) return;

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
      const clientId = `client-${Date.now()}`;

      let uploadedMedia: any[] = [];

      // ✅ UPLOAD FIRST (IMPORTANT)
      if (files && files.length > 0) {
        const formData = new FormData();

        files.forEach((file) => {
          formData.append("media", file);
        });

        const res = await fetch("/api/v1/upload/chat-media", {
          method: "POST",
          body: formData,
        });

        uploadedMedia = await res.json();
      }

      // ✅ DETECT TYPE
      let type = "text";
      let isMixedMedia = false;

      if (uploadedMedia.length > 0) {
        const types = uploadedMedia.map((m: any) => m.type);
        const allSame = types.every((t) => t === types[0]);

        type = types[0];
        if (!allSame) isMixedMedia = true;
      }

      const messagePayload = {
        text: text || "",
        media: uploadedMedia,
        type,
        isMixedMedia,
        clientId,
      };

      const optimistic: Message = {
        id: tempMsgId,
        text,
        media: uploadedMedia,
        type: messagePayload.type,
        createdAt: new Date(),
        isOwn: true,
        senderName: user?.fullName ?? "You",
        status: "sent",
        clientId,
      };

      setMessages((prev) => ({
        ...prev,
        [selectedChatId]: [...(prev[selectedChatId] ?? []), optimistic],
      }));

      // Emit to server - send only OTHER members
      socket.emit(EVENTS.NEW_MESSAGE, {
        chatId: selectedChatId.startsWith("temp") ? null : selectedChatId,
        members: otherMembers,
        message: messagePayload,
        groupName: selectedChat?.isGroup ? selectedChat.chatName : undefined,
      });
    },
    [selectedChatId, selectedChat, pendingChat, currentUserId, user]
  );

  console.log("ALL USERS:", allUsers);
  console.log("FILTERED USERS:", filteredUsers);

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
      onAddMembers={handleAddMembers}
      onRemoveMember={handleRemoveMember}
      onLeaveGroup={handleLeaveGroup}
      onRenameGroup={handleRenameGroup}
      onToggleAdmin={handleToggleAdmin}
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
                        <AvatarImage src={user.avatar} alt={user.fullName} />
                        <AvatarFallback>
                          {user.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1"><p className="text-sm font-medium text-foreground truncate">{user.fullName}</p></div>
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
