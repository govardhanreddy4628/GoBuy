import { useState, useRef, useEffect } from "react";
import { Button } from "../../../ui/button";
import { Badge } from "../../../ui/badge";
import { Alert, AlertDescription } from "../../../ui/alert";
import { Input } from "../../../ui/input";
import {
  File as FileIcon,
  Image,
  X,
  Send,
  FileText,
  FileVideo,
  FileAudio,
  Plus
} from "lucide-react";

interface FileUploadProps {
  onFilesUploaded: (files: File[], caption: string) => void;
  onClose: () => void;
  inputText: string;
  setInputText: (text: string) => void;
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  maxFiles?: number;
  maxFileSize?: number;
}

export function FileUpload({
  onFilesUploaded,
  onClose,
  inputText,
  setInputText,
  files,
  setFiles,
  maxFiles = 5,
  maxFileSize = 25
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [errors, setErrors] = useState<Record<number, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const objectUrlsRef = useRef<Map<File, string>>(new Map());

  const getPreviewUrl = (file: File) => {
    if (!objectUrlsRef.current.has(file)) {
      objectUrlsRef.current.set(file, URL.createObjectURL(file));
    }
    return objectUrlsRef.current.get(file)!;
  };

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    if (files.length === 0) setSelectedImgIndex(0);
    else if (selectedImgIndex >= files.length) {
      setSelectedImgIndex(files.length - 1);
    }
  }, [files, selectedImgIndex]);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return Image;
    if (fileType.startsWith("video/")) return FileVideo;
    if (fileType.startsWith("audio/")) return FileAudio;
    if (fileType.includes("text") || fileType.includes("document"))
      return FileText;
    return FileIcon;
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File too large. Maximum size is ${maxFileSize}MB`;
    }
    return null;
  };

  const addFiles = (fileList: FileList) => {
    const incoming = Array.from(fileList).slice(
      0,
      Math.max(0, maxFiles - files.length)
    );

    const newErrors: Record<number, string> = {};

    setFiles((prev) => {
      const start = prev.length;

      incoming.forEach((file, i) => {
        const err = validateFile(file);
        if (err) newErrors[start + i] = err;
      });

      return [...prev, ...incoming];
    });

    if (Object.keys(newErrors).length) {
      setErrors((p) => ({ ...p, ...newErrors }));
    }
  };

  const removeFile = (index: number) => {
    const fileToRemove = files[index];

    if (fileToRemove && objectUrlsRef.current.has(fileToRemove)) {
      URL.revokeObjectURL(objectUrlsRef.current.get(fileToRemove)!);
      objectUrlsRef.current.delete(fileToRemove);
    }

    setFiles((prev) => prev.filter((_, i) => i !== index));

    setErrors((prev) => {
      const updated: Record<number, string> = {};
      Object.entries(prev).forEach(([key, val]) => {
        const k = Number(key);
        if (k < index) updated[k] = val;
        else if (k > index) updated[k - 1] = val;
      });
      return updated;
    });
  };

  const handleUpload = async () => {
    setUploading(true);

    const validFiles = files.filter((_, i) => !errors[i]);

    if (validFiles.length === 0 && !inputText.trim()) return;

    onFilesUploaded(validFiles, inputText.trim());
    onClose();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    if (e.dataTransfer.files) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const validFiles = files.filter((_, i) => !errors[i]);
  const hasErrors = Object.keys(errors).length > 0;

  const currentFile = files[selectedImgIndex];

  return (
    <div className="space-y-4">
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Files ({files.length})</h4>

          <div className="h-full overflow-y-auto space-y-2 px-2">
            {currentFile && (
              <div className="w-full items-center justify-center" >
                <img
                  src={getPreviewUrl(currentFile)}
                  alt="Preview"
                  className="h-72 w-72 object-cover"
                />

                <p className="text-sm font-medium truncate">
                  {currentFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(currentFile.size)}
                </p>

                {errors[selectedImgIndex] && (
                  <Badge variant="destructive" className="text-xs">
                    {errors[selectedImgIndex]}
                  </Badge>
                )}
              </div>
            )}

            <div className="flex gap-2 flex-wrap items-center">
              {files.map((file, i) => {
                const Icon = getFileIcon(file.type);
                return (
                  <div key={i} className="relative">
                    {file.type.startsWith("image/") ? (
                      <img
                        src={getPreviewUrl(file)}
                        className={`w-16 h-16 object-cover rounded cursor-pointer ${selectedImgIndex === i ? "ring-2 ring-primary" : ""
                          }`}
                        onClick={() => setSelectedImgIndex(i)}
                      />
                    ) : (
                      <div
                        className="w-10 h-10 bg-muted rounded flex items-center justify-center cursor-pointer"
                        onClick={() => setSelectedImgIndex(i)}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                    )}

                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-5 w-5"
                      onClick={() => removeFile(i)}
                      disabled={uploading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })}

              <div
                className={`border-2 border-dashed rounded-lg p-2 ${dragOver
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                  }`}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
              >
                <Button onClick={() => fileInputRef.current?.click()} className="h-16 w-16">
                  <Plus />
                </Button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />

            <p className="text-xs text-muted-foreground">
              Max {maxFiles} files, up to {maxFileSize}MB each
            </p>
          </div>
        </div>
      )}

      {hasErrors && (
        <Alert variant="destructive">
          <AlertDescription>
            Some files have errors. Please fix them before uploading.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-2 mt-3">
        <Input
          placeholder="Add a caption..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <Button
          onClick={handleUpload}
          disabled={uploading || (validFiles.length === 0 && !inputText.trim())}
        >
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
}