"use client";
import { createContext, useCallback, useContext, useState, ReactNode, useEffect } from "react";
import { useGetMe, getGetMeQueryKey } from "@/lib/api-client/api";
import { useQueryClient } from "@tanstack/react-query";
import type { Member } from "@/lib/api-client/api";

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  user: Member | null;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setTokenState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("token");
  });

  const setToken = useCallback((newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      window.localStorage.setItem("token", newToken);
    } else {
      window.localStorage.removeItem("token");
      queryClient.setQueryData(getGetMeQueryKey(), null);
    }
  }, [queryClient]);

  const logout = useCallback(() => {
    setToken(null);
  }, [setToken]);

  const { data: user, isLoading } = useGetMe({
    query: {
      enabled: true,
      retry: false,
      queryKey: getGetMeQueryKey(),
    },
  });

  useEffect(() => {
    if (!isLoading && token && !user) {
      const error = queryClient.getQueryState(getGetMeQueryKey())?.error;
      if (error) {
        window.setTimeout(logout, 0);
      }
    }
  }, [user, isLoading, token, logout, queryClient]);

  return (
    <AuthContext.Provider value={{ token, setToken, user: user || null, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}




