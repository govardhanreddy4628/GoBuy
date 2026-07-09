import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { ScrollArea } from "../../../ui/scroll-area";
import { Checkbox } from "../../../ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../ui/tabs";
import { Badge } from "../../../ui/badge";
import { Loader2, Search, UserPlus, Users, Trash2, LogOut, Crown } from "lucide-react";
//import { toast } from "../../../hooks/use-toast";

export interface Member {
  id: string;
  fullName: string;
  email?: string;
  avatar?: string;
  isOnline?: boolean;
  isAdmin?: boolean;
  isYou?: boolean;
}

interface GroupSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupName: string;
  members: Member[];
  onAddMembers: (members: Member[]) => void;
  onRemoveMember: (memberId: string) => void;
  onLeaveGroup: () => void;
  onRenameGroup?: (name: string) => void;
}

const availableContacts: Member[] = [
  { id: "c1", fullName: "Sarah Johnson", email: "sarah@example.com", isOnline: true },
  { id: "c2", fullName: "Mike Chen", email: "mike@example.com", isOnline: false },
  { id: "c3", fullName: "Emily Davis", email: "emily@example.com", isOnline: true },
  { id: "c4", fullName: "Alex Wilson", email: "alex@example.com", isOnline: false },
  { id: "c5", fullName: "Jessica Brown", email: "jessica@example.com", isOnline: true },
  { id: "c6", fullName: "David Lee", email: "david@example.com", isOnline: false },
  { id: "c7", fullName: "Priya Patel", email: "priya@example.com", isOnline: true },
];

export function GroupSettings({
  open,
  onOpenChange,
  groupName,
  members,
  onAddMembers,
  onRemoveMember,
  onLeaveGroup,
  onRenameGroup,
}: GroupSettingsProps) {
  const [tab, setTab] = useState("members");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Member[]>([]);
  const [saving, setSaving] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [leaveOpen, setLeaveOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setSelected([]);
      setTab("members");
    }
  }, [open]);

  const memberIds = new Set(members.map((m) => m.id));
  const addable = availableContacts.filter(
    (c) =>
      !memberIds.has(c.id) &&
      (c.fullName.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()))
  );

  const toggle = (c: Member) => {
    setSelected((prev) =>
      prev.find((s) => s.id === c.id)
        ? prev.filter((s) => s.id !== c.id)
        : [...prev, c]
    );
  };

  const handleAdd = async () => {
    if (selected.length === 0) return;
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 800)); // mock API
      onAddMembers(selected);
      // toast({
      //   title: "Members added",
      //   description: `Added ${selected.length} member${selected.length > 1 ? "s" : ""} to ${groupName}`,
      // });
      setSelected([]);
      setTab("members");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;
    await new Promise((r) => setTimeout(r, 400));
    onRemoveMember(memberToRemove.id);
    // toast({
    //   title: "Member removed",
    //   description: `${memberToRemove.name} was removed from ${groupName}`,
    // });
    setMemberToRemove(null);
  };

  const handleConfirmLeave = async () => {
    await new Promise((r) => setTimeout(r, 400));
    onLeaveGroup();
    // toast({
    //   title: "Left group",
    //   description: `You have left ${groupName}`,
    // });
    setLeaveOpen(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {groupName}
            </DialogTitle>
          </DialogHeader>

          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
              <TabsTrigger value="add">Add members</TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="mt-4">
              <ScrollArea className="h-72 pr-2">
                <div className="space-y-1">
                  {members.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50"
                    >
                      <div className="relative">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={m.avatar} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {m.fullName.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        {m.isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-online-indicator rounded-full border-2 border-background" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">
                            {m.fullName} {m.isYou && <span className="text-muted-foreground">(You)</span>}
                          </p>
                          {m.isAdmin && (
                            <Badge variant="secondary" className="h-5 gap-1 px-1.5">
                              <Crown className="h-3 w-3" /> Admin
                            </Badge>
                          )}
                        </div>
                        {m.email && (
                          <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                        )}
                      </div>
                      {!m.isYou && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setMemberToRemove(m)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <DialogFooter className="mt-4">
                <Button
                  variant="outline"
                  className="w-full text-destructive hover:text-destructive"
                  onClick={() => setLeaveOpen(true)}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Leave group
                </Button>
              </DialogFooter>
            </TabsContent>

            <TabsContent value="add" className="mt-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {selected.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selected.map((c) => (
                    <Badge
                      key={c.id}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => toggle(c)}
                    >
                      {c.fullName} ×
                    </Badge>
                  ))}
                </div>
              )}

              <ScrollArea className="h-56 pr-2">
                {addable.length === 0 ? (
                  <div className="text-center py-8">
                    <UserPlus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {search ? "No contacts found" : "All contacts are already members"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {addable.map((c) => {
                      const isSel = !!selected.find((s) => s.id === c.id);
                      return (
                        <div
                          key={c.id}
                          onClick={() => toggle(c)}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-accent/50 ${
                            isSel ? "bg-accent" : ""
                          }`}
                        >
                          <Checkbox checked={isSel} onChange={() => {}} />
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={c.avatar} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {c.fullName.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{c.fullName}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {c.isOnline ? "Online" : "Offline"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>

              <Button
                className="w-full"
                onClick={handleAdd}
                disabled={selected.length === 0 || saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add {selected.length > 0 ? `(${selected.length})` : ""}
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!memberToRemove} onOpenChange={(o) => !o && setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member?</AlertDialogTitle>
            <AlertDialogDescription>
              {memberToRemove?.fullName} will be removed from {groupName} and will no longer receive messages from this group.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave {groupName}?</AlertDialogTitle>
            <AlertDialogDescription>
              You will stop receiving messages from this group. You can be added back by any member.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmLeave}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
