"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingState } from "@/components/ui/loading-state";
import type { ExternalExport } from "@/lib/database.types";
import { formatDate } from "@/lib/format";
import type { Language } from "@/lib/i18n/translations";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { formatWorkCurrency } from "@/lib/work-entries";

const pageText: Record<
  Language,
  {
    title: string;
    description: string;
    emptyTitle: string;
    emptyDescription: string;
    client: string;
    period: string;
    market: string;
    gross: string;
    expenses: string;
    tax: string;
    net: string;
    status: string;
    createdAt: string;
  }
> = {
  pt: {
    title: "Declaração / Exportação",
    description: "Histórico dos dados preparados para declaração de renda e integração futura.",
    emptyTitle: "Nenhuma exportação encontrada",
    emptyDescription: "Use o botão Enviar dados para declaração na tela de Relatórios.",
    client: "Cliente",
    period: "Período",
    market: "Mercado",
    gross: "Receita",
    expenses: "Despesas",
    tax: "Imposto",
    net: "Líquido",
    status: "Status",
    createdAt: "Criado em"
  },
  ja: {
    title: "\u7533\u544a / \u30a8\u30af\u30b9\u30dd\u30fc\u30c8",
    description: "\u7533\u544a\u3084\u5c06\u6765\u306e\u9023\u643a\u7528\u306b\u4f5c\u6210\u3055\u308c\u305f\u30c7\u30fc\u30bf\u306e\u5c65\u6b74\u3067\u3059\u3002",
    emptyTitle: "\u30a8\u30af\u30b9\u30dd\u30fc\u30c8\u304c\u3042\u308a\u307e\u305b\u3093",
    emptyDescription: "\u30ec\u30dd\u30fc\u30c8\u753b\u9762\u306e\u7533\u544a\u30dc\u30bf\u30f3\u304b\u3089\u4f5c\u6210\u3067\u304d\u307e\u3059\u3002",
    client: "\u53d6\u5f15\u5148",
    period: "\u671f\u9593",
    market: "\u5e02\u5834",
    gross: "\u53ce\u5165",
    expenses: "\u7d4c\u8cbb",
    tax: "\u7a0e\u984d",
    net: "\u7a0e\u629c\u984d",
    status: "\u30b9\u30c6\u30fc\u30bf\u30b9",
    createdAt: "\u4f5c\u6210\u65e5"
  },
  en: {
    title: "Tax / Export",
    description: "History of data prepared for tax declaration and future integrations.",
    emptyTitle: "No exports found",
    emptyDescription: "Use Send to Tax System from the Reports page.",
    client: "Customer",
    period: "Period",
    market: "Market",
    gross: "Income",
    expenses: "Expenses",
    tax: "Tax",
    net: "Net",
    status: "Status",
    createdAt: "Created"
  }
};

export default function ExportsPage() {
  const { language, t } = useLanguage();
  const text = pageText[language];
  const [exports, setExports] = useState<ExternalExport[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadExports() {
      setError(null);
      setIsLoading(true);

      try {
        const supabase = getSupabaseBrowser();
        const {
          data: { user },
          error: userError
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) throw new Error(t("errorSessionExpired"));

        const { data, error: exportsError } = await supabase
          .from("external_exports")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50);

        if (exportsError) throw exportsError;
        setExports((data ?? []) as ExternalExport[]);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : t("errorReportLoad"));
      } finally {
        setIsLoading(false);
      }
    }

    loadExports();
  }, [t]);

  if (isLoading) return <LoadingState label={t("loading")} />;

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold text-jade-700">{text.title}</p>
        <h2 className="page-title">{text.title}</h2>
        <p className="mt-2 max-w-3xl text-sm text-zinc-600">{text.description}</p>
      </div>

      <ErrorMessage message={error} />

      {exports.length === 0 ? (
        <EmptyState title={text.emptyTitle} description={text.emptyDescription} />
      ) : (
        <section className="section-panel">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{text.client}</th>
                  <th>{text.period}</th>
                  <th>{text.market}</th>
                  <th>{text.gross}</th>
                  <th>{text.expenses}</th>
                  <th>{text.tax}</th>
                  <th>{text.net}</th>
                  <th>{text.status}</th>
                  <th>{text.createdAt}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {exports.map((item) => (
                  <tr key={item.id}>
                    <td>{item.client_company_name || item.client_name || "-"}</td>
                    <td>
                      {String(item.period_month).padStart(2, "0")}/{item.period_year}
                    </td>
                    <td>{item.market}</td>
                    <td>{formatWorkCurrency(item.gross_amount, item.currency)}</td>
                    <td>{formatWorkCurrency(item.expenses_amount, item.currency)}</td>
                    <td>{formatWorkCurrency(item.tax_amount, item.currency)}</td>
                    <td>{formatWorkCurrency(item.net_amount, item.currency)}</td>
                    <td>{item.status}</td>
                    <td>{formatDate(item.created_at.slice(0, 10))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
