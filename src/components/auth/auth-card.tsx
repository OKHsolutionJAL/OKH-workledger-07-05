import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";

export function AuthCard({
  title,
  subtitle,
  children,
  footerHref,
  footerLabel,
  footerText
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerHref: string;
  footerLabel: string;
  footerText: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-3 py-6 sm:px-4 sm:py-10">
      <section className="w-full max-w-md rounded-lg border border-line bg-white p-4 shadow-soft sm:p-6">
        <div className="mb-5 flex justify-end">
          <LanguageSwitcher />
        </div>
        <div className="mb-6">
          <p className="text-sm font-semibold text-jade-700">OKH WorkLedger</p>
          <h1 className="mt-2 break-words text-2xl font-semibold text-ink">{title}</h1>
          <p className="mt-2 break-words text-sm text-zinc-500">{subtitle}</p>
        </div>
        {children}
        <p className="mt-6 text-center text-sm text-zinc-500">
          {footerText}{" "}
          <Link className="font-semibold text-jade-700 hover:text-jade-600" href={footerHref}>
            {footerLabel}
          </Link>
        </p>
      </section>
    </main>
  );
}
