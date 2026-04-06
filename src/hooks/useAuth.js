"use client";

import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { authActions, refreshUser } from "@/store";

export function useAuth() {
  const dispatch = useDispatch();
  const { user, status, error } = useSelector((state) => state.auth);

  const setUser = useCallback(
    (nextUser) => {
      dispatch(authActions.setUser(nextUser));
    },
    [dispatch]
  );

  const clearUser = useCallback(() => {
    dispatch(authActions.clearUser());
  }, [dispatch]);

  const reloadUser = useCallback(() => {
    return dispatch(refreshUser()).unwrap();
  }, [dispatch]);

  return {
    user,
    isLoading: status === "loading",
    error,
    setUser,
    clearUser,
    refreshUser: reloadUser,
  };
}
