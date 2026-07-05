"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export type ModuleName =
  | "work_entries"
  | "clients"
  | "reports"
  | "japan_documents"
  | "australia_documents"
  | "expenses"
  | "materials"
  | "tax_export"
  | "support"
  | "courses"
  | "admin_access";

export function ModuleGuard({ moduleName, children }: { moduleName: ModuleName; children: React.ReactNode }) {
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    async function loadAccess() {
      try {
        const supabase = getSupabaseBrowser();
        const {
          data: { user }
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data, error } = await supabase
          .from("user_module_access")
          .select("is_enabled")
          .eq("user_id", user.id)
          .eq("module_name", moduleName)
          .maybeSingle();

        if (!error && data) setIsEnabled(data.is_enabled);
      } catch {
        setIsEnabled(true);
      }
    }

    loadAccess();
  }, [moduleName]);

  return isEnabled ? <>{children}</> : null;
}
