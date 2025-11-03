"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import type { ReactNode } from "react";
import type { Database } from "./types";
import { getSupabaseBrowserClient } from "./browser";

interface SupabaseContextValue {
  supabase: SupabaseClient<Database>;
  session: Session | null;
}

const SupabaseContext = createContext<SupabaseContextValue | undefined>(
  undefined
);

export function SupabaseSessionProvider({
  children,
  initialSession,
}: {
  children: ReactNode;
  initialSession: Session | null;
}) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(initialSession);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const value = useMemo(
    () => ({
      supabase,
      session,
    }),
    [supabase, session]
  );

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabaseSession() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error(
      "useSupabaseSession must be used within a SupabaseSessionProvider"
    );
  }
  return context;
}
