import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { ScrollArea } from "../../../ui/scroll-area";
import { Checkbox } from "../../../ui/checkbox";
import { Badge } from "../../../ui/badge";
import { Loader2, Search, UserPlus, Users } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface ContactSelectorProps {
  isGroup: boolean;
  onContactsSelected: (contacts: Contact[]) => void;
  onBack: () => void;
  loading?: boolean;
}

export function ContactSelector({ isGroup, onContactsSelected, onBack, loading = false }: ContactSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);

  // Mock API call to fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      setLoadingContacts(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockContacts: Contact[] = [
          {
            id: "1",
            name: "Sarah Johnson",
            email: "sarah@example.com",
            isOnline: true,
          },
          {
            id: "2",
            name: "Mike Chen",
            email: "mike@example.com",
            isOnline: false,
            lastSeen: "2 hours ago"
          },
          {
            id: "3",
            name: "Emily Davis",
            email: "emily@example.com",
            isOnline: true,
          },
          {
            id: "4",
            name: "Alex Wilson",
            email: "alex@example.com",
            isOnline: false,
            lastSeen: "1 day ago"
          },
          {
            id: "5",
            name: "Jessica Brown",
            email: "jessica@example.com",
            isOnline: true,
          }
        ];
        
        setContacts(mockContacts);
      } catch (error) {
        console.error("Failed to fetch contacts:", error);
      } finally {
        setLoadingContacts(false);
      }
    };

    fetchContacts();
  }, []);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactToggle = (contact: Contact) => {
    if (isGroup) {
      setSelectedContacts(prev => {
        const exists = prev.find(c => c.id === contact.id);
        if (exists) {
          return prev.filter(c => c.id !== contact.id);
        } else {
          return [...prev, contact];
        }
      });
    } else {
      setSelectedContacts([contact]);
      onContactsSelected([contact]);
    }
  };

  const handleCreateChat = () => {
    onContactsSelected(selectedContacts);
  };

  const isContactSelected = (contactId: string) => {
    return selectedContacts.some(c => c.id === contactId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          ←
        </Button>
        <div className="flex items-center gap-2">
          {isGroup ? <Users className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
          <h3 className="text-lg font-semibold">
            {isGroup ? "Create Group Chat" : "Start Individual Chat"}
          </h3>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search contacts..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Selected contacts for group chat */}
      {isGroup && selectedContacts.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Selected ({selectedContacts.length})</h4>
          <div className="flex flex-wrap gap-2">
            {selectedContacts.map(contact => (
              <Badge
                key={contact.id}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => handleContactToggle(contact)}
              >
                {contact.name} ×
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Contacts list */}
      <ScrollArea className="h-64">
        {loadingContacts ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading contacts...</span>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-8">
            <UserPlus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "No contacts found" : "No contacts available"}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredContacts.map(contact => (
              <div
                key={contact.id}
                onClick={() => handleContactToggle(contact)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent/50 ${
                  isContactSelected(contact.id) ? 'bg-accent' : ''
                }`}
              >
                {isGroup && (
                  <Checkbox
                    checked={isContactSelected(contact.id)}
                    onChange={() => {}}
                  />
                )}
                
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={contact.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {contact.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {contact.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-online-indicator rounded-full border-2 border-background"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate">
                    {contact.name}
                  </h4>
                  <p className="text-sm text-muted-foreground truncate">
                    {contact.isOnline ? "Online" : contact.lastSeen || "Offline"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Create button for group chat */}
      {isGroup && (
        <Button
          onClick={handleCreateChat}
          disabled={selectedContacts.length === 0 || loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            `Create Group (${selectedContacts.length})`
          )}
        </Button>
      )}
    </div>
  );
}