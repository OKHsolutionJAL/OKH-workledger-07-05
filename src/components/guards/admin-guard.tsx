"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [canShow, setCanShow] = useState(false);

  useEffect(() => {
    async function checkRole() {
      try {
        const supabase = getSupabaseBrowser();
        const {
          data: { user }
        } = await supabase.auth.getUser();

        if (!user) {
          setCanShow(false);
          return;
        }

        const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
        setCanShow(data?.role === "admin");
      } catch {
        setCanShow(false);
      }
    }

    checkRole();
  }, []);

  return canShow ? <>{children}</> : null;
}
