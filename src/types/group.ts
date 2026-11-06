import type { Place } from "./place";

export type InvitePermission = "admins-only" | "all-members";

export interface GroupMember {
  id: string;
  name: string;
  avatar?: string | null;
  isAdmin: boolean;
}

export interface Group {
  id: string;
  creator_id: string;
  name: string;
  description?: string;
  whoCanInvite: InvitePermission;
  members: GroupMember[];
  places: Place[];
  created_at: string;
  updated_at?: string;
  role?: string;
  joined_at?: string;
}
