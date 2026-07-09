import { Smile, Paperclip, Mic, Send } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import EmojiPicker from "emoji-picker-react";
import { Dialog, DialogContent } from "../../../ui/dialog";
import { FileUpload } from "./FileUpload";
import { socket } from "../../admin/socket";

const EVENTS = {
  START_TYPING: "START_TYPING",
  STOP_TYPING: "STOP_TYPING",
};
interface ChatInputProps {
  onSendMessage: (data: { text?: string; files?: File[] }) => void;
  selectedChatId?: string;
  disabled?: boolean;
  chatMembers?: any[]; // Optional: Pass chat members if needed
}

export function ChatInput({ onSendMessage, selectedChatId, disabled = false, chatMembers }: ChatInputProps) {
  const [inputText, setInputText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [recording, setRecording] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emojiRef = useRef<HTMLDivElement | null>(null);

  //   // ✅ FIX: move socket listeners into useEffect
  useEffect(() => {
    const handleStartTyping = (data: { chatId: string }) => {
      if (data.chatId === selectedChatId) setIsTyping(true);
    };
    const handleStopTyping = (data: { chatId: string }) => {
      if (data.chatId === selectedChatId) setIsTyping(false);
    };
    socket.on(EVENTS.START_TYPING, handleStartTyping);
    socket.on(EVENTS.STOP_TYPING, handleStopTyping);
    return () => {
      socket?.off(EVENTS.START_TYPING, handleStartTyping);
      socket?.off(EVENTS.STOP_TYPING, handleStopTyping);
    };
  }, [selectedChatId]);

  useEffect(() => setIsTyping(false), [selectedChatId]); // reset on chat switch

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiRef.current &&
        !emojiRef.current.contains(event.target as Node)
      ) {
        setShowEmoji(false);
      }
    };

    if (showEmoji) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmoji]);

  //const dispatch = useDispatch();

  const handleTyping = () => {
    if (!selectedChatId) return;

    socket.emit(EVENTS.START_TYPING, {
      chatId: selectedChatId,
      members: chatMembers,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit(EVENTS.STOP_TYPING, {
        chatId: selectedChatId,
      });
    }, 1500);
  };

  // ✅ SEND HANDLER
  const handleSend = () => {
    if (!inputText.trim() && files.length === 0) return;

    onSendMessage({
      text: inputText.trim() || undefined,
      files
    });

    setInputText("");
    setFiles([]);
    setShowEmoji(false);
  };

  const handleFilesUploaded = (files: File[], caption: string) => {
    onSendMessage({ text: caption, files });
    setShowFileUpload(false);
  };

  const handleEmojiClick = (emojiData: any) => {
    setInputText((prev) => prev + emojiData.emoji);
  };

  // file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length === 0) return;

    setFiles((prev) => [...prev, ...selectedFiles]);

    // ✅ OPEN DIALOG ONLY AFTER FILES SELECTED
    setShowFileUpload(true);
  };

  // open file picker
  const handleFileOpen = () => {
    fileRef.current?.click();
  };

  // ============ Voice Recording =============
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

        setFiles((prev) => [...prev, file]);
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


  // const handleFileOpen = (e) => {
  //   // dispatch(setIsFileMenu(true));
  //   // setFileMenuAnchor(e.currentTarget);
  // };

  return (
    <div className="p-4 border-t border-border bg-chat-input relative">
      {/* Emoji Picker */}
      {showEmoji && (
        <div className="absolute bottom-16 right-4 z-50" ref={emojiRef}>
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
      <div className="flex items-end gap-3">
        {/* hidden file input */}
        <input
          type="file"
          ref={fileRef}
          hidden
          multiple
          onChange={handleFileChange}
        />
        {/* Attachment button */}
        <Button variant="ghost" size="sm" disabled={disabled} onClick={handleFileOpen}>
          <Paperclip className="h-4 w-4" />
        </Button>

        {/* Message input */}
        <div className="flex-1 relative">
          <Input
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value)
              handleTyping();  // ✅ trigger typing
            }}
            onKeyDown={handleKeyPress}
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

        {inputText.trim() || files.length > 0 ? (
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

      {/* File Upload Dialog */}
      <Dialog open={showFileUpload} onOpenChange={setShowFileUpload}>
        <DialogContent className="z-50 bg-popover max-w-2xl min-h-[80vh]">
          <FileUpload
            onFilesUploaded={handleFilesUploaded}
            onClose={() => setShowFileUpload(false)}
            inputText={inputText}
            setInputText={setInputText}
            files={files}
            setFiles={setFiles}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
