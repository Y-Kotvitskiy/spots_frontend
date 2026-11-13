import { configureStore } from "@reduxjs/toolkit";
import mapReducer from "./slices/mapSlice";
import authReducer from "./slices/authSlice";
import { useSelector, type TypedUseSelectorHook } from "react-redux";

const store = configureStore({
  reducer: {
    map: mapReducer,
    auth: authReducer,
    // groups: groupReducer, // Закоментовано на час відсутності бекенду
  },
  // preloadedState та middleware для збереження груп також прибрано,
  // оскільки вони залежали виключно від локального сховища груп.
});

export default store;
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export { actions as mapActions } from "./slices/mapSlice";
export { actions as authActions } from "./slices/authSlice";
// export { groupActions }; // Експорт груп також закоментовано