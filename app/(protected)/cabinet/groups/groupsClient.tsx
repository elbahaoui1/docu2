"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Separator } from "@/components/ui/Separator";
import { Alert } from "@/components/ui/Alert";
import { Plus, UserPlus, X, Users, Search, Loader2, FolderOpen, ChevronDown, ChevronUp } from "lucide-react";

type UserLite = { id: string; email: string };
type Group = { id: string; name: string; members: { user: UserLite }[] };

export default function GroupsClient({ isAdmin, cabinetId, groups, users }: { isAdmin: boolean; cabinetId: string; groups: Group[]; users: UserLite[]; }) {
  const [groupName, setGroupName] = useState("");
  const [working, setWorking] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [memberSearchTerm, setMemberSearchTerm] = useState<{ [groupId: string]: string }>({});

  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return groups;
    const term = searchTerm.toLowerCase();
    return groups.filter(g => 
      g.name.toLowerCase().includes(term) || 
      g.members.some(m => m.user.email.toLowerCase().includes(term))
    );
  }, [groups, searchTerm]);

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setWorking("create");
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/cabinets/${cabinetId}/groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: groupName })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Failed to create group");
      } else {
        setMessage("Group created successfully!");
        setGroupName("");
        setTimeout(() => window.location.reload(), 800);
      }
    } catch (e) {
      setError("Unexpected error occurred");
    } finally {
      setWorking(null);
    }
  };

  const addToGroup = async (groupId: string, userId: string) => {
    setWorking(`${groupId}:${userId}`);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/cabinets/${cabinetId}/groups/${groupId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Failed to add member");
      } else {
        setMessage("Member added successfully!");
        setTimeout(() => window.location.reload(), 600);
      }
    } catch (e) {
      setError("Unexpected error occurred");
    } finally {
      setWorking(null);
    }
  };

  const removeFromGroup = async (groupId: string, userId: string) => {
    setWorking(`${groupId}:${userId}`);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/cabinets/${cabinetId}/groups/${groupId}/members?userId=${userId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Failed to remove member");
      } else {
        setMessage("Member removed successfully!");
        setTimeout(() => window.location.reload(), 600);
      }
    } catch (e) {
      setError("Unexpected error occurred");
    } finally {
      setWorking(null);
    }
  };

  const toggleGroupExpansion = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const getFilteredUsers = (groupId: string, group: Group) => {
    const term = memberSearchTerm[groupId]?.toLowerCase() || "";
    if (!term) return users;
    return users.filter(u => u.email.toLowerCase().includes(term));
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Groups</h1>
            <p className="text-sm text-muted-foreground">
              {isAdmin ? "Create and manage team groups for better organization" : "View and access your group memberships"}
            </p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {message && (
        <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium">{message}</span>
          </div>
        </Alert>
      )}
      {error && (
        <Alert className="border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        </Alert>
      )}

      {/* Create Group Form (Admin Only) */}
      {isAdmin && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-5 w-5" />
              Create New Group
            </CardTitle>
            <CardDescription>Add a new group to organize your team members</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createGroup} className="flex gap-3">
              <Input 
                placeholder="Enter group name..." 
                value={groupName} 
                onChange={(e) => setGroupName(e.target.value)} 
                required 
                className="flex-1"
                disabled={working === "create"}
              />
              <Button type="submit" disabled={working === "create"} className="gap-2">
                {working === "create" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Group
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search Bar */}
      {groups.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search groups or members..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Groups Grid */}
      {filteredGroups.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map((g) => {
            const isExpanded = expandedGroups.has(g.id);
            const availableUsers = getFilteredUsers(g.id, g).filter(u => !g.members.some(m => m.user.id === u.id));
            
            return (
              <Card key={g.id} className="flex flex-col transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{g.name}</CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        {g.members.length} {g.members.length === 1 ? "member" : "members"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 space-y-4">
                  {/* Members List */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Members</div>
                    {g.members.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {g.members.map((m) => (
                          <div key={m.user.id} className="group relative">
                            <Badge variant="secondary" className="gap-1.5 pr-1 transition-colors">
                              <span className="max-w-[140px] truncate">{m.user.email}</span>
                              {isAdmin && (
                                <button
                                  onClick={() => removeFromGroup(g.id, m.user.id)}
                                  disabled={working === `${g.id}:${m.user.id}`}
                                  className="ml-0.5 rounded-sm p-0.5 opacity-60 transition-opacity hover:bg-destructive hover:text-destructive-foreground hover:opacity-100 disabled:opacity-40"
                                  title="Remove member"
                                >
                                  {working === `${g.id}:${m.user.id}` ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <X className="h-3 w-3" />
                                  )}
                                </button>
                              )}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-center">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">No members yet</span>
                      </div>
                    )}
                  </div>

                  {/* Add Members Section (Admin Only) */}
                  {isAdmin && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleGroupExpansion(g.id)}
                          className="w-full gap-2"
                        >
                          <UserPlus className="h-4 w-4" />
                          Add Members
                          {isExpanded ? <ChevronUp className="ml-auto h-4 w-4" /> : <ChevronDown className="ml-auto h-4 w-4" />}
                        </Button>
                        
                        {isExpanded && (
                          <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
                            <Input
                              placeholder="Search users..."
                              value={memberSearchTerm[g.id] || ""}
                              onChange={(e) => setMemberSearchTerm({ ...memberSearchTerm, [g.id]: e.target.value })}
                              className="h-8 text-sm"
                            />
                            <div className="max-h-[200px] space-y-1 overflow-y-auto">
                              {availableUsers.length > 0 ? (
                                availableUsers.map((u) => (
                                  <div
                                    key={u.id}
                                    className="flex items-center justify-between rounded-md border bg-background p-2 text-sm transition-colors hover:bg-muted/50"
                                  >
                                    <span className="truncate text-sm">{u.email}</span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => addToGroup(g.id, u.id)}
                                      disabled={working === `${g.id}:${u.id}`}
                                      className="h-7 gap-1 px-2"
                                    >
                                      {working === `${g.id}:${u.id}` ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      ) : (
                                        <>
                                          <Plus className="h-3.5 w-3.5" />
                                          Add
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                ))
                              ) : (
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                  {memberSearchTerm[g.id] ? "No users found" : "All users are already members"}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <FolderOpen className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mt-6 text-lg font-semibold">
              {searchTerm ? "No groups found" : "No groups yet"}
            </h3>
            <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
              {searchTerm 
                ? "Try adjusting your search criteria" 
                : isAdmin 
                  ? "Get started by creating your first group to organize your team members" 
                  : "You haven't been added to any groups yet"
              }
            </p>
            {searchTerm && (
              <Button
                variant="outline"
                onClick={() => setSearchTerm("")}
                className="mt-4"
              >
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}


