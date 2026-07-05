"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type ClientPortalLogoutButtonProps = {
  className?: string;
  label?: string;
};

export function ClientPortalLogoutButton({ className, label = "Sair / voltar ao login" }: ClientPortalLogoutButtonProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-paper",
        className
      )}
      onClick={handleLogout}
      type="button"
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}
