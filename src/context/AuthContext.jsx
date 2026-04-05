"use client";

import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = typeof window !== "undefined" ? window.localStorage.getItem("gh_user") : null;
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        window.localStorage.removeItem("gh_user");
      }
    }

    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const { data } = await response.json();
          const fetchedUser = data?.user || data?.data || data || null;
          setUser(fetchedUser);
          if (fetchedUser) {
            window.localStorage.setItem("gh_user", JSON.stringify(fetchedUser));
          } else {
            window.localStorage.removeItem("gh_user");
          }
        } else {
          setUser(null);
          window.localStorage.removeItem("gh_user");
        }
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
