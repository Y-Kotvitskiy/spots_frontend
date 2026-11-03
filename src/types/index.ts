import type { Place } from "./place";

export * from "./user";
export * from "./changePassword";
export * from "./changeEmail";
export * from "./place";
export * from "./errorResponse";

export type InvitePermission = "admins-only" | "all-members";

export interface GroupMember {
  id: number;
  name: string;
  avatar?: string | null;
  isAdmin: boolean;
}

export interface Group {
  id: number;
  name: string;
  description?: string;
  creator_id: number;
  whoCanInvite: InvitePermission;
  members: GroupMember[];
  places: Place[];
  created_at: string;
}
