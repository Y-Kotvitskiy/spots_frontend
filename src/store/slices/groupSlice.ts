import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from ".";
import type { Group, GroupMember, InvitePermission, Place } from "@/types";

interface GroupState {
  groups: Group[];
  selectedGroup: Group | null;
}

const initialState: GroupState = {
  groups: [],
  selectedGroup: null,
};

export const groupSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {
    setGroups: (state, action: PayloadAction<Group[]>) => {
      state.groups = action.payload;
    },

    createGroup: (
      state,
      action: PayloadAction<{
        name: string;
        description?: string;
        creator: { id: number; name: string; avatar?: string | null };
        whoCanInvite: InvitePermission;
      }>
    ) => {
      const { name, description, creator, whoCanInvite } = action.payload;
      
      const newGroup: Group = {
        id: Date.now(),
        name,
        description: description || "",
        creator_id: creator.id,
        whoCanInvite,
        members: [
          {
            id: creator.id,
            name: creator.name,
            avatar: creator.avatar,
            isAdmin: true, // Творець групи автоматично стає адміном
          },
        ],
        places: [],
        created_at: new Date().toISOString(),
      };

      state.groups.push(newGroup);
      state.selectedGroup = newGroup;
    },

    updateGroup: (
      state,
      action: PayloadAction<{
        groupId: number;
        name: string;
        description?: string;
        whoCanInvite: InvitePermission;
      }>
    ) => {
      const { groupId, name, description, whoCanInvite } = action.payload;
      const group = state.groups.find((g) => g.id === groupId);

      if (group) {
        group.name = name;
        group.description = description;
        group.whoCanInvite = whoCanInvite;

        if (state.selectedGroup?.id === groupId) {
          state.selectedGroup = group;
        }
      }
    },

    deleteGroup: (state, action: PayloadAction<number>) => {
      const groupId = action.payload;
      state.groups = state.groups.filter((g) => g.id !== groupId);
      if (state.selectedGroup?.id === groupId) {
        state.selectedGroup = state.groups[0] || null;
      }
    },

    setSelectedGroup: (state, action: PayloadAction<Group | null>) => {
      state.selectedGroup = action.payload;
    },

    clearSelectedGroup: (state) => {
      state.selectedGroup = null;
    },

    // Додавання учасника (наприклад, через інвайт-посилання або додавання)
    addMemberToGroup: (
      state,
      action: PayloadAction<{ groupId: number; member: GroupMember }>
    ) => {
      const { groupId, member } = action.payload;
      const group = state.groups.find((g) => g.id === groupId);
      if (group && !group.members.some((m) => m.id === member.id)) {
        group.members.push(member);
        if (state.selectedGroup?.id === groupId) {
          state.selectedGroup = group;
        }
      }
    },

    // Видалення учасника або вихід з групи
    removeMemberFromGroup: (state, action: PayloadAction<{ groupId: number | string; memberId: number | string }>) => {
      const { groupId, memberId } = action.payload;
      const groupIndex = state.groups.findIndex((g) => g.id === groupId);

      if (groupIndex !== -1) {
        const group = state.groups[groupIndex];
        
        // Фільтруємо учасників, залишаючи лише тих, чий ID не співпадає з видаленим
        group.members = group.members.filter((m) => m.id !== memberId);

        // Якщо після цього масив учасників став повністю пустим — видаляємо групу
        if (group.members.length === 0) {
          state.groups.splice(groupIndex, 1); // Безпечне видалення конкретної групи зі списку

          // Якщо ця група була активною, скидаємо вибір
          if (state.selectedGroup?.id === groupId) {
            state.selectedGroup = null;
          }
        }
      }
    },

    // Шерінг місця у групу
    sharePlaceToGroup: (
      state,
      action: PayloadAction<{ groupId: number; place: Place }>
    ) => {
      const { groupId, place } = action.payload;
      const group = state.groups.find((g) => g.id === groupId);
      if (group && !group.places.some((p) => p.id === place.id)) {
        group.places.push(place);
        if (state.selectedGroup?.id === groupId) {
          state.selectedGroup = group;
        }
      }
    },

    // Видалення місця з групи
    removePlaceFromGroup: (
      state,
      action: PayloadAction<{ groupId: number; placeId: number }>
    ) => {
      const { groupId, placeId } = action.payload;
      const group = state.groups.find((g) => g.id === groupId);
      if (group) {
        group.places = group.places.filter((p) => p.id !== placeId);
        if (state.selectedGroup?.id === groupId) {
          state.selectedGroup = group;
        }
      }
    },
  },
});

export const {
  setGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  setSelectedGroup,
  clearSelectedGroup,
  addMemberToGroup,
  removeMemberFromGroup,
  sharePlaceToGroup,
  removePlaceFromGroup,
} = groupSlice.actions;

export default groupSlice.reducer;
export const groupActions = groupSlice.actions;

// Селектори
export const selectGroups = (state: RootState) => state.groups.groups;
export const selectSelectedGroup = (state: RootState) => state.groups.selectedGroup;