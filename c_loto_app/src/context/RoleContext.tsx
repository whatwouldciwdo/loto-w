"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AppUser, DEMO_USERS, UserRole, PERMISSIONS } from "@/lib/auth";

interface RoleContextType {
  currentUser: AppUser;
  setCurrentUser: (user: AppUser) => void;
  switchUser: (username: string) => void;
  selectedShift: string;
  setSelectedShift: (shift: string) => void;
  permissions: typeof PERMISSIONS;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  // Default to Supervisor Shift for full overview, easily switchable to any role
  const [currentUser, setCurrentUser] = useState<AppUser>(DEMO_USERS[0]);
  const [selectedShift, setSelectedShift] = useState<string>("Semua");

  useEffect(() => {
    const savedUser = localStorage.getItem("cloto_active_user");
    if (savedUser) {
      const found = DEMO_USERS.find((u) => u.username === savedUser);
      if (found) setCurrentUser(found);
    }
  }, []);

  const switchUser = (username: string) => {
    const found = DEMO_USERS.find((u) => u.username === username);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem("cloto_active_user", found.username);
    }
  };

  return (
    <RoleContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchUser,
        selectedShift,
        setSelectedShift,
        permissions: PERMISSIONS,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
