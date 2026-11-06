import { httpClient } from "../http/httpClient";

export interface BackendGroup {
  id: string;
  creator_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  role?: string;
  joined_at?: string;
}

export interface CreateGroupDto {
  name: string;
  description?: string;
}

export const groupService = {
  getAll: (): Promise<BackendGroup[]> => httpClient.get("/groups"),

  create: (data: CreateGroupDto): Promise<BackendGroup> =>
    httpClient.post("/groups", data),

  update: (groupId: string, data: CreateGroupDto): Promise<BackendGroup> =>
    httpClient.patch(`/groups/${groupId}`, data),

  delete: (groupId: string): Promise<void> =>
    httpClient.delete(`/groups/${groupId}`),
};