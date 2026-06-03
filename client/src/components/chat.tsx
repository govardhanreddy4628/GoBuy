// components/Chat.tsx
import { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:8080");

interface Message {
  senderId: string;
  receiverId: string;
  content: string;
  createdAt?: string;
}

export default function Chat({ userId, agentId }: { userId: string; agentId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    socket.emit("join", userId);

    socket.on("receiveMessage", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Load chat history
    axios.get(`http://localhost:8080/api/messages/${userId}`).then((res) => {
      setMessages(res.data);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [userId]);

  const sendMessage = () => {
    const msg: Message = {
      senderId: userId,
      receiverId: agentId,
      content: input,
    };
    socket.emit("sendMessage", msg);
    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  return (
    <div>
      <h3>Live Chat</h3>
      <div style={{ height: "300px", overflowY: "scroll", border: "1px solid gray", marginBottom: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ textAlign: m.senderId === userId ? "right" : "left" }}>
            <span>{m.content}</span>
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}



// App.tsx or wherever
<Chat userId="customer_123" agentId="agent_456" />
