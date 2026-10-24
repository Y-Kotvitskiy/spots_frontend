import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from ".";

export interface SelectedPoint {
  id?: string; // Полезно, если точек несколько
  lat: number;
  lng: number;
  address?: string;
}

interface MapState {
  selectedCoords: SelectedPoint | null; // Текущая выбранная точка (например, для формы создания)
  savedPoints: SelectedPoint[]; // Список уже добавленных/сохраненных на карту точек
  isPickingMode: boolean; // Режим выбора
}

const initialState: MapState = {
  selectedCoords: null,
  savedPoints: [],
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
    addSavedPoint: (state, action: PayloadAction<SelectedPoint>) => {
      state.savedPoints.push(action.payload);
    },

    // Удаление точки из сохраненных по индексу или id
    removeSavedPoint: (state, action: PayloadAction<number>) => {
      state.savedPoints.splice(action.payload, 1);
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
  addSavedPoint,
  removeSavedPoint,
  togglePickingMode,
  setPickingMode,
} = mapSlice.actions;

export default mapSlice.reducer;
export const { actions } = mapSlice;

export const selectIsPickingMode = (state: RootState) =>
  state.map.isPickingMode;
export const selectSelectedCoords = (state: RootState) =>
  state.map.selectedCoords;
export const selectSavedPoints = (state: RootState) => state.map.savedPoints;
