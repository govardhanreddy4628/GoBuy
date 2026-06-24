// import React, { useState, useRef, useEffect } from "react";
// import { ChatMessage } from "./ChatMessage";
// import { ChatInput } from "./ChatInput";
// import { QuickActions } from "./QuickActions";
// import { TypingIndicator } from "./TypingIndicator";
// import { Trash2, MessageSquare } from "lucide-react";
// import { useToast } from "../../hooks/use-toast";
// import { Button } from "../../ui/button";
// import { ScrollArea } from "../../ui/scroll-area";


// interface Message {
//   id: string;
//   content: string;
//   isUser: boolean;
//   timestamp: Date;
// }

// // Mock AI responses for ecommerce scenarios
// const getAIResponse = (userMessage: string): string => {
//   const message = userMessage.toLowerCase();

//   if (message.includes("order") && message.includes("status")) {
//     return "I'd be happy to help you check your order status! To look up your order, I'll need your order number or the email address you used to place the order. You can find your order number in your confirmation email.\n\nAlternatively, if you're logged into your account, you can view all your orders in the 'My Orders' section of your account dashboard.";
//   }

//   if (message.includes("recommend") || message.includes("product")) {
//     return "I'd love to help you find the perfect products! To give you the best recommendations, could you tell me:\n\n• What type of product are you looking for?\n• What's your budget range?\n• Any specific features or preferences?\n\nBased on your preferences, I can suggest our top-rated items, current bestsellers, or products that match your style and needs.";
//   }

//   if (message.includes("shipping") || message.includes("delivery")) {
//     return "Here's our shipping information:\n\n🚚 **Standard Shipping (5-7 business days)**: Free on orders over $50\n✈️ **Express Shipping (2-3 business days)**: $9.99\n⚡ **Overnight Shipping**: $19.99\n\nWe ship Monday through Friday. Orders placed before 2 PM EST ship the same day. You'll receive tracking information via email once your order ships.";
//   }

//   if (message.includes("return") || message.includes("refund")) {
//     return "Our return policy is designed to be customer-friendly:\n\n✅ **30-day return window** from delivery date\n✅ **Free returns** on all orders\n✅ **Full refunds** for unused items in original packaging\n✅ **Exchange options** available\n\nTo start a return:\n1. Go to 'My Orders' in your account\n2. Select the item you want to return\n3. Print the prepaid return label\n4. Drop off at any authorized location\n\nRefunds typically process within 3-5 business days after we receive your return.";
//   }

//   if (message.includes("cart") || message.includes("checkout")) {
//     return "I'm here to help with your cart! Here are some things I can assist with:\n\n🛒 **Cart Issues**: Items not saving, quantity problems, or checkout errors\n💳 **Payment Help**: Accepted payment methods, promo codes, or billing questions\n📦 **Shipping Options**: Choosing the right delivery method for your needs\n\nWhat specific cart issue are you experiencing? I'll walk you through the solution step by step.";
//   }

//   if (message.includes("support") || message.includes("help")) {
//     return "I'm your AI shopping assistant, and I'm here to help 24/7! I can assist with:\n\n• Order tracking and status updates\n• Product recommendations and comparisons\n• Shipping and delivery information\n• Returns, exchanges, and refunds\n• Account and billing questions\n• Store policies and FAQs\n\nFor complex issues that need human attention, I can connect you with our customer service team (available Mon-Fri, 9 AM - 6 PM EST).\n\nWhat can I help you with today?";
//   }

//   // Default response
//   return "Thank you for your message! I'm your AI shopping assistant, and I'm here to help with anything related to your shopping experience.\n\nI can assist with:\n• Order status and tracking\n• Product recommendations\n• Shipping and returns\n• Account questions\n• Store policies\n\nHow can I help you today? Feel free to ask me anything about your shopping needs!";
// };

// export const Chatbot: React.FC = () => {
//   const [messages, setMessages] = useState<Message[]>([
//     {
//       id: "welcome",
//       content: "Hello! I'm your AI shopping assistant. I'm here to help you with orders, product recommendations, shipping information, returns, and any other questions about your shopping experience. How can I assist you today?",
//       isUser: false,
//       timestamp: new Date(),
//     },
//   ]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isTyping, setIsTyping] = useState(false);
//   const scrollAreaRef = useRef<HTMLDivElement>(null);
//   const { toast } = useToast();

//   const scrollToBottom = () => {
//     if (scrollAreaRef.current) {
//       const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
//       if (scrollContainer) {
//         scrollContainer.scrollTop = scrollContainer.scrollHeight;
//       }
//     }
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, isTyping]);

//   const handleSendMessage = async (content: string) => {
//     const userMessage: Message = {
//       id: Date.now().toString(),
//       content,
//       isUser: true,
//       timestamp: new Date(),
//     };

//     setMessages(prev => [...prev, userMessage]);
//     setIsLoading(true);
//     setIsTyping(true);

//     // Simulate AI thinking time
//     setTimeout(() => {
//       const aiResponse: Message = {
//         id: (Date.now() + 1).toString(),
//         content: getAIResponse(content),
//         isUser: false,
//         timestamp: new Date(),
//       };

//       setMessages(prev => [...prev, aiResponse]);
//       setIsLoading(false);
//       setIsTyping(false);
//     }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5 seconds
//   };

