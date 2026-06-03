import { Smile, Paperclip, Mic, Send } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import { useDispatch } from "react-redux";
import EmojiPicker from "emoji-picker-react";
import { Socket } from "socket.io-client";

const EVENTS = {
  START_TYPING: "START_TYPING",
  STOP_TYPING: "STOP_TYPING",
};

type MessagePayload =
  | { type: "text"; content: string }
  | { type: "file"; content: string; fileName?: string }
  | { type: "audio"; content: string };

interface ChatInputProps {
  onSendMessage: (message: MessagePayload) => void;
  socketRef: React.MutableRefObject<Socket | null>;
  selectedChatId?: string;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, socketRef, selectedChatId, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [recording, setRecording] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  //   // ✅ FIX: move socket listeners into useEffect
  useEffect(() => {
    if (!socketRef?.current) return;

    const handleStartTyping = () => setIsTyping(true);
    const handleStopTyping = () => setIsTyping(false);

    socketRef.current.on(EVENTS.START_TYPING, handleStartTyping);
    socketRef.current.on(EVENTS.STOP_TYPING, handleStopTyping);

    return () => {
      socketRef.current.off(EVENTS.START_TYPING, handleStartTyping);
      socketRef.current.off(EVENTS.STOP_TYPING, handleStopTyping);
    };
  }, [socketRef]);


  const dispatch = useDispatch();

  const handleTyping = () => {
    if (!socketRef?.current || !selectedChatId) return;

    socketRef.current.emit(EVENTS.START_TYPING, {
      chatId: selectedChatId,
    });

    setTimeout(() => {
      socketRef.current?.emit(EVENTS.STOP_TYPING, {
        chatId: selectedChatId,
      });
    }, 1500);
  };

  const handleSend = () => {
    if (!message.trim() || disabled) return;

    onSendMessage({
      type: "text",
      content: message.trim(),
    });

    setMessage("");
    setShowEmoji(false);
  };

