import {configureStore} from "@reduxjs/toolkit";
import Storage from "./storage";
import { rootReducer, RootState } from "./rootReducer";
import  {opMiddleware, timerMiddleware, googleAnalysisMiddleware} from "./middlewares";
import * as Sentry from "@sentry/react";
const storage = new Storage();
const persistedState = storage.loadState();

const sentryReduxEnhancer = Sentry.createReduxEnhancer({
  // Optionally pass options listed below
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat([
      opMiddleware, 
      timerMiddleware,
      googleAnalysisMiddleware
    ]),
  preloadedState: persistedState,
});

store.subscribe(() => {
  try {
    storage.saveState(store.getState());
  } catch (error) {
    console.error('Failed to save state to storage:', error)
  }
});

export type AppDispatch = typeof store.dispatch
export default store;
