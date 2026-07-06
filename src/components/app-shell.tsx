"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BarChart3, BriefcaseBusiness, Building2, ClipboardCheck, FileText, LogOut, Menu, Send, Settings, Shield, UserRound, X } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { PortalSwitcher } from "@/components/portal-switcher";
import { Button } from "@/components/ui/button";
import type { Language } from "@/lib/i18n/translations";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { okhTheme } from "@/lib/theme";
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

const mobileNavigationHrefs = ["/dashboard", "/timecard", "/clients", "/contractors", "/documents"] as const;
type MobileNavigationHref = (typeof mobileNavigationHrefs)[number];
const mobileNavigation = navigation.filter((item): item is Extract<(typeof navigation)[number], { href: MobileNavigationHref }> =>
  mobileNavigationHrefs.includes(item.href as MobileNavigationHref)
);

const mobileNavigationLabels: Record<Language, Record<MobileNavigationHref, string>> = {
  pt: {
    "/dashboard": "Painel",
    "/timecard": "Lançar",
    "/clients": "Clientes",
    "/contractors": "Contratantes",
    "/documents": "Docs"
  },
  ja: {
    "/dashboard": "\u30db\u30fc\u30e0",
    "/timecard": "\u5165\u529b",
    "/clients": "\u53d6\u5f15\u5148",
    "/contractors": "\u767a\u6ce8\u8005",
    "/documents": "\u66f8\u985e"
  },
  en: {
    "/dashboard": "Home",
    "/timecard": "Entries",
    "/clients": "Clients",
    "/contractors": "Contractors",
    "/documents": "Docs"
  }
};

function NavLink({ item, compact = false, dark = false }: { item: (typeof navigation)[number]; compact?: boolean; dark?: boolean }) {
  const pathname = usePathname();
  const { language, t } = useLanguage();
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;
  const label = compact && item.href in mobileNavigationLabels[language] ? mobileNavigationLabels[language][item.href as MobileNavigationHref] : t(item.labelKey);

  return (
    <Link
      className={cn(
        "relative flex min-w-0 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A00]",
        dark
          ? isActive
            ? "bg-[#1E3A8A] text-white shadow-lg shadow-blue-950/20"
            : "text-blue-100 hover:bg-white/10 hover:text-white"
          : isActive
            ? "bg-blue-50 text-[#1E3A8A]"
            : "text-zinc-600 hover:bg-paper hover:text-ink",
        compact && "grid h-14 justify-items-center gap-0.5 px-1 py-1.5 text-[10px]"
      )}
      href={item.href}
      title={t(item.labelKey)}
    >
      {dark && isActive ? <span className="absolute left-0 top-2 h-7 w-1 rounded-r-full bg-[#FF6A00]" aria-hidden="true" /> : null}
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className={compact ? "block max-w-full truncate whitespace-nowrap text-center leading-tight" : "min-w-0 truncate"}>{label}</span>
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  async function handleLogout() {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  if (configError) {
    return (
      <main className="flex min-h-screen items-center justify-center p-3 sm:p-6">
        <section className="w-full max-w-lg rounded-lg border border-line bg-white p-4 shadow-soft sm:p-6">
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
    <div className="min-h-screen bg-[#F8FAFC] pb-20 md:pb-0">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-[#172554] bg-[#0B132B] px-4 py-5 text-white md:block">
        <Link href="/dashboard" className="block rounded-md px-3 py-2 transition hover:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-[#FF6A00] text-sm font-black text-white">OKH</div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#FFB347]">OKH Solution</p>
              <p className="truncate text-lg font-semibold text-white">OKH WorkLedger</p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-blue-100">{okhTheme.productDescription}</p>
        </Link>
        <nav className="mt-6 grid gap-1">
          {navigation.map((item) => (
            <NavLink dark item={item} key={item.href} />
          ))}
          {isAdminUser ? (
            <Link className="relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-blue-100 transition hover:bg-white/10 hover:text-white" href="/admin">
              <Shield className="h-5 w-5" aria-hidden="true" />
              Admin
            </Link>
          ) : null}
          {isClientCompany ? (
            <Link className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-blue-100 transition hover:bg-white/10 hover:text-white" href="/client-portal/dashboard">
              <Building2 className="h-5 w-5" aria-hidden="true" />
              Portal do cliente/contratante
            </Link>
          ) : null}
          {userType === "both" ? <PortalSwitcher compact /> : null}
        </nav>
        <div className="absolute inset-x-4 bottom-5 rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#FFB347]">Usuario ativo</p>
          <p className="mt-1 truncate text-sm font-semibold text-white">{userEmail ?? "OKH WorkLedger"}</p>
          <p className="mt-1 text-xs text-blue-100">{isAdminUser ? "Admin" : userType ?? "worker"} - online</p>
        </div>
      </aside>

      <div className="md:pl-72">
        <header className="sticky top-0 z-20 border-b border-[#E5E7EB] bg-white/95 px-3 py-2.5 backdrop-blur sm:px-4 sm:py-3 md:px-8">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <button
                className="mb-1 inline-flex min-h-9 items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0B132B] transition hover:bg-[#F8FAFC] md:hidden"
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Abrir menu"
              >
                <Menu className="h-4 w-4" aria-hidden="true" />
                OKH
              </button>
              <h1 className="truncate text-base font-semibold text-ink sm:text-lg md:text-xl">{currentTitle}</h1>
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3">
              {isAdminUser ? (
                <Link className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0B132B] transition hover:bg-[#F8FAFC] sm:min-h-10 sm:gap-2 sm:px-3 sm:py-2 sm:text-sm" href="/admin">
                  <span className="h-2 w-2 rounded-full bg-[#FF6A00]" aria-hidden="true" />
                  <Shield className="h-4 w-4" aria-hidden="true" />
                  Admin
                </Link>
              ) : null}
              {isClientCompany ? (
                <Link className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0B132B] transition hover:bg-[#F8FAFC] sm:min-h-10 sm:gap-2 sm:px-3 sm:py-2 sm:text-sm" href="/client-portal/dashboard">
                  <Building2 className="h-4 w-4" aria-hidden="true" />
                  Portal
                </Link>
              ) : null}
              {userType === "both" ? <PortalSwitcher /> : null}
              <LanguageSwitcher />
              <span className="hidden max-w-48 truncate text-sm text-zinc-500 lg:block">{userEmail}</span>
              <Button className="min-h-9 px-2.5 py-1.5 sm:min-h-10 sm:px-4 sm:py-2" type="button" variant="secondary" onClick={handleLogout} title={t("logout")}>
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{t("logout")}</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl min-w-0 px-3 py-4 sm:px-4 sm:py-6 md:px-8">{children}</main>
      </div>

      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
          <button className="absolute inset-0 h-full w-full bg-slate-950/50" type="button" aria-label="Fechar menu" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="relative z-10 flex h-full w-[min(22rem,88vw)] flex-col bg-[#0B132B] p-4 text-white shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#FFB347]">OKH Solution</p>
                <h2 className="text-lg font-semibold text-white">OKH WorkLedger</h2>
                <p className="mt-2 text-xs leading-5 text-blue-100">{okhTheme.productDescription}</p>
              </div>
              <button className="rounded-md p-2 text-blue-100 transition hover:bg-white/10 hover:text-white" type="button" onClick={() => setIsMobileMenuOpen(false)} aria-label="Fechar menu">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <nav className="mt-6 grid gap-1">
              {navigation.map((item) => (
                <NavLink dark item={item} key={item.href} />
              ))}
              {isAdminUser ? (
                <Link className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-blue-100 transition hover:bg-white/10 hover:text-white" href="/admin">
                  <Shield className="h-5 w-5" aria-hidden="true" />
                  Admin
                </Link>
              ) : null}
              {isClientCompany ? (
                <Link className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-blue-100 transition hover:bg-white/10 hover:text-white" href="/client-portal/dashboard">
                  <Building2 className="h-5 w-5" aria-hidden="true" />
                  Portal
                </Link>
              ) : null}
            </nav>
            <div className="mt-auto rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="truncate text-sm font-semibold text-white">{userEmail ?? "OKH WorkLedger"}</p>
              <p className="mt-1 text-xs text-blue-100">{isAdminUser ? "Admin" : userType ?? "worker"} - online</p>
            </div>
          </aside>
        </div>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 gap-0.5 border-t border-line bg-white px-1 py-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] md:hidden">
        {mobileNavigation.map((item) => (
          <NavLink compact item={item} key={item.href} />
        ))}
      </nav>
    </div>
  );
}
