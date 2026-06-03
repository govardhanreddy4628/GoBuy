import { useState, useMemo } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Message } from '../types/Agent';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Input } from '../../../ui/input';

interface SearchMessagesProps {
  messages: Message[];
  onMessageSelect: (messageId: string) => void;
}

export function SearchMessages({ messages, onMessageSelect }: SearchMessagesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'user' | 'assistant'>('all');
  const [filterRating, setFilterRating] = useState<'all' | 'like' | 'dislike' | 'unrated'>('all');

  const filteredMessages = useMemo(() => {
    return messages.filter(message => {
      // Text search
      const matchesSearch = searchQuery === '' || 
        message.content.toLowerCase().includes(searchQuery.toLowerCase());

      // Role filter
      const matchesRole = filterRole === 'all' || message.role === filterRole;

      // Rating filter
      const matchesRating = filterRating === 'all' || 
        (filterRating === 'unrated' && !message.rating) ||
        message.rating === filterRating;

      return matchesSearch && matchesRole && matchesRating;
    });
  }, [messages, searchQuery, filterRole, filterRating]);

  const handleMessageClick = (messageId: string) => {
    onMessageSelect(messageId);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterRole('all');
    setFilterRating('all');
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          <Search size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col" aria-describedby="search-messages-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Search size={20} />
            Search Messages
          </DialogTitle>
        </DialogHeader>
        <p id="search-messages-description" className="sr-only">
          Search and filter through chat messages by content, role, and rating.
        </p>
        
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3 items-center flex-wrap">
            <Select value={filterRole} onValueChange={(value: 'all' | 'user' | 'assistant') => setFilterRole(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="assistant">Assistant</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterRating} onValueChange={(value: 'all' | 'like' | 'dislike' | 'unrated') => setFilterRating(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="like">Liked</SelectItem>
                <SelectItem value="dislike">Disliked</SelectItem>
                <SelectItem value="unrated">Unrated</SelectItem>
              </SelectContent>
            </Select>

            {(searchQuery || filterRole !== 'all' || filterRating !== 'all') && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X size={14} className="mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{filteredMessages.length} of {messages.length} messages</span>
            {filteredMessages.length !== messages.length && (
              <Badge variant="secondary" className="text-xs">
                <Filter size={12} className="mr-1" />
                Filtered
              </Badge>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto space-y-2 border rounded-lg p-2 bg-muted/30">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search size={32} className="mx-auto mb-2 opacity-50" />
              <p>No messages found</p>
              {searchQuery && (
                <p className="text-sm">Try adjusting your search or filters</p>
              )}
            </div>
          ) : (
            filteredMessages.map((message, index) => (
              <div
                key={message.id}
                onClick={() => handleMessageClick(message.id)}
                className="p-3 bg-background rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={message.role === 'user' ? 'default' : 'secondary'} className="text-xs">
                        {message.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(message.timestamp)}
                      </span>
                      {message.rating && (
                        <span className="text-xs">
                          {message.rating === 'like' ? '👍' : '👎'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm line-clamp-2 text-foreground">
                      {message.content}
                    </p>
                    {message.fileAttachment && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          📎 {message.fileAttachment.name}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}