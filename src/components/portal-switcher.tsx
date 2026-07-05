"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type PortalSwitcherProps = {
  compact?: boolean;
};

export function PortalSwitcher({ compact = false }: PortalSwitcherProps) {
  const router = useRouter();
  const [activePortal, setActivePortal] = useState<"worker" | "client_company">("worker");

  useEffect(() => {
    const stored = window.localStorage.getItem("active_portal");
    if (stored === "client_company" || stored === "worker") setActivePortal(stored);
  }, []);

  function switchPortal(nextPortal: "worker" | "client_company") {
    setActivePortal(nextPortal);
    window.localStorage.setItem("active_portal", nextPortal);
    router.push(nextPortal === "client_company" ? "/client-portal/dashboard" : "/dashboard");
    router.refresh();
  }

  return (
    <div className={compact ? "grid gap-2" : "flex flex-wrap items-center gap-2"}>
      <button
        className="min-h-9 rounded-md border border-line bg-white px-2.5 py-1.5 text-xs font-semibold text-ink transition hover:bg-paper sm:min-h-10 sm:px-3 sm:py-2 sm:text-sm"
        onClick={() => switchPortal(activePortal === "worker" ? "client_company" : "worker")}
        type="button"
        title="Trocar portal"
      >
        <span className="sm:hidden">Trocar</span>
        <span className="hidden sm:inline">Trocar portal</span>
      </button>
      {!compact ? (
        <span className="hidden text-xs text-zinc-500 sm:inline">{activePortal === "worker" ? "Portal do Emissor" : "Portal do Cliente/Contratante"}</span>
      ) : null}
    </div>
  );
}
