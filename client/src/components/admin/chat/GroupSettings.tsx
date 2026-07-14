import { useEffect, useRef, useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../ui/dropdown-menu";
import {
  Loader2, Search, UserPlus, Users, Trash2, LogOut, Crown,
  X, Check, Pencil, MoreVertical, ShieldOff, Shield, Camera,
} from "lucide-react";
import { toast } from "../../../hooks/use-toast";
import { useAuth } from "../../../context/authContext";
import { GET } from "../../../api/api_utility";

export interface Member {
  _id: string;
  fullName: string;
  email?: string;
  avatar?: string;
  isAdmin?: boolean;
}

interface DirectoryUser {
  _id: string;
  fullName: string;
  avatar?: string;
  isOnline?: boolean;
}

interface GroupSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupName: string;
  groupAvatar?: string;
  members: Member[];
  currentUserId?: string;
  onlineUserIds?: string[];
  onAddMembers: (members: Member[]) => void;
  onRemoveMember: (memberId: string) => void;
  onLeaveGroup: () => void;
  onRenameGroup?: (name: string) => void;
  onToggleAdmin?: (memberId: string) => void;
  onUpdateGroupIcon?: (file: File) => void | Promise<void>;
  onRemoveGroupIcon?: () => void | Promise<void>;
}

