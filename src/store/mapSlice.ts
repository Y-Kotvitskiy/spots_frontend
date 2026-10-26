import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from ".";
import type { Place } from "@/types";

export interface SelectedPoint {
  id?: string; // Полезно, если точек несколько
  lat: number;
  lng: number;
  address: string;
}

interface MapState {
  selectedCoords: SelectedPoint | null; // Текущая выбранная точка (например, для формы создания)
  savedPlaces: Place[];
  isPickingMode: boolean; // Режим выбора
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
  selectedCoords: null,
  savedPlaces: mockSlice,
  isPickingMode: false,
};

export const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    // Установка активной точки (например, при клике или поиске)
    setSelectedCoords: (state, action: PayloadAction<SelectedPoint | null>) => {
      state.selectedCoords = action.payload;
    },

    // Добавление точки в общий список сохраненных
    addPlace: (state, action: PayloadAction<Place>) => {
      state.savedPlaces.push(action.payload);
    },

    // Удаление точки из сохраненных по индексу или id
    removePlace: (state, action: PayloadAction<number>) => {
      state.savedPlaces.splice(action.payload, 1);
    },

    // Управление режимом выбора
    togglePickingMode: (state) => {
      state.isPickingMode = !state.isPickingMode;
    },

    setPickingMode: (state, action: PayloadAction<boolean>) => {
      state.isPickingMode = action.payload;
    },
  },
});

export const {
  setSelectedCoords,
  addPlace,
  removePlace,
  togglePickingMode,
  setPickingMode,
} = mapSlice.actions;

export default mapSlice.reducer;
export const { actions } = mapSlice;

export const selectIsPickingMode = (state: RootState) =>
  state.map.isPickingMode;
export const selectSelectedCoords = (state: RootState) =>
  state.map.selectedCoords;
export const selectSavedPoints = (state: RootState) => state.map.savedPlaces;
