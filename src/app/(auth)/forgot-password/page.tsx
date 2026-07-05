"use client";

import { FormEvent, useState } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { Field } from "@/components/ui/field";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { getPasswordResetErrorMessage } from "@/lib/supabase/auth-errors";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const supabase = getSupabaseBrowser();
      const { error: resetError } = await supabase.auth
        .resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login?mode=reset`
        })
        .catch((caught: unknown) => ({
          data: null,
          error: caught
        }));

      if (resetError) {
        setError(getPasswordResetErrorMessage(resetError));
        return;
      }

      setSuccess(t("resetEmailSent"));
    } catch (caught) {
      setError(getPasswordResetErrorMessage(caught));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthCard
      title={t("forgotPassword")}
      subtitle={t("resetEmailSubtitle")}
      footerHref="/login"
      footerLabel={t("login")}
      footerText={t("rememberedPassword")}
    >
      <form className="grid gap-4" onSubmit={handleReset}>
        <ErrorMessage message={error} />
        {success ? <div className="rounded-md border border-jade-100 bg-jade-50 px-4 py-3 text-sm text-jade-700">{success}</div> : null}
        <Field autoComplete="email" label={t("email")} onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
        <Button disabled={isLoading} isLoading={isLoading} type="submit">
          {t("sendLink")}
        </Button>
      </form>
    </AuthCard>
  );
}
