import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./aiChatModal.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  product: any;
  onClose: () => void;
}

type Message = {
  from: "user" | "bot";
  text: string;
};

function AiChatModal({ product, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingText, setTypingText] = useState("");
  const [loading, setLoading] = useState(false);

  const chatWindowRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ Typing animation
  const typeMessage = (text: string) => {
    let index = 0;
    setTypingText("");

    intervalRef.current = setInterval(() => {
      setTypingText((prev) => prev + text[index]);
      index++;

      if (index >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setMessages((prev) => [...prev, { from: "bot", text }]);
        setTypingText("");
      }
    }, 20);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // ✅ Auto scroll
  useEffect(() => {
    chatWindowRef.current?.scrollTo({
      top: chatWindowRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typingText]);

  const handleAsk = async () => {
    if (!query.trim()) return;

    const userMessage = query;

    setMessages((prev) => [...prev, { from: "user", text: userMessage }]);
    setQuery("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL_LOCAL}/api/v1/product/ask`,
        { query: userMessage, productId: product._id },
      );

      const answer = res.data?.answer || "No answer returned.";
      typeMessage(answer);
    } catch (error) {
      console.error(error);
      typeMessage("⚠️ Error fetching answer.");
    } finally {
      setLoading(false);
    }
  };


  return (
    // 🔥 BACKDROP
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center animate-fadeIn" onClick={onClose}>

      {/* 🔥 MODAL */}
      <div className="w-[95%] max-w-[500px] h-[600px] bg-white dark:bg-gray-900 rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[80vh] transform transition-all duration-300 scale-95 animate-modalIn"
        onClick={(e) => e.stopPropagation()}
      >

        {/* HEADER */}
        <div className="flex justify-between items-center px-4 py-3 bg-red-500 text-white">
          <h2 className="font-semibold text-lg">
            Ask about {product?.name}
          </h2>
          <button
            onClick={onClose}
            className="text-white text-xl font-bold hover:opacity-70"
          >
            ✕
          </button>
        </div>

        {/* CHAT */}
        <div
          ref={chatWindowRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-100 dark:bg-gray-800"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`max-w-[80%] px-4 py-2 rounded-xl text-sm ${msg.from === "user"
                ? "ml-auto bg-red-400 text-white rounded-br-none"
                : "bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded-bl-none"
                }`}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.text}
              </ReactMarkdown>
            </div>
          ))}

          {typingText && (
            <div className="max-w-[80%] px-4 py-2 rounded-xl text-sm bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded-bl-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {typingText}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* INPUT */}
        <div className="flex p-3 border-t dark:border-gray-700 bg-white dark:bg-gray-900">
          <input
            type="text"
            placeholder="Ask something..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            className="flex-1 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 outline-none bg-white dark:bg-gray-800 text-black dark:text-white"
          />

          <button
            onClick={handleAsk}
            disabled={loading}
            className="ml-2 px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-400"
          >
            {loading ? "..." : "Ask"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AiChatModal;