//   const clearChat = () => {
//     setMessages([
//       {
//         id: "welcome",
//         content: "Hello! I'm your AI shopping assistant. I'm here to help you with orders, product recommendations, shipping information, returns, and any other questions about your shopping experience. How can I assist you today?",
//         isUser: false,
//         timestamp: new Date(),
//       },
//     ]);
//     toast({
//       title: "Chat cleared",
//       description: "Your conversation has been reset.",
//     });
//   };

//   return (
//     <div className="flex flex-col h-screen max-w-6xl mx-auto bg-gray-100 shadow-large">
//       {/* Header */}
//       <div className="flex items-center justify-between p-4 border-b bg-gradient-subtle">
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-medium">
//             <MessageSquare className="w-5 h-5 text-white" />
//           </div>
//           <div>
//             <h1 className="text-lg font-semibold text-foreground">
//               AI Shopping Assistant
//             </h1>
//             <p className="text-sm text-muted-foreground">
//               Your personal ecommerce helper
//             </p>
//           </div>
//         </div>
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={clearChat}
//           className="hover:bg-destructive hover:text-destructive-foreground transition-colors duration-200"
//         >
//           <Trash2 className="w-4 h-4" />
//         </Button>
//       </div>

//       {/* Quick Actions */}
//       <QuickActions onActionClick={handleSendMessage} />

//       {/* Chat Messages */}
//       <ScrollArea ref={scrollAreaRef} className="flex-1">
//         <div className="min-h-full">
//           {messages.map((message) => (
//             <ChatMessage key={message.id} message={message} />
//           ))}
//           {isTyping && <TypingIndicator />}
//         </div>
//       </ScrollArea>

//       {/* Chat Input */}
//       <ChatInput 
//         onSendMessage={handleSendMessage} 
//         isLoading={isLoading}
//       />
//     </div>
//   );
// };



import React, { useState, useRef, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { QuickActions } from "./QuickActions";
import { TypingIndicator } from "./TypingIndicator";
import { Trash2, MessageSquare, Headphones } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { Button } from "../../ui/button";
import { ScrollArea } from "../../ui/scroll-area";
import { useAuth } from "../../context/authContext";

// Production Socket Connection
const socket: Socket = io(import.meta.env.BASE_URL || "http://localhost:8080");

export const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isHumanAgent, setIsHumanAgent] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  //const { toast } = useToast();

  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
     if (!userId) return;

    // 1. Join personal room & fetch history from MongoDB
    socket.emit("join_chat", { userId, conversationId });

    socket.on("chat_history", (history) => {
      setMessages(history.map((m: any) => ({
        id: m._id,
        content: m.text,
        isUser: m.sender === "user",
        senderType: m.sender, // 'user', 'AI', or 'admin'
        timestamp: new Date(m.createdAt)
      })));
    });

    // 2. Listen for real-time replies (from AI or Admin)
    socket.on("receive_message", (data) => {
      if (data.sender === "System" && data.message.includes("human agent")) {
        setIsHumanAgent(true);
      }

      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        content: data.message,
        isUser: data.sender === "user",
        senderType: data.sender,
        timestamp: new Date()
      }]);
      setIsTyping(false);
      setIsLoading(false);
    });

     // ✅ STREAM START
    socket.on("ai_typing", () => {
      setIsTyping(true);

      setMessages((prev) => [
        ...prev,
        {
          id: "stream",
          content: "",
          role: "assistant",
          streaming: true,
          createdAt: new Date(),
        },
      ]);
    });

    socket.on("ai_message_chunk", ({ chunk }) => {
      setMessages(prev => {
        const last = prev[prev.length - 1];

        if (last?.streaming) {
           return [
            ...prev.slice(0, -1),
            { ...last, content: last.content + chunk },
          ];
        }

        return [...prev, { id: Date.now().toString(), role: "assistant", content: chunk, streaming: true }];
      });
    });

     socket.on("ai_message_done", ({ conversationId }) => {
      setIsTyping(false);
      setConversationId(conversationId);
      setMessages(prev =>
        prev.map(m => (m.streaming ? { ...m, streaming: false } : m))
      );
    });

    return () => {
      socket.off("receive_message");
      socket.off("chat_history");
      socket.off("ai_typing");
      socket.off("ai_message_chunk");
      socket.off("ai_message_done");
    };
  }, [userId]);

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;

    // 3. Emit message to Backend (which triggers Gemini or Admin)
    socket.emit("send_message", { message: content });

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date()
    }]);

    setIsLoading(true);
    setIsTyping(!isHumanAgent); // Only show AI typing dots if not talking to human
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-lg mx-auto bg-white rounded-xl shadow-2xl overflow-hidden border">
      {/* Header */}
      <div className={`p-4 flex justify-between items-center text-white ${isHumanAgent ? 'bg-blue-600' : 'bg-primary'}`}>
        <div className="flex items-center gap-2">
          {isHumanAgent ? <Headphones className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
          <div>
            <h2 className="font-bold text-sm">{isHumanAgent ? "Live Support" : "AI Assistant"}</h2>
            <p className="text-[10px] opacity-80">{isHumanAgent ? "Talking to Agent" : "Online 24/7"}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setMessages([])} className="hover:bg-destructive hover:text-destructive-foreground transition-colors duration-200"><Trash2 className="w-4 h-4" /></Button>
      </div>

      <QuickActions onActionClick={handleSendMessage} />

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isTyping && <TypingIndicator />}
      </ScrollArea>

      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};