  const handleEmojiClick = (emojiData: any) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  const handleFileUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      onSendMessage({
        type: "file",
        content: data.url,
        fileName: file.name,
      });
    } catch (err) {
      console.error("File upload failed", err);
    }
  };

  // =========================
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const file = new File([blob], "voice.webm");

        await handleFileUpload(file);
      };

      recorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Mic error", err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileOpen = (e) => {
    // dispatch(setIsFileMenu(true));
    // setFileMenuAnchor(e.currentTarget);
  };

  return (
    <div className="p-4 border-t border-border bg-chat-input relative">
      {/* Emoji Picker */}
      {showEmoji && (
        <div className="absolute bottom-16 right-4 z-50">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
      <div className="flex items-end gap-3">
        {/* Attachment button */}
        <Button variant="ghost" size="sm" disabled={disabled} onClick={handleFileOpen}>
          <Paperclip className="h-4 w-4" />
        </Button>

        {/* Message input */}
        <div className="flex-1 relative">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value)
              handleTyping();  // ✅ trigger typing
            }}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            className="pr-10 bg-background border-border resize-none"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            onClick={() => setShowEmoji((prev) => !prev)}
          >
            <Smile className="h-4 w-4" />
          </Button>
        </div>

  
        {message.trim() ? (
          <Button
            onClick={handleSend}
            disabled={disabled}
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant={recording ? "destructive" : "ghost"} size="sm" onClick={recording ? stopRecording : startRecording}>
            <Mic className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Typing indicator */}
      {isTyping && (
        <div className="mt-2 h-4">
          <div className="flex items-center gap-1">
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-typing-indicator rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-typing-indicator rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1 h-1 bg-typing-indicator rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-xs text-muted-foreground ml-2">
              Someone is typing...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}








// import { Smile, Paperclip, Mic, Send } from "lucide-react";
// import { useEffect, useRef, useState } from "react";
// import EmojiPicker from "emoji-picker-react";
// import { Input } from "../../../ui/input";
// import { Button } from "../../../ui/button";
// import { Socket } from "socket.io-client";

// const EVENTS = {
//   START_TYPING: "START_TYPING",
//   STOP_TYPING: "STOP_TYPING",
// };

// type MessagePayload =
//   | { type: "text"; content: string }
//   | { type: "file"; content: string; fileName?: string }
//   | { type: "audio"; content: string };

// interface ChatInputProps {
//   onSendMessage: (message: MessagePayload) => void;
//   socketRef: React.MutableRefObject<Socket | null>;
//   selectedChatId?: string;
//   disabled?: boolean;
// }

// export function ChatInput({
//   onSendMessage,
//   socketRef,
//   selectedChatId,
//   disabled = false,
// }: ChatInputProps) {
//   const [message, setMessage] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const [showEmoji, setShowEmoji] = useState(false);
//   const [recording, setRecording] = useState(false);

//   const fileRef = useRef<HTMLInputElement | null>(null);
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);

//   // =========================
//   // Typing listeners
//   // =========================
//   useEffect(() => {
//     if (!socketRef?.current) return;

//     const handleStartTyping = () => setIsTyping(true);
//     const handleStopTyping = () => setIsTyping(false);

//     socketRef.current.on(EVENTS.START_TYPING, handleStartTyping);
//     socketRef.current.on(EVENTS.STOP_TYPING, handleStopTyping);

//     return () => {
//       socketRef.current?.off(EVENTS.START_TYPING, handleStartTyping);
//       socketRef.current?.off(EVENTS.STOP_TYPING, handleStopTyping);
//     };
//   }, [socketRef]);

//   // =========================
//   // Emit typing
//   // =========================
//   const handleTyping = () => {
//     if (!socketRef?.current || !selectedChatId) return;

//     socketRef.current.emit(EVENTS.START_TYPING, {
//       chatId: selectedChatId,
//     });

//     setTimeout(() => {
//       socketRef.current?.emit(EVENTS.STOP_TYPING, {
//         chatId: selectedChatId,
//       });
//     }, 1500);
//   };

//   // =========================
//   // SEND TEXT MESSAGE
//   // =========================
//   const handleSend = () => {
//     if (!message.trim() || disabled) return;

//     onSendMessage({
//       type: "text",
//       content: message.trim(),
//     });

//     setMessage("");
//     setShowEmoji(false);
//   };

//   // =========================
//   // EMOJI
//   // =========================
//   const handleEmojiClick = (emojiData: any) => {
//     setMessage((prev) => prev + emojiData.emoji);
//   };

//   // =========================
//   // FILE UPLOAD
//   // =========================
//   const handleFileUpload = async (file: File) => {
//     try {
//       const formData = new FormData();
//       formData.append("file", file);

//       const res = await fetch("/upload", {
//         method: "POST",
//         body: formData,
//       });

//       const data = await res.json();

//       onSendMessage({
//         type: "file",
//         content: data.url,
//         fileName: file.name,
//       });
//     } catch (err) {
//       console.error("File upload failed", err);
//     }
//   };

//   // =========================
//   // VOICE RECORDING
//   // =========================
//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         audio: true,
//       });

//       const recorder = new MediaRecorder(stream);
//       mediaRecorderRef.current = recorder;

//       const chunks: Blob[] = [];

//       recorder.ondataavailable = (e) => {
//         if (e.data.size > 0) chunks.push(e.data);
//       };

//       recorder.onstop = async () => {
//         const blob = new Blob(chunks, { type: "audio/webm" });
//         const file = new File([blob], "voice.webm");

//         await handleFileUpload(file);
//       };

//       recorder.start();
//       setRecording(true);
//     } catch (err) {
//       console.error("Mic error", err);
//     }
//   };

//   const stopRecording = () => {
//     mediaRecorderRef.current?.stop();
//     setRecording(false);
//   };

//   // =========================
//   // UI
//   // =========================
//   return (
//     <div className="p-4 border-t bg-chat-input relative">
//       {/* Emoji Picker */}
//       {showEmoji && (
//         <div className="absolute bottom-16 left-2 z-50">
//           <EmojiPicker onEmojiClick={handleEmojiClick} />
//         </div>
//       )}

//       {/* Hidden File Input */}
//       <input
//         type="file"
//         hidden
//         ref={fileRef}
//         onChange={(e) => {
//           if (e.target.files?.[0]) {
//             handleFileUpload(e.target.files[0]);
//           }
//         }}
//       />

//       <div className="flex items-end gap-3">
//         {/* File Button */}
//         <Button
//           variant="ghost"
//           size="sm"
//           onClick={() => fileRef.current?.click()}
//         >
//           <Paperclip className="h-4 w-4" />
//         </Button>

//         {/* Input */}
//         <div className="flex-1 relative">
//           <Input
//             placeholder="Type a message..."
//             value={message}
//             onChange={(e) => {
//               setMessage(e.target.value);
//               handleTyping();
//             }}
//             disabled={disabled}
//             className="pr-10"
//           />

//           {/* Emoji Button */}
//           <Button
//             type="button"
//             variant="ghost"
//             size="sm"
//             onClick={() => setShowEmoji((prev) => !prev)}
//             className="absolute right-2 top-1/2 -translate-y-1/2"
//           >
//             <Smile className="h-4 w-4" />
//           </Button>
//         </div>

//         {/* Send / Mic */}
//         {message.trim() ? (
//           <Button onClick={handleSend}>
//             <Send className="h-4 w-4" />
//           </Button>
//         ) : (
//           <Button
//             variant={recording ? "destructive" : "ghost"}
//             size="sm"
//             onClick={recording ? stopRecording : startRecording}
//           >
//             <Mic className="h-4 w-4" />
//           </Button>
//         )}
//       </div>

//       {/* Typing indicator */}
//       {isTyping && (
//         <p className="text-xs mt-2 text-muted-foreground">
//           Someone is typing...
//         </p>
//       )}
//     </div>
//   );
// }