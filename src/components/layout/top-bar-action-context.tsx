"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

interface TopBarAction {
  label: string;
  onClick: () => void;
}

interface TopBarActionContextValue {
  action: TopBarAction | null;
  setAction: (action: TopBarAction | null) => void;
}

const TopBarActionContext = createContext<TopBarActionContextValue | null>(null);

export function TopBarActionProvider({ children }: { children: ReactNode }) {
  const [action, setAction] = useState<TopBarAction | null>(null);

  return <TopBarActionContext.Provider value={{ action, setAction }}>{children}</TopBarActionContext.Provider>;
}

export function useTopBarAction(): TopBarAction | null {
  const ctx = useContext(TopBarActionContext);
  if (!ctx) {
    throw new Error("useTopBarAction must be used within a TopBarActionProvider");
  }
  return ctx.action;
}

export function useSetTopBarAction(label: string, onClick: () => void): void {
  const ctx = useContext(TopBarActionContext);
  if (!ctx) {
    throw new Error("useSetTopBarAction must be used within a TopBarActionProvider");
  }

  const { setAction } = ctx;
  const stableOnClick = useCallback(() => onClick(), [onClick]);

  useEffect(() => {
    setAction({ label, onClick: stableOnClick });
    return () => setAction(null);
  }, [label, stableOnClick, setAction]);
}
