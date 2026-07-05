"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BarChart3, BriefcaseBusiness, Building2, ClipboardCheck, FileText, LogOut, Menu, Send, Settings, Shield, UserRound } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { PortalSwitcher } from "@/components/portal-switcher";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", labelKey: "dashboard", icon: BarChart3 },
  { href: "/timecard", labelKey: "timecard", icon: ClipboardCheck },
  { href: "/clients", labelKey: "clients", icon: BriefcaseBusiness },
  { href: "/contractors", labelKey: "contractors", icon: Building2 },
  { href: "/documents", labelKey: "documents", icon: FileText },
  { href: "/reports", labelKey: "reports", icon: FileText },
  { href: "/exports", labelKey: "exports", icon: Send },
  { href: "/profile", labelKey: "profile", icon: UserRound },
  { href: "/settings", labelKey: "settings", icon: Settings }
] as const;

function NavLink({ item, compact = false }: { item: (typeof navigation)[number]; compact?: boolean }) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;

  return (
    <Link
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition",
        isActive ? "bg-jade-50 text-jade-700" : "text-zinc-600 hover:bg-paper hover:text-ink",
        compact && "grid justify-items-center gap-1 px-2 py-2 text-[11px]"
      )}
      href={item.href}
      title={t(item.labelKey)}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      <span className={compact ? "leading-none" : ""}>{t(item.labelKey)}</span>
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const [isReady, setIsReady] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isClientCompany, setIsClientCompany] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);

  const currentTitle = useMemo(() => {
    const item = navigation.find((navItem) => pathname === navItem.href || pathname.startsWith(`${navItem.href}/`));
    return item ? t(item.labelKey) : "OKH WorkLedger";
  }, [pathname, t]);

  useEffect(() => {
    try {
      const supabase = getSupabaseBrowser();

      async function loadProfile(userId: string) {
        try {
          const { data: profile } = await supabase.from("profiles").select("role, user_type").eq("id", userId).maybeSingle();
          setIsAdminUser(profile?.role === "admin");
          setIsClientCompany(profile?.user_type === "client_company" || profile?.user_type === "both");
          setUserType(profile?.user_type ?? null);
        } catch {
          setIsAdminUser(false);
          setIsClientCompany(false);
          setUserType(null);
        }
      }

      async function loadSession() {
        try {
          const { data, error } = await supabase.auth.getSession();
          if (error || !data.session) {
            router.replace("/login");
            return;
          }

          setUserEmail(data.session.user.email ?? null);
          await loadProfile(data.session.user.id);
          setIsReady(true);
        } catch {
          router.replace("/login");
          setIsReady(true);
        }
      }

      loadSession();

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) {
          router.replace("/login");
          return;
        }

        setUserEmail(session.user.email ?? null);
        loadProfile(session.user.id);
        setIsReady(true);
      });

      return () => listener.subscription.unsubscribe();
    } catch (error) {
      setConfigError(error instanceof Error ? error.message : t("connectSupabase"));
      setIsReady(true);
    }
  }, [router, t]);

  async function handleLogout() {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  if (configError) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <section className="max-w-lg rounded-lg border border-line bg-white p-6 shadow-soft">
          <p className="text-sm font-semibold text-jade-700">{t("configNeeded")}</p>
          <h1 className="mt-2 text-2xl font-semibold text-ink">{t("connectSupabase")}</h1>
          <p className="mt-3 text-sm text-zinc-600">{configError}</p>
          <p className="mt-2 text-sm text-zinc-600">{t("supabaseEnvHelp")}</p>
        </section>
      </main>
    );
  }

  if (!isReady) {
    return <main className="flex min-h-screen items-center justify-center text-sm text-zinc-500">{t("loadingPanel")}</main>;
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-line bg-white px-4 py-5 md:block">
        <Link href="/dashboard" className="block rounded-md px-3 py-2">
          <p className="text-lg font-semibold text-ink">OKH WorkLedger</p>
          <p className="text-xs text-zinc-500">{t("appTagline")}</p>
        </Link>
        <nav className="mt-6 grid gap-1">
          {navigation.map((item) => (
            <NavLink item={item} key={item.href} />
          ))}
          {isAdminUser ? (
            <Link className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-paper hover:text-ink" href="/admin">
              <Shield className="h-5 w-5" aria-hidden="true" />
              Admin
            </Link>
          ) : null}
          {isClientCompany ? (
            <Link className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-paper hover:text-ink" href="/client-portal/dashboard">
              <Building2 className="h-5 w-5" aria-hidden="true" />
              Portal do cliente/contratante
            </Link>
          ) : null}
          {userType === "both" ? <PortalSwitcher compact /> : null}
        </nav>
      </aside>

      <div className="md:pl-72">
        <header className="sticky top-0 z-20 border-b border-line bg-white/92 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 md:hidden">
                <Menu className="h-4 w-4" aria-hidden="true" />
                OKH WorkLedger
              </div>
              <h1 className="truncate text-lg font-semibold text-ink md:text-xl">{currentTitle}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {isAdminUser ? (
                <Link className="inline-flex min-h-10 items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:bg-paper" href="/admin">
                  <Shield className="h-4 w-4" aria-hidden="true" />
                  Admin
                </Link>
              ) : null}
              {isClientCompany ? (
                <Link className="inline-flex min-h-10 items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:bg-paper" href="/client-portal/dashboard">
                  <Building2 className="h-4 w-4" aria-hidden="true" />
                  Portal
                </Link>
              ) : null}
              {userType === "both" ? <PortalSwitcher /> : null}
              <LanguageSwitcher />
              <span className="hidden max-w-48 truncate text-sm text-zinc-500 lg:block">{userEmail}</span>
              <Button type="button" variant="secondary" onClick={handleLogout}>
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{t("logout")}</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-white px-2 py-2 md:hidden">
        {navigation.slice(0, 5).map((item) => (
          <NavLink compact item={item} key={item.href} />
        ))}
      </nav>
    </div>
  );
}
