"use client";

import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch user data from server on mount
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const { data } = await response.json();
          setUser(data?.user || null);
        }
      } catch (error) {
        // User not authenticated
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
