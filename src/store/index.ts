import { configureStore } from "@reduxjs/toolkit";
import mapReducer from "./mapSlice";

const store = configureStore({
  reducer: {
    map: mapReducer,
  },
});

export default store;
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export { actions as mapActions } from "./mapSlice";
