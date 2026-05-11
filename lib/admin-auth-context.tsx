"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { useGetAdminMe, getGetAdminMeQueryKey } from "@/lib/api-client/api";
import { useQueryClient } from "@tanstack/react-query";

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

  const setAdminToken = (newToken: string | null) => {
    setAdminTokenState(newToken);
    if (newToken) {
      window.localStorage.setItem("adminToken", newToken);
    } else {
      window.localStorage.removeItem("adminToken");
      queryClient.setQueryData(getGetAdminMeQueryKey(), null);
    }
  };

  const adminLogout = () => {
    setAdminToken(null);
  };

  const { data: adminSession, isLoading: isAdminLoading } = useGetAdminMe({
    query: {
      enabled: !!adminToken,
      retry: false,
      queryKey: getGetAdminMeQueryKey(),
    },
  });

  const isAdmin = adminSession?.isAdmin === true;

  return (
    <AdminAuthContext.Provider
      value={{ adminToken, setAdminToken, isAdmin, isAdminLoading, adminLogout }}
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




