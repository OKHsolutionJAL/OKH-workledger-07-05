import { japanesePreviewUiLabels } from "@/lib/pdf/japanese-document-labels";
import type { PdfAction } from "@/lib/pdf/types";

export const pdfFontFamily = '"Yu Gothic", "Meiryo", "Noto Sans JP", sans-serif';

type PrintableDocumentOptions = {
  title: string;
  fileName: string;
  body: string;
  orientation?: "portrait" | "landscape";
};

export function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function textOrDash(value: unknown) {
  const text = String(value ?? "").trim();
  return text ? escapeHtml(text) : "-";
}

export function formatTime(value: string | null | undefined) {
  return value ? value.slice(0, 5) : "-";
}

export function buildPrintableDocument({ title, fileName, body, orientation = "portrait" }: PrintableDocumentOptions) {
  const paperWidth = orientation === "landscape" ? "297mm" : "210mm";
  const paperMinHeight = orientation === "landscape" ? "210mm" : "297mm";

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    @page {
      size: A4 ${orientation};
      margin: 12mm;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    html,
    body {
      margin: 0;
      padding: 0;
      background: #e7e7e7;
      color: #111;
      font-family: ${pdfFontFamily};
      font-size: 12px;
      line-height: 1.45;
    }

    body {
      padding: 18px;
    }

    .screen-hint {
      width: ${paperWidth};
      margin: 0 auto 12px;
      border: 1px solid #cfcfcf;
      background: #fff;
      padding: 10px 14px;
      color: #333;
      font-size: 12px;
    }

    .sheet {
      width: ${paperWidth};
      min-height: ${paperMinHeight};
      margin: 0 auto;
      background: #fff;
      padding: 14mm;
      box-shadow: 0 12px 32px rgb(0 0 0 / 0.14);
    }

    h1,
    h2,
    h3,
    p {
      margin: 0;
    }

    .document-title {
      text-align: center;
      font-size: 26px;
      font-weight: 700;
      letter-spacing: 0.12em;
    }

    .document-subtitle {
      margin-top: 4px;
      text-align: center;
      font-size: 11px;
      color: #444;
    }

    .meta-row,
    .summary-grid,
    .party-grid,
    .footer-grid {
      display: grid;
      gap: 10px;
    }

    .meta-row {
      grid-template-columns: 1fr auto;
      align-items: start;
      margin-top: 12px;
    }

    .party-grid {
      grid-template-columns: 1fr 1fr;
      margin-top: 16px;
    }

    .summary-grid {
      grid-template-columns: 1.1fr 0.9fr;
      margin-top: 16px;
      align-items: start;
    }

    .footer-grid {
      grid-template-columns: 1fr 1fr;
      margin-top: 14px;
    }

    .box {
      border: 1px solid #111;
      padding: 8px 10px;
      min-height: 34px;
    }

    .box-title {
      margin-bottom: 5px;
      font-size: 11px;
      font-weight: 700;
      color: #111;
    }

    .muted {
      color: #444;
    }

    .large-total {
      display: inline-block;
      min-width: 74mm;
      margin-top: 8px;
      border-bottom: 2px solid #111;
      padding-bottom: 4px;
      font-size: 24px;
      font-weight: 700;
    }

    .stamp-box {
      display: grid;
      width: 24mm;
      height: 24mm;
      margin-left: auto;
      place-items: center;
      border: 1px solid #111;
      color: #333;
      font-size: 11px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 14px;
      table-layout: fixed;
    }

    th,
    td {
      border: 1px solid #111;
      padding: 5px 6px;
      vertical-align: top;
      overflow-wrap: anywhere;
    }

    th {
      background: #f2f2f2;
      text-align: left;
      font-weight: 700;
    }

    .right {
      text-align: right;
    }

    .center {
      text-align: center;
    }

    .totals-table {
      width: 86mm;
      margin-top: 0;
      margin-left: auto;
    }

    .signature-line {
      height: 26mm;
      border-bottom: 1px solid #111;
    }

    .page-footer {
      margin-top: 12px;
      display: flex;
      justify-content: space-between;
      color: #555;
      font-size: 10px;
    }

    @media print {
      html,
      body {
        background: #fff;
      }

      body {
        padding: 0;
      }

      .screen-hint {
        display: none;
      }

      .sheet {
        width: auto;
        min-height: auto;
        margin: 0;
        padding: 0;
        box-shadow: none;
      }

      table,
      tr,
      .box {
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="screen-hint">${escapeHtml(japanesePreviewUiLabels.saveAsPdfHint)}</div>
  <main class="sheet" aria-label="${escapeHtml(fileName)}">
    ${body}
  </main>
</body>
</html>`;
}

export async function openPrintableDocument(html: string, action: PdfAction) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    throw new Error(japanesePreviewUiLabels.previewOpenError);
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  if (action === "share" && navigator.share) {
    await navigator.share({
      title: printWindow.document.title,
      text: japanesePreviewUiLabels.shareText
    });
    return;
  }

  if (action === "download" || action === "print") {
    const printDocument = () => printWindow.setTimeout(() => printWindow.print(), 300);
    if (printWindow.document.readyState === "complete") {
      printDocument();
    } else {
      printWindow.addEventListener("load", printDocument, { once: true });
    }
  }
}
