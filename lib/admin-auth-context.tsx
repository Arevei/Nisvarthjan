"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetAdminMeQueryKey, useGetAdminMe } from "@/lib/api-client/api";

interface AdminAuthContextType {
  adminToken: string | null;
  setAdminToken: (token: string | null) => void;
  isAdmin: boolean;
  isAdminLoading: boolean;
  adminLogout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [adminToken, setAdminTokenState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("adminToken");
  });

  const setAdminToken = (token: string | null) => {
    setAdminTokenState(token);
    if (token) {
      window.localStorage.setItem("adminToken", token);
    } else {
      window.localStorage.removeItem("adminToken");
      queryClient.setQueryData(getGetAdminMeQueryKey(), null);
    }
    queryClient.invalidateQueries({ queryKey: getGetAdminMeQueryKey() });
  };

  const { data, isLoading, isFetching } = useGetAdminMe({
    query: {
      retry: false,
      queryKey: getGetAdminMeQueryKey(),
    },
  });

  const adminLogout = () => {
    fetch("/api/auth/admin/logout", { method: "POST", credentials: "include" }).catch(() => undefined);
    setAdminToken(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminToken,
        setAdminToken,
        isAdmin: Boolean(data?.isAdmin),
        isAdminLoading: isLoading || isFetching,
        adminLogout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
