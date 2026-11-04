import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "..";
import {
  Tag,
  type BackendPlace,
  type CreatePlace,
  type ErrorResponse,
  type Place,
} from "@/types";
import { taxonomyService } from "@/services/taxonomyService";
import { placeService } from "@/services/placeService";
import type { AxiosError } from "axios";

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
  mapMode: MapMode; // Режим выбора
  status: "idle" | "loading" | "succeeded" | "failed";
  error: ErrorResponse | null;
}

function convertToFrontendPlace(backendPlace: BackendPlace): Place {
  return {
    ...backendPlace,
    categoryId: backendPlace.categories[0]?.id || "",
    tags: backendPlace.tags.map((tag) => tag.id as keyof typeof Tag),
  };
}

export const fetchInitialData = createAsyncThunk<
  { tags: TagRecord; categories: CategoryRecord; places: Place[] },
  void,
  { rejectValue: ErrorResponse }
>("map/fetchInitialData", async (_, { rejectWithValue }) => {
  try {
    const backendPlaces = await placeService.getAll();
    const categories = await taxonomyService.getAll("categories");
    const tags = await taxonomyService.getAll("tags");
    const places = backendPlaces.map((place) => convertToFrontendPlace(place));

    const result = {
      places,
      categories,
      tags,
    };

    return result;
  } catch (err: any) {
    console.error("Error fetching initial data:", err);
    const error = err as AxiosError<ErrorResponse>;

    return rejectWithValue(error.response?.data || SERVER_ERROR_MESSAGE);
  }
});

export const addPlace = createAsyncThunk(
  "places/addPlace",
  async (newPlaceData: CreatePlace, { rejectWithValue }) => {
    try {
      const backendPlace = await placeService.create(newPlaceData);

      return convertToFrontendPlace(backendPlace);
    } catch (err: any) {
      const error = err as AxiosError<ErrorResponse>;
      return rejectWithValue(error.response?.data || SERVER_ERROR_MESSAGE);
    }
  },
);

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

    removePlace: (state, action: PayloadAction<string | number>) => {
      state.savedPlaces = state.savedPlaces.filter(
        (place) => place.id !== action.payload,
      );
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
  },

  extraReducers: (builder) => {
    builder.addCase(fetchInitialData.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.savedPlaces = action.payload.places;
      state.categories = action.payload.categories;
      state.tags = action.payload.tags;
    });

    builder.addCase(addPlace.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.savedPlaces = [...state.savedPlaces, action.payload];
    });

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

export const actions = {
  ...mapSlice.actions,
  addPlace,
  fetchInitialData,
};

export default mapSlice.reducer;

export const selectMapMode = (state: RootState) => state.map.mapMode;

export const selectIsPickingMode = (state: RootState) =>
  state.map.mapMode === MapMode.Select;

export const selectSelectedCoords = (state: RootState) =>
  state.map.selectedCoords;

export const selectSavedPlaces = (state: RootState) => state.map.savedPlaces;

export const selectSelectedPlaces = (state: RootState) =>
  state.map.selectedPlace;
