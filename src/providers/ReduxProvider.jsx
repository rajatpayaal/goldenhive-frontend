"use client";

import { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { authActions, readStoredUser, refreshCartCount, refreshUser, store } from "@/store";

function StoreInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const storedUser = readStoredUser();
    if (storedUser) dispatch(authActions.setUser(storedUser));
    dispatch(refreshUser());
    dispatch(refreshCartCount());
  }, [dispatch]);

  return children;
}

export function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <StoreInitializer>{children}</StoreInitializer>
    </Provider>
  );
}

export default ReduxProvider;
