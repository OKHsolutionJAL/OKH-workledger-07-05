"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export function PlanGuard({ children }: { children: React.ReactNode }) {
  const [isAllowed, setIsAllowed] = useState(true);

  useEffect(() => {
    async function loadPlanStatus() {
      try {
        const supabase = getSupabaseBrowser();
        const {
          data: { user }
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data } = await supabase
          .from("profiles")
          .select("role, account_status, subscription_status")
          .eq("id", user.id)
          .maybeSingle();

        if (data?.role === "admin") {
          setIsAllowed(true);
          return;
        }

        const blocked =
          data?.account_status === "blocked" ||
          data?.account_status === "suspended" ||
          data?.subscription_status === "past_due" ||
          data?.subscription_status === "cancelled";

        setIsAllowed(!blocked);
      } catch {
        setIsAllowed(true);
      }
    }

    loadPlanStatus();
  }, []);

  if (isAllowed) return <>{children}</>;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      Seu plano precisa ser atualizado para continuar usando o OKH WorkLedger.
    </div>
  );
}