export function GroupSettings({
  open,
  onOpenChange,
  groupName,
  groupAvatar,
  members,
  currentUserId,
  onlineUserIds = [],
  onAddMembers,
  onRemoveMember,
  onLeaveGroup,
  onRenameGroup,
  onToggleAdmin,
  onUpdateGroupIcon,
  onRemoveGroupIcon,
}: GroupSettingsProps) {
  const { user } = useAuth();
  const myId = currentUserId ?? ((user as any)?._id || (user as any)?.id);

  const [tab, setTab] = useState("members");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Member[]>([]);
  const [saving, setSaving] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [leaveOpen, setLeaveOpen] = useState(false);

  const [directory, setDirectory] = useState<DirectoryUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [isRenaming, setIsRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState(groupName);
  const [renaming, setRenaming] = useState(false);

  // ── group icon state ─────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(groupAvatar);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [removingIcon, setRemovingIcon] = useState(false);

  useEffect(() => {
    setAvatarPreview(groupAvatar);
  }, [groupAvatar]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setSelected([]);
      setTab("members");
      setIsRenaming(false);
    }
  }, [open]);

  useEffect(() => {
    setNameDraft(groupName);
  }, [groupName]);

  // fetch real users from the backend
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await GET("/api/v1/chat/users");
        if (!cancelled) setDirectory(res.data?.users || []);
      } catch (err) {
        console.error("Error fetching users:", err);
        if (!cancelled) {
          toast({ title: "Error", description: "Failed to load users", variant: "destructive" });
        }
      } finally {
        if (!cancelled) setLoadingUsers(false);
      }
    };
    fetchUsers();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const memberIds = new Set(members.map((m) => m._id));
  const addable = directory.filter(
    (u) =>
      !memberIds.has(u._id) &&
      u.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  const currentUserIsAdmin = members.find((m) => m._id === myId)?.isAdmin ?? false;

  const toggle = (u: DirectoryUser) => {
    setSelected((prev) =>
      prev.find((s) => s._id === u._id)
        ? prev.filter((s) => s._id !== u._id)
        : [...prev, u]
    );
  };

  const handleAdd = async () => {
    if (selected.length === 0) return;
    setSaving(true);
    try {
      const asMembers: Member[] = selected.map((u) => ({
        _id: u._id,
        fullName: u.fullName,
        avatar: u.avatar,
      }));
      await onAddMembers(asMembers);
      toast({
        title: "Members added",
        description: `Added ${selected.length} member${selected.length > 1 ? "s" : ""} to ${groupName}`,
      });
      setSelected([]);
      setTab("members");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;
    await onRemoveMember(memberToRemove._id);
    toast({
      title: "Member removed",
      description: `${memberToRemove.fullName} was removed from ${groupName}`,
    });
    setMemberToRemove(null);
  };

  const handleConfirmLeave = async () => {
    await onLeaveGroup();
    toast({ title: "Left group", description: `You have left ${groupName}` });
    setLeaveOpen(false);
    onOpenChange(false);
  };

  const handleSaveName = async () => {
    const trimmed = nameDraft.trim();
    if (!trimmed || trimmed === groupName) {
      setIsRenaming(false);
      setNameDraft(groupName);
      return;
    }
    setRenaming(true);
    try {
      await onRenameGroup?.(trimmed);
      toast({ title: "Group renamed", description: `Group name changed to "${trimmed}"` });
      setIsRenaming(false);
    } finally {
      setRenaming(false);
    }
  };

  const handleToggleAdmin = (m: Member) => {
    onToggleAdmin?.(m._id);
    const isYou = m._id === myId;
    toast({
      title: m.isAdmin ? "Admin removed" : "Made admin",
      description: m.isAdmin
        ? `${isYou ? "You are" : `${m.fullName} is`} no longer an admin`
        : `${isYou ? "You are" : `${m.fullName} is`} now an admin`,
    });
  };

  const handleIconFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file", variant: "destructive" });
      return;
    }

    // optimistic local preview
    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);
    setUploadingIcon(true);
    try {
      await onUpdateGroupIcon?.(file);
      toast({ title: "Group photo updated" });
    } catch (err) {
      console.error(err);
      setAvatarPreview(groupAvatar); // revert on failure
      toast({ title: "Error", description: "Failed to update group photo", variant: "destructive" });
    } finally {
      setUploadingIcon(false);
    }
  };

  const handleRemoveIcon = async () => {
    setRemovingIcon(true);
    try {
      await onRemoveGroupIcon?.();
      setAvatarPreview(undefined);
      toast({ title: "Group photo removed" });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to remove group photo", variant: "destructive" });
    } finally {
      setRemovingIcon(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="sr-only">{groupName}</DialogTitle>
          </DialogHeader>

          {/* ── Group avatar + name ─────────────────────────── */}
          <div className="flex flex-col items-center gap-3 -mt-2">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarPreview} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Users className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>

              {currentUserIsAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      disabled={uploadingIcon || removingIcon}
                      className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-background shadow-sm disabled:opacity-60"
                      aria-label="Change group photo"
                    >
                      {uploadingIcon || removingIcon ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Camera className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center">
                    <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                      <Camera className="h-4 w-4 mr-2" />
                      {avatarPreview ? "Change photo" : "Upload photo"}
                    </DropdownMenuItem>
                    {avatarPreview && (
                      <DropdownMenuItem
                        onClick={handleRemoveIcon}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove photo
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleIconFileChange}
              />
            </div>

            {isRenaming ? (
              <div className="flex items-center gap-1 w-full px-4">
                <Input
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") {
                      setIsRenaming(false);
                      setNameDraft(groupName);
                    }
                  }}
                  className="h-8 text-center"
                  autoFocus
                  disabled={renaming}
                />
                <Button size="sm" variant="ghost" disabled={renaming} onClick={handleSaveName}>
                  {renaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={renaming}
                  onClick={() => {
                    setIsRenaming(false);
                    setNameDraft(groupName);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold truncate max-w-[280px]">{groupName}</h3>
                {currentUserIsAdmin && onRenameGroup && (
                  <Button size="sm" variant="ghost" onClick={() => setIsRenaming(true)} aria-label="Edit group name">
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          <Tabs value={tab} onValueChange={setTab} className="w-full mt-2">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
              <TabsTrigger value="add">Add members</TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="mt-4">
              <ScrollArea className="h-72 pr-2">
                <div className="space-y-1">
                  {members.map((m) => {
                    const isYou = m._id === myId;
                    const isOnline = onlineUserIds.includes(m._id);
                    const showMenu = currentUserIsAdmin || isYou;
                    return (
                      <div
                        key={m._id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50"
                      >
                        <div className="relative">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={m.avatar} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {m.fullName.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          {isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">
                              {m.fullName} {isYou && <span className="text-muted-foreground">(You)</span>}
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

                        {showMenu && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" aria-label="Member actions">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {currentUserIsAdmin && onToggleAdmin && (
                                <DropdownMenuItem onClick={() => handleToggleAdmin(m)}>
                                  {m.isAdmin ? (
                                    <>
                                      <ShieldOff className="h-4 w-4 mr-2" />
                                      Dismiss as admin
                                    </>
                                  ) : (
                                    <>
                                      <Shield className="h-4 w-4 mr-2" />
                                      Make admin
                                    </>
                                  )}
                                </DropdownMenuItem>
                              )}
                              {!isYou && currentUserIsAdmin && (
                                <DropdownMenuItem
                                  onClick={() => setMemberToRemove(m)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Remove from group
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    );
                  })}
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
                      key={c._id}
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
                {loadingUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading contacts...</span>
                  </div>
                ) : addable.length === 0 ? (
                  <div className="text-center py-8">
                    <UserPlus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {search ? "No contacts found" : "All contacts are already members"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {addable.map((c) => {
                      const isSel = !!selected.find((s) => s._id === c._id);
                      return (
                        <div
                          key={c._id}
                          onClick={() => toggle(c)}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-accent/50 ${
                            isSel ? "bg-accent" : ""
                          }`}
                        >
                          <Checkbox
                            checked={isSel}
                            onClick={(e) => e.stopPropagation()}
                            onCheckedChange={() => toggle(c)}
                          />
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