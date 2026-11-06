import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "..";
import {
  Tag,
  type BackendPhoto,
  type BackendPlace,
  type CreatePlace,
  type ErrorResponse,
  type Place,
  type PlacePhotos,
} from "@/types";
import { taxonomyService } from "@/services/taxonomyService";
import { placeService } from "@/services/placeService";
import type { AxiosError } from "axios";

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface SelectedPoint {
  lat: number;
  lng: number;
  address: string;
}

export enum MapMode {
  Show = "show",
  Select = "select",
  Add = "add",
}

type CategoryRecord = Record<string, string>;
type TagRecord = Record<string, string>;

const SERVER_ERROR_MESSAGE = { detail: "Ошибка сервера" };

export interface MapState {
  selectedCoords: SelectedPoint | null;
  selectedPlace: Place | null;
  savedPlaces: Place[];
  categories: CategoryRecord;
  tags: TagRecord;
  mapMode: MapMode;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: ErrorResponse | null;
}

// ==========================================
// HELPERS (CONVERTERS)
// ==========================================

export function convertToFrontendPlace(
  backendPlace: BackendPlace,
  categories: CategoryRecord,
  tagsRecord: TagRecord = {},
): Place {
  return {
    ...backendPlace,
    category: categories[backendPlace.categories[0]?.id] || "Park",
    categoryId: backendPlace.categories[0]?.id || "",
    tags: backendPlace.tags.map((tag: any) => {
      const tagId = typeof tag === "string" ? tag : tag.id;
      return tagsRecord[tagId] || tag.name || tagId;
    }),
    opening_hours: backendPlace.opening_hours || null,
    creator_name: backendPlace.creator_name,
    photos: backendPlace.photos?.reduce((acc, curr) => {
      acc[curr.position] = curr;
      return acc;
    }, {} as PlacePhotos),
  };
}

// ==========================================
// ASYNC THUNKS
// ==========================================

export const fetchInitialData = createAsyncThunk<
  { tags: TagRecord; categories: CategoryRecord; places: Place[] },
  void,
  { rejectValue: ErrorResponse }
>("map/fetchInitialData", async (_, { rejectWithValue }) => {
  try {
    const backendPlaces = await placeService.getAll();
    const categories = await taxonomyService.getAll("categories");
    const tags = await taxonomyService.getAll("tags");
    
    const places = backendPlaces.map((place) =>
      convertToFrontendPlace(place, categories, tags),
    );

    return { places, categories, tags };
  } catch (err: any) {
    console.error("Error fetching initial data:", err);
    const error = err as AxiosError<ErrorResponse>;
    return rejectWithValue(error.response?.data || SERVER_ERROR_MESSAGE);
  }
});

export const fetchPlaceById = createAsyncThunk<
  Place,
  string,
  { state: RootState; rejectValue: ErrorResponse }
>("map/fetchPlaceById", async (placeId, { getState, rejectWithValue }) => {
  try {
    const backendPlace = await placeService.getById(placeId);
    const { categories, tags } = getState().map;
    return convertToFrontendPlace(backendPlace, categories, tags);
  } catch (err: any) {
    const error = err as AxiosError<ErrorResponse>;
    return rejectWithValue(error.response?.data || SERVER_ERROR_MESSAGE);
  }
});

export const addPlace = createAsyncThunk<
  Place,
  CreatePlace,
  { state: RootState; rejectValue: ErrorResponse }
>("places/addPlace", async (newPlaceData, { getState, rejectWithValue }) => {
  try {
    const backendPlace = await placeService.create(newPlaceData);
    const { categories, tags } = getState().map;
    return convertToFrontendPlace(backendPlace, categories, tags);
  } catch (err: any) {
    const error = err as AxiosError<ErrorResponse>;
    return rejectWithValue(error.response?.data || SERVER_ERROR_MESSAGE);
  }
});

export const uploadPlacePhoto = createAsyncThunk<
  { placeId: string; photo: BackendPhoto },
  { placeId: string; file: File },
  { rejectValue: ErrorResponse }
>("map/uploadPlacePhoto", async ({ placeId, file }, { rejectWithValue }) => {
  try {
    const photo = await placeService.addPhoto(placeId, file);
    return { placeId, photo };
  } catch (err: any) {
    const error = err as AxiosError<ErrorResponse>;
    return rejectWithValue(error.response?.data || SERVER_ERROR_MESSAGE);
  }
});

// ==========================================
// INITIAL STATE & SLICE
// ==========================================

const initialState: MapState = {
  selectedPlace: null,
  selectedCoords: null,
  savedPlaces: [],
  categories: {},
  tags: {},
  mapMode: MapMode.Show,
  status: "idle",
  error: null,
};

export const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    setSelectedCoords: (state, action: PayloadAction<SelectedPoint | null>) => {
      state.selectedCoords = action.payload;
    },

    removePlace: (state, action: PayloadAction<string>) => {
      state.savedPlaces = state.savedPlaces.filter(
        (place) => place.id !== action.payload,
      );
      if (state.selectedPlace?.id === action.payload) {
        state.selectedPlace = null;
      }
    },

    setMapMode: (state, action: PayloadAction<MapMode>) => {
      state.mapMode = action.payload;
    },

    setSelectedPlace: (state, action: PayloadAction<Place>) => {
      state.selectedPlace = action.payload;
    },

    clearSelectedPlace: (state) => {
      state.selectedPlace = null;
    },

    clearSelectedCoord: (state) => {
      state.selectedCoords = null;
    },

    updatePlace: (state, action: PayloadAction<Partial<Place>>) => {
      const index = state.savedPlaces.findIndex(
        (p) => p.id === action.payload.id,
      );

      if (index !== -1) {
        state.savedPlaces[index] = {
          ...state.savedPlaces[index],
          ...action.payload,
        };
      }
    },

    resetAddPlaceStatus: (state) => {
      state.status = "idle";
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    // Initial Data
    builder.addCase(fetchInitialData.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.savedPlaces = action.payload.places;
      state.categories = action.payload.categories;
      state.tags = action.payload.tags;
    });

    // Add Place
    builder.addCase(addPlace.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.savedPlaces = [...state.savedPlaces, action.payload];
    });

    // Fetch Place By Id
    builder.addCase(fetchPlaceById.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.selectedPlace = action.payload;

      const idx = state.savedPlaces.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) {
        state.savedPlaces[idx] = action.payload;
      }
    });

    // Upload Photo
    builder.addCase(uploadPlacePhoto.fulfilled, (state, action) => {
      state.status = "succeeded";
      const { placeId, photo } = action.payload;

      if (state.selectedPlace && state.selectedPlace.id === placeId) {
        state.selectedPlace.photos = {
          ...(state.selectedPlace.photos || {}),
          [photo.position]: photo,
        };
      }

      const placeInList = state.savedPlaces.find((p) => p.id === placeId);
      if (placeInList) {
        placeInList.photos = {
          ...(placeInList.photos || {}),
          [photo.position]: photo,
        };
      }
    });

    // Global Matchers for Pending / Rejected
    builder
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.status = "loading";
          state.error = null;
        },
      )
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action) => {
          state.status = "failed";
          state.error =
            "payload" in action
              ? (action.payload as ErrorResponse)
              : SERVER_ERROR_MESSAGE;
        },
      );
  },
});

// ==========================================
// EXPORTS (ACTIONS & REDUCER)
// ==========================================

export const actions = {
  ...mapSlice.actions,
  addPlace,
  fetchInitialData,
  fetchPlaceById,
  uploadPlacePhoto,
};

export default mapSlice.reducer;

// ==========================================
// SELECTORS
// ==========================================

export const selectMapMode = (state: RootState) => state.map.mapMode;
export const selectIsPickingMode = (state: RootState) => state.map.mapMode === MapMode.Select;
export const selectSelectedCoords = (state: RootState) => state.map.selectedCoords;
export const selectSavedPlaces = (state: RootState) => state.map.savedPlaces;
export const selectSelectedPlaces = (state: RootState) => state.map.selectedPlace;