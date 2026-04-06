"use client";

import { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { refreshCartCount, refreshUser, store } from "@/store";

function StoreInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
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
