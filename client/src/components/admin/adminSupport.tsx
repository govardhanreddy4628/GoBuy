import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { ScrollArea } from "../../ui/scroll-area";
import { Button } from "../../ui/button";

const socket = io("http://localhost:8080");

export const AdminSupport: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    // 1. Listen for AI escalations
    socket.on("admin_alert", (data) => {
      setAlerts(prev => [...prev, data]);
      // Play notification sound here
    });

    // 2. Listen for messages in the active room
    socket.on("receive_message", (data) => {
      setMessages(prev => [...prev, data]);
    });

    return () => {
        socket.off("admin_alert");
        socket.off("receive_message");
    };
  }, []);

  const takeOverChat = (userId: string) => {
    setActiveChatId(userId);
    socket.emit("admin_takeover", userId); // Tells backend to mute AI
    socket.emit("join_chat", userId); // Admin enters the user's room
  };

  const sendResponse = () => {
    if (!input || !activeChatId) return;
    socket.emit("send_message", { 
      userId: activeChatId, 
      message: input, 
      sender: "Admin" 
    });
    setInput("");
  };

  return (
    <div className="flex h-screen bg-slate-50 p-6 gap-6">
      {/* Sidebar: Escalation Alerts */}
      <div className="w-1/3 bg-white rounded-xl shadow p-4 border">
        <h2 className="font-bold mb-4 border-b pb-2 text-red-500">Escalation Queue</h2>
        {alerts.map((alert, i) => (
          <div key={i} className="p-3 mb-2 bg-red-50 rounded border border-red-100 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold">User: {alert.userId}</p>
              <p className="text-[10px] text-red-600">Reason: {alert.reason}</p>
            </div>
            <Button size="sm" onClick={() => takeOverChat(alert.userId)}>Take Over</Button>
          </div>
        ))}
      </div>

      {/* Main: Chat Window */}
      <div className="flex-1 bg-white rounded-xl shadow flex flex-col border">
        {activeChatId ? (
          <>
            <div className="p-4 border-b font-bold">Chatting with {activeChatId}</div>
            <ScrollArea className="flex-1 p-4">
              {messages.map((m, i) => (
                <div key={i} className={`mb-2 p-2 rounded max-w-[70%] ${m.sender === 'user' ? 'bg-slate-100' : 'bg-blue-50 ml-auto'}`}>
                   <p className="text-xs font-bold opacity-50">{m.sender}</p>
                   <p className="text-sm">{m.message}</p>
                </div>
              ))}
            </ScrollArea>
            <div className="p-4 border-t flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 border rounded p-2" placeholder="Type response..." />
              <Button onClick={sendResponse}>Send</Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">Select an alert to start helping.</div>
        )}
      </div>
    </div>
  );
};