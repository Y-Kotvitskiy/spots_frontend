import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Group, GroupMember, InvitePermission, Place, ErrorResponse } from "@/types";
import type { RootState } from "..";
import { groupService, type BackendGroup, type CreateGroupDto } from "@/services/groupService";
import { AxiosError } from "axios";

// ==========================================
// TYPES & INTERFACES
// ==========================================

interface GroupState {
  groups: Group[];
  selectedGroup: Group | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: ErrorResponse | null;
}

const SERVER_ERROR_MESSAGE = { detail: "Помилка сервера" };

const initialState: GroupState = {
  groups: [],
  selectedGroup: null,
  status: "idle",
  error: null,
};

// ==========================================
// HELPERS (CONVERTERS)
// ==========================================

// Конвертація з бекенд-формату у фронтенд-формат [ПОТРІБНЕ ДОПРАЦЮВАННЯ БЕКЕНДУ ДЛЯ ГРУП]
function convertToFrontendGroup(backendGroup: BackendGroup): Group {
  return {
    ...backendGroup,
    description: backendGroup.description || "",
    whoCanInvite: "all-members",
    members: [],
    places: [],
  };
}

// ==========================================
// ASYNC THUNKS [ПОТРІБНЕ ДОПРАЦЮВАННЯ БЕКЕНДУ ДЛЯ ГРУП]
// ==========================================

export const fetchGroups = createAsyncThunk<
  Group[],
  void,
  { rejectValue: ErrorResponse }
>("groups/fetchGroups", async (_, { rejectWithValue }) => {
  try {
    const backendGroups = await groupService.getAll();
    return backendGroups.map(convertToFrontendGroup);
  } catch (err: any) {
    const error = err as AxiosError<ErrorResponse>;
    return rejectWithValue(error.response?.data || SERVER_ERROR_MESSAGE);
  }
});

export const createGroup = createAsyncThunk<
  Group,
  CreateGroupDto,
  { rejectValue: ErrorResponse }
>("groups/createGroup", async (groupData, { rejectWithValue }) => {
  try {
    const backendGroup = await groupService.create(groupData);
    return convertToFrontendGroup(backendGroup);
  } catch (err: any) {
    const error = err as AxiosError<ErrorResponse>;
    return rejectWithValue(error.response?.data || SERVER_ERROR_MESSAGE);
  }
});

export const deleteGroup = createAsyncThunk<
  string,
  string,
  { rejectValue: ErrorResponse }
>("groups/deleteGroup", async (groupId, { rejectWithValue }) => {
  try {
    await groupService.delete(groupId);
    return groupId;
  } catch (err: any) {
    const error = err as AxiosError<ErrorResponse>;
    return rejectWithValue(error.response?.data || SERVER_ERROR_MESSAGE);
  }
});

// ==========================================
// SLICE & REDUCERS
// ==========================================

export const groupSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {
    setSelectedGroup: (state, action: PayloadAction<Group | null>) => {
      state.selectedGroup = action.payload;
    },

    clearSelectedGroup: (state) => {
      state.selectedGroup = null;
    },

    // Локальне оновлення групи [ПОТРІБНЕ ДОПРАЦЮВАННЯ БЕКЕНДУ ДЛЯ ГРУП]
    updateGroup: (
      state,
      action: PayloadAction<{
        groupId: string;
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

    // Додавання учасника до групи [ПОТРІБНЕ ДОПРАЦЮВАННЯ БЕКЕНДУ ДЛЯ ГРУП]
    addMemberToGroup: (
      state,
      action: PayloadAction<{ groupId: string; member: GroupMember }>
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

    // Видалення учасника з групи / вихід з групи [ПОТРІБНЕ ДОПРАЦЮВАННЯ БЕКЕНДУ ДЛЯ ГРУП]
    removeMemberFromGroup: (
      state,
      action: PayloadAction<{ groupId: string; memberId: string }>
    ) => {
      const { groupId, memberId } = action.payload;
      const groupIndex = state.groups.findIndex((g) => g.id === groupId);

      if (groupIndex !== -1) {
        const group = state.groups[groupIndex];
        group.members = group.members.filter((m) => m.id !== memberId);

        if (state.selectedGroup?.id === groupId) {
          state.selectedGroup = group;
        }
      }
    },

    // Надання прав адміністратора учаснику [ПОТРІБНЕ ДОПРАЦЮВАННЯ БЕКЕНДУ ДЛЯ ГРУП]
    makeMemberAdmin: (
      state,
      _action: PayloadAction<{ groupId: string; memberId: string }>
    ) => {
      // Заготовка під логіку на майбутнє
    },

    // Шерінг місця у групу [ПОТРІБНЕ ДОПРАЦЮВАННЯ БЕКЕНДУ ДЛЯ ГРУП]
    sharePlaceToGroup: (
      state,
      action: PayloadAction<{ groupId: string; place: Place }>
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

    // Видалення місця з групи [ПОТРІБНЕ ДОПРАЦЮВАННЯ БЕКЕНДУ ДЛЯ ГРУП]
    removePlaceFromGroup: (
      state,
      action: PayloadAction<{ groupId: string; placeId: string }>
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

  extraReducers: (builder) => {
    // Отримання груп
    builder.addCase(fetchGroups.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.groups = action.payload;
    });

    // Створення групи
    builder.addCase(createGroup.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.groups.push(action.payload);
      state.selectedGroup = action.payload;
    });

    // Видалення групи
    builder.addCase(deleteGroup.fulfilled, (state, action) => {
      state.status = "succeeded";
      const groupId = action.payload;
      state.groups = state.groups.filter((g) => g.id !== groupId);
      if (state.selectedGroup?.id === groupId) {
        state.selectedGroup = state.groups[0] || null;
      }
    });
  },
});

// ==========================================
// EXPORTS (ACTIONS & REDUCER)
// ==========================================

export const groupActions = {
  ...groupSlice.actions,
  fetchGroups,
  createGroup,
  deleteGroup,
};

export default groupSlice.reducer;

// ==========================================
// SELECTORS
// ==========================================

export const selectGroups = (state: RootState) => state.groups.groups;
export const selectSelectedGroup = (state: RootState) => state.groups.selectedGroup;