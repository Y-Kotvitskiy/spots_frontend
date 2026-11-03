import { configureStore, type Middleware } from "@reduxjs/toolkit";
import mapReducer, { MapMode } from "./slices/mapSlice";
import groupReducer, { groupActions } from "./slices/groupSlice";
import authReducer from "./slices/authSlice";
import { useSelector, type TypedUseSelectorHook } from "react-redux";

const LOCAL_STORAGE_MAP_KEY = "map_saved_places";
const LOCAL_STORAGE_GROUPS_KEY = "app_groups";

const loadState = () => {
  if (typeof window === "undefined") return undefined;

  try {
    const serializedPlaces = localStorage.getItem(LOCAL_STORAGE_MAP_KEY);
    const serializedGroups = localStorage.getItem(LOCAL_STORAGE_GROUPS_KEY);

    return {
      map: {
        selectedCoords: null,
        selectedPlace: null,
        savedPlaces: serializedPlaces ? JSON.parse(serializedPlaces) : [],
        mapMode: MapMode.Show,
      },
      groups: {
        groups: serializedGroups ? JSON.parse(serializedGroups) : [],
        selectedGroup: null,
      },
    };
  } catch (e) {
    console.error("Помилка читання з localStorage", e);
    return undefined;
  }
};

const saveStateMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  if (typeof window !== "undefined") {
    try {
      const state = store.getState();
      localStorage.setItem(
        LOCAL_STORAGE_MAP_KEY,
        JSON.stringify(state.map.savedPlaces),
      );
      localStorage.setItem(
        LOCAL_STORAGE_GROUPS_KEY,
        JSON.stringify(state.groups.groups),
      );
    } catch (e) {
      console.error("Помилка збереження в localStorage", e);
    }
  }

  return result;
};

const store = configureStore({
  reducer: {
    map: mapReducer,
    auth: authReducer,
    groups: groupReducer,
  },
  preloadedState: loadState(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(saveStateMiddleware),
});

export default store;
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export { actions as mapActions } from "./slices/mapSlice";
export { actions as authActions } from "./slices/authSlice";
export { groupActions };
