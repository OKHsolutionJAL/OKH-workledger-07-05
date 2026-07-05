"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import type { Language } from "@/lib/i18n/translations";
import { useLanguage } from "@/lib/i18n/useLanguage";

const pageText: Record<
  Language,
  {
    title: string;
    description: string;
    japan: string;
    australia: string;
    japanDescription: string;
    australiaDescription: string;
    openReports: string;
  }
> = {
  pt: {
    title: "Documentos",
    description: "Gere documentos comerciais profissionais a partir dos lançamentos filtrados em Relatórios.",
    japan: "Japão",
    australia: "Austrália",
    japanDescription: "請求書, 見積書, 納品書 e 領収書 sempre em japonês.",
    australiaDescription: "Tax Invoice, Invoice, Quote, Receipt e Statement sempre em inglês australiano.",
    openReports: "Abrir Relatórios"
  },
  ja: {
    title: "\u66f8\u985e",
    description: "\u30ec\u30dd\u30fc\u30c8\u3067\u7d5e\u308a\u8fbc\u3093\u3060\u767b\u9332\u304b\u3089\u696d\u52d9\u7528\u66f8\u985e\u3092\u4f5c\u6210\u3057\u307e\u3059\u3002",
    japan: "\u65e5\u672c",
    australia: "\u30aa\u30fc\u30b9\u30c8\u30e9\u30ea\u30a2",
    japanDescription: "\u8acb\u6c42\u66f8\u3001\u898b\u7a4d\u66f8\u3001\u7d0d\u54c1\u66f8\u3001\u9818\u53ce\u66f8\u306f\u5e38\u306b\u65e5\u672c\u8a9e\u3067\u4f5c\u6210\u3055\u308c\u307e\u3059\u3002",
    australiaDescription: "Tax Invoice, Invoice, Quote, Receipt, Statement are always generated in Australian English.",
    openReports: "\u30ec\u30dd\u30fc\u30c8\u3092\u958b\u304f"
  },
  en: {
    title: "Documents",
    description: "Generate professional business documents from filtered work entries in Reports.",
    japan: "Japan",
    australia: "Australia",
    japanDescription: "請求書, 見積書, 納品書 and 領収書 are always generated in Japanese.",
    australiaDescription: "Tax Invoice, Invoice, Quote, Receipt and Statement are always generated in Australian English.",
    openReports: "Open Reports"
  }
};

export default function DocumentsPage() {
  const { language } = useLanguage();
  const text = pageText[language];

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold text-jade-700">{text.title}</p>
        <h2 className="page-title">{text.title}</h2>
        <p className="mt-2 max-w-3xl text-sm text-zinc-600">{text.description}</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="section-panel">
          <FileText className="h-6 w-6 text-jade-700" aria-hidden="true" />
          <h3 className="mt-3 text-lg font-semibold text-ink">{text.japan}</h3>
          <p className="mt-2 text-sm text-zinc-600">{text.japanDescription}</p>
        </article>
        <article className="section-panel">
          <FileText className="h-6 w-6 text-jade-700" aria-hidden="true" />
          <h3 className="mt-3 text-lg font-semibold text-ink">{text.australia}</h3>
          <p className="mt-2 text-sm text-zinc-600">{text.australiaDescription}</p>
        </article>
      </section>

      <div>
        <Link
          className="inline-flex min-h-10 items-center justify-center rounded-md bg-jade-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-jade-700"
          href="/reports"
        >
          {text.openReports}
        </Link>
      </div>
    </div>
  );
}
