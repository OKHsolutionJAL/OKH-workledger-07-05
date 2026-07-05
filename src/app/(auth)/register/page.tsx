"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { Field, SelectField } from "@/components/ui/field";
import { languages, type Language } from "@/lib/i18n/translations";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { getRegisterErrorMessage } from "@/lib/supabase/auth-errors";
import { getSupabaseBrowser } from "@/lib/supabase/client";

type AccountType = "worker" | "client_company" | "both";
type CountryCode = "JP" | "AU";

const accountTypeLabels: Record<Language, Record<AccountType, string>> = {
  pt: {
    worker: "Sou prestador / emissor",
    client_company: "Sou contratante / cliente",
    both: "Sou os dois"
  },
  ja: {
    worker: "\u4f5c\u696d\u8005 / \u767a\u884c\u8005",
    client_company: "\u767a\u6ce8\u8005 / \u53d6\u5f15\u5148",
    both: "\u4e21\u65b9"
  },
  en: {
    worker: "I am a worker / issuer",
    client_company: "I am a contractor client / company",
    both: "I am both"
  }
};

function redirectForAccountType(accountType: AccountType) {
  return accountType === "client_company" ? "/client-portal/dashboard" : "/dashboard";
}

export default function RegisterPage() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("worker");
  const [country, setCountry] = useState<CountryCode>("JP");
  const [currency, setCurrency] = useState<"JPY" | "AUD">("JPY");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const supabase = getSupabaseBrowser();
      const nextPath = redirectForAccountType(accountType);
      const { data, error: signUpError } = await supabase.auth
        .signUp({
          email,
          password,
          options: {
            data: {
              owner_name: ownerName,
              business_name: businessName,
              full_name: ownerName,
              company_name: businessName,
              phone,
              user_type: accountType,
              preferred_language: language,
              country,
              company_country: country,
              market: country,
              currency,
              default_currency: currency
            },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`
          }
        })
        .catch((caught: unknown) => ({
          data: { session: null, user: null },
          error: caught
        }));

      if (signUpError) {
        setError(getRegisterErrorMessage(signUpError));
        return;
      }

      if (data.session) {
        try {
          await supabase.from("profiles").upsert(
            {
              id: data.session.user.id,
              owner_name: ownerName,
              business_name: businessName,
              full_name: ownerName,
              company_name: businessName,
              email,
              phone,
              role: "client",
              user_type: accountType,
              preferred_language: language,
              country,
              company_country: country,
              market: country,
              document_market: country,
              default_document_market: country,
              currency,
              default_currency: currency,
              updated_at: new Date().toISOString()
            },
            { onConflict: "id" }
          );
        } catch {
          // O cadastro no Auth ja foi criado; o trigger/perfil pode ser ajustado depois sem quebrar a tela.
        }
        window.localStorage.setItem("active_portal", accountType === "client_company" ? "client_company" : "worker");
        router.refresh();
        window.location.replace(nextPath);
        return;
      }

      setSuccess(t("successRegister"));
    } catch (caught) {
      setError(getRegisterErrorMessage(caught));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthCard
      title={t("registerTitle")}
      subtitle={t("registerSubtitle")}
      footerHref="/login"
      footerLabel={t("login")}
      footerText={t("hasAccount")}
    >
      <form className="grid gap-4" onSubmit={handleRegister}>
        <ErrorMessage message={error} />
        {success ? <div className="rounded-md border border-jade-100 bg-jade-50 px-4 py-3 text-sm text-jade-700">{success}</div> : null}
        <Field label={t("ownerName")} onChange={(event) => setOwnerName(event.target.value)} required value={ownerName} />
        <Field label={accountType === "worker" ? t("businessName") : "Nome / empresa"} onChange={(event) => setBusinessName(event.target.value)} required value={businessName} />
        <SelectField label="Tipo de conta" onChange={(event) => setAccountType(event.target.value as AccountType)} required value={accountType}>
          {(["worker", "client_company", "both"] as const).map((type) => (
            <option key={type} value={type}>
              {accountTypeLabels[language][type]}
            </option>
          ))}
        </SelectField>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Pais principal"
            onChange={(event) => {
              const nextCountry = event.target.value as CountryCode;
              setCountry(nextCountry);
              setCurrency(nextCountry === "AU" ? "AUD" : "JPY");
            }}
            value={country}
          >
            <option value="JP">Japao</option>
            <option value="AU">Australia</option>
          </SelectField>
          <SelectField label="Moeda padrao" onChange={(event) => setCurrency(event.target.value as "JPY" | "AUD")} value={currency}>
            <option value="JPY">JPY</option>
            <option value="AUD">AUD</option>
          </SelectField>
        </div>
        <SelectField label={t("preferredLanguage")} onChange={(event) => setLanguage(event.target.value as Language)} value={language}>
          {languages.map((item) => (
            <option key={item.code} value={item.code}>
              {item.label}
            </option>
          ))}
        </SelectField>
        <Field label={t("phone")} onChange={(event) => setPhone(event.target.value)} value={phone} />
        <Field autoComplete="email" label={t("email")} onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
        <Field
          autoComplete="new-password"
          helper={t("passwordHint")}
          label={t("password")}
          minLength={8}
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
        <Button disabled={isLoading} isLoading={isLoading} type="submit">
          {t("register")}
        </Button>
      </form>
    </AuthCard>
  );
}
