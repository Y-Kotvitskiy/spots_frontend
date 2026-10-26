import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from ".";
import type { Place } from "@/types";

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

interface MapState {
  selectedCoords: SelectedPoint | null;
  selectedPlace: Place | null;
  savedPlaces: Place[];
  mapMode: MapMode; // Режим выбора
}

const mockSlice: Place[] = [
  {
    id: 1793028013425,
    creator_id: 1,
    name: "Test",
    description: "Description",
    category: "Restaurant",
    tags: ["Power outlets", "Outdoor seating"],
    address: "Це тестова адреса! 2026-10-26T15:17:21.394Z",
    latitude: 50.4501,
    longitude: 30.5234,
    created_at: "2026-10-26T15:20:13.425Z",
  },
];

const initialState: MapState = {
  selectedPlace: null,
  selectedCoords: null,
  savedPlaces: mockSlice,
  mapMode: MapMode.Show,
};

export const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    setSelectedCoords: (state, action: PayloadAction<SelectedPoint | null>) => {
      state.selectedCoords = action.payload;
    },

    addPlace: (state, action: PayloadAction<Place>) => {
      state.savedPlaces.push(action.payload);
    },

    removePlace: (state, action: PayloadAction<number>) => {
      state.savedPlaces.splice(action.payload, 1);
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
});

export const {
  setSelectedCoords,
  addPlace,
  removePlace,
  setMapMode,
  setSelectedPlace,
  clearSelectedPlace,
  clearSelectedCoord,
} = mapSlice.actions;

export default mapSlice.reducer;

export const { actions } = mapSlice;

export const selectMapMode = (state: RootState) => state.map.mapMode;

export const selectIsPickingMode = (state: RootState) =>
  state.map.mapMode === MapMode.Select;

export const selectSelectedCoords = (state: RootState) =>
  state.map.selectedCoords;

export const selectSavedPlaces = (state: RootState) => state.map.savedPlaces;

export const selectSelectedPlaces = (state: RootState) =>
  state.map.selectedPlace;
