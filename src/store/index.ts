import { configureStore, type Middleware } from "@reduxjs/toolkit";
import mapReducer, { actions, MapMode } from "./mapSlice";

const LOCAL_STORAGE_KEY = "map_saved_places";

// 1. Проста функція читання зі стану браузера
const loadState = () => {
  if (typeof window === "undefined") return undefined;

  try {
    const serializedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!serializedState) return undefined;

    // Повертаємо об'єкт у тому форматі, в якому очікує redux-state
    return {
      map: {
        selectedCoords: null,
        selectedPlace: null,
        savedPlaces: JSON.parse(serializedState),
        mapMode: MapMode.Show,
      },
    };
  } catch (e) {
    console.error("Помилка читання з localStorage", e);
    return undefined;
  }
};

// 2. Middleware для автоматичного збереження при змінах
const saveStateMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  if (typeof window !== "undefined") {
    try {
      const state = store.getState();
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify(state.map.savedPlaces),
      );
    } catch (e) {
      console.error("Помилка збереження в localStorage", e);
    }
  }

  return result;
};

// 3. Створюємо store, передаючи прочитаний state в preloadedState
const store = configureStore({
  reducer: {
    map: mapReducer,
  },
  preloadedState: loadState(), // <--- Ось тут ми одразу читаємо state при створенні!
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(saveStateMiddleware),
});

export default store;
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export { actions as mapActions };
