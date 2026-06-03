import { useState } from 'react';
import { Download, FileText, Share } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Message, Agent } from '../types/Agent';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { useToast } from '../../../hooks/use-toast';

interface ExportChatProps {
  messages: Message[];
  agent: Agent | null;
}

export function ExportChat({ messages, agent }: ExportChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'txt' | 'csv'>('json');
  
  const { toast } = useToast();

  const exportAsJSON = () => {
    const exportData = {
      agent: agent?.name || 'Unknown Agent',
      exportDate: new Date().toISOString(),
      messageCount: messages.length,
      messages: messages.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.timestamp.toISOString(),
        rating: m.rating,
        fileAttachment: m.fileAttachment ? {
          name: m.fileAttachment.name,
          size: m.fileAttachment.size,
          type: m.fileAttachment.type
        } : undefined
      }))
    };

    downloadFile(JSON.stringify(exportData, null, 2), `chat-export-${agent?.name}-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
  };

  const exportAsText = () => {
    let textContent = `Chat Export: ${agent?.name || 'Unknown Agent'}\n`;
    textContent += `Export Date: ${new Date().toLocaleString()}\n`;
    textContent += `Total Messages: ${messages.length}\n\n`;
    textContent += '='.repeat(50) + '\n\n';

    messages.forEach((message, index) => {
      textContent += `[${message.timestamp.toLocaleString()}] ${message.role.toUpperCase()}\n`;
      textContent += `${message.content}\n`;
      if (message.fileAttachment) {
        textContent += `📎 Attachment: ${message.fileAttachment.name}\n`;
      }
      if (message.rating) {
        textContent += `Rating: ${message.rating === 'like' ? '👍' : '👎'}\n`;
      }
      textContent += '\n' + '-'.repeat(30) + '\n\n';
    });

    downloadFile(textContent, `chat-export-${agent?.name}-${new Date().toISOString().split('T')[0]}.txt`, 'text/plain');
  };

  const exportAsCSV = () => {
    const headers = ['Timestamp', 'Role', 'Content', 'Rating', 'File Attachment'];
    const rows = messages.map(m => [
      m.timestamp.toISOString(),
      m.role,
      `"${m.content.replace(/"/g, '""')}"`, // Escape quotes for CSV
      m.rating || '',
      m.fileAttachment?.name || ''
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    downloadFile(csvContent, `chat-export-${agent?.name}-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      description: `Chat exported successfully as ${exportFormat.toUpperCase()}`,
    });
    setIsOpen(false);
  };

  const handleExport = () => {
    if (messages.length === 0) {
      toast({
        title: "No messages to export",
        description: "Start a conversation first to export chat data.",
        variant: "destructive"
      });
      return;
    }

    switch (exportFormat) {
      case 'json':
        exportAsJSON();
        break;
      case 'txt':
        exportAsText();
        break;
      case 'csv':
        exportAsCSV();
        break;
    }
  };

  const shareChat = async () => {
    if (!navigator.share) {
      toast({
        title: "Share not supported",
        description: "Your browser doesn't support the share feature.",
        variant: "destructive"
      });
      return;
    }

    const shareText = `Chat with ${agent?.name}: ${messages.length} messages`;
    try {
      await navigator.share({
        title: 'AI Agent Chat',
        text: shareText,
        url: window.location.href
      });
    } catch (error) {
      // User cancelled or error occurred
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          <Download size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md" aria-describedby="export-chat-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <FileText size={20} />
            Export Chat
          </DialogTitle>
        </DialogHeader>
        <p id="export-chat-description" className="sr-only">
          Export current chat conversation in various formats including JSON, text, or CSV.
        </p>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="export-format">Export Format</Label>
            <Select value={exportFormat} onValueChange={(value: 'json' | 'txt' | 'csv') => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON (Developer-friendly)</SelectItem>
                <SelectItem value="txt">Text (Human-readable)</SelectItem>
                <SelectItem value="csv">CSV (Spreadsheet-compatible)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
            <p><strong>Export will include:</strong></p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>{messages.length} messages</li>
              <li>Timestamps and ratings</li>
              <li>File attachment info</li>
              <li>Agent information</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          {navigator.share && (
            <Button variant="outline" onClick={shareChat} className="flex-1">
              <Share size={16} className="mr-2" />
              Share
            </Button>
          )}
          <Button onClick={handleExport} className="flex-1">
            <Download size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}