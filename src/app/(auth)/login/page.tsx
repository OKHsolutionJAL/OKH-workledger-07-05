"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { Field } from "@/components/ui/field";
import { isLanguage } from "@/lib/i18n/translations";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { getLoginErrorMessage, getPasswordUpdateErrorMessage } from "@/lib/supabase/auth-errors";
import { getSupabaseBrowser } from "@/lib/supabase/client";

function getSafeRedirect(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  if (value.startsWith("/login") || value.startsWith("/register") || value.startsWith("/forgot-password")) return "/dashboard";
  return value;
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, setLanguage } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isResetMode = searchParams.get("mode") === "reset";

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const supabase = getSupabaseBrowser();
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password }).catch((caught: unknown) => ({
        data: { session: null, user: null },
        error: caught
      }));

      if (loginError) {
        setError(getLoginErrorMessage(loginError));
        return;
      }

      if (!data.session) {
        setError("Não foi possível criar a sessão. Tente novamente.");
        return;
      }

      let profile = null;
      try {
        const { data: profileData } = await supabase.from("profiles").select("preferred_language, user_type").eq("id", data.session.user.id).maybeSingle();
        profile = profileData;
      } catch {
        profile = null;
      }
      if (isLanguage(profile?.preferred_language)) {
        setLanguage(profile.preferred_language);
      }

      const redirectedFrom = getSafeRedirect(searchParams.get("redirectedFrom"));
      const storedPortal = window.localStorage.getItem("active_portal");
      const defaultPath =
        profile?.user_type === "client_company"
          ? "/client-portal/dashboard"
          : profile?.user_type === "both" && storedPortal === "client_company"
            ? "/client-portal/dashboard"
            : "/dashboard";
      const targetPath = searchParams.get("redirectedFrom") ? redirectedFrom : defaultPath;

      router.refresh();
      window.location.replace(targetPath);
    } catch (caught) {
      setError(getLoginErrorMessage(caught));
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePasswordUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const supabase = getSupabaseBrowser();
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword }).catch((caught: unknown) => ({
        data: { user: null },
        error: caught
      }));
      if (updateError) {
        setError(getPasswordUpdateErrorMessage(updateError));
        return;
      }
      setSuccess(t("passwordUpdatedLogin"));
      router.refresh();
      window.location.replace("/dashboard");
    } catch (caught) {
      setError(getPasswordUpdateErrorMessage(caught));
    } finally {
      setIsLoading(false);
    }
  }

  if (isResetMode) {
    return (
      <AuthCard
        title={t("newPassword")}
        subtitle={t("resetPasswordSubtitle")}
        footerHref="/login"
        footerLabel={t("login")}
        footerText={t("rememberedPassword")}
      >
        <form className="grid gap-4" onSubmit={handlePasswordUpdate}>
          <ErrorMessage message={error} />
          {success ? <div className="rounded-md border border-jade-100 bg-jade-50 px-4 py-3 text-sm text-jade-700">{success}</div> : null}
          <Field
            label={t("newPassword")}
            minLength={8}
            onChange={(event) => setNewPassword(event.target.value)}
            required
            type="password"
            value={newPassword}
          />
          <Button disabled={isLoading} isLoading={isLoading} type="submit">
            {t("save")}
          </Button>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={t("loginTitle")}
      subtitle={t("loginSubtitle")}
      footerHref="/register"
      footerLabel={t("register")}
      footerText={t("noAccountYet")}
    >
      <form className="grid gap-4" onSubmit={handleLogin}>
        <ErrorMessage message={error} />
        <Field autoComplete="email" label={t("email")} onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
        <Field
          autoComplete="current-password"
          label={t("password")}
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
        <div className="flex items-center justify-between gap-3">
          <Link className="text-sm font-semibold text-jade-700 hover:text-jade-600" href="/forgot-password">
            {t("forgotPassword")}
          </Link>
        </div>
        <Button disabled={isLoading} isLoading={isLoading} type="submit">
          {t("login")}
        </Button>
      </form>
    </AuthCard>
  );
}

export default function LoginPage() {
  const { t } = useLanguage();

  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center text-sm text-zinc-500">{t("loading")}</main>}>
      <LoginContent />
    </Suspense>
  );
}
