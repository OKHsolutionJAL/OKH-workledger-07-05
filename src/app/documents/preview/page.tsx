"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { australianPdfLabels as auLabels } from "@/lib/pdf/australian-document-labels";
import { readAustralianDocumentPreview, type AustralianDocumentPreviewData } from "@/lib/pdf/australian-document-preview";
import { readJapaneseDocumentPreview, type JapaneseDocumentPreviewData } from "@/lib/pdf/japanese-document-preview";
import { japanesePdfLabels as jpLabels, japanesePreviewUiLabels as jpUi } from "@/lib/pdf/japanese-document-labels";

type PreviewData = JapaneseDocumentPreviewData | AustralianDocumentPreviewData;

const fullWidthColon = "\uff1a";
const jpUnset = "\u672a\u8a2d\u5b9a";
const auUnset = "Not set";

function stripHonorific(value: string | undefined) {
  return String(value ?? "").replace(` ${jpLabels.honorific}`, "").trim();
}

function LoadingState() {
  return (
    <main className="document-preview-route">
      <section className="pdf-page">
        <p className="pdf-muted">{jpUi.loading}</p>
      </section>
    </main>
  );
}

function MissingState() {
  return (
    <main className="document-preview-route">
      <div className="no-print document-preview-toolbar">
        <button onClick={() => window.close()} type="button">
          {jpUi.close}
        </button>
      </div>
      <section className="pdf-page">
        <h1 className="pdf-title">{jpUi.missingTitle}</h1>
        <p className="pdf-muted">{jpUi.missingMessage}</p>
      </section>
    </main>
  );
}

function JapanesePreview({ documentData }: { documentData: JapaneseDocumentPreviewData }) {
  const client = documentData.client;
  const clientBaseName = client?.companyName || client?.name || stripHonorific(documentData.clientName) || jpUnset;
  const clientName = `${clientBaseName} ${jpLabels.honorific}`;
  const clientContact = client?.contactPerson || documentData.clientContact || jpUnset;
  const clientAddress = client?.address || documentData.clientAddress || jpUnset;
  const clientPhone = client?.phone || documentData.clientPhone || jpUnset;
  const clientEmail = client?.email || documentData.clientEmail || jpUnset;
  const clientRegistrationNumber = client?.registrationNumber || documentData.clientRegistrationNumber || jpUnset;

  return (
    <article className="pdf-page">
      <header className="pdf-header">
        <div>
          <p className="pdf-brand">OKH WorkLedger</p>
          <h1 className="pdf-title">{documentData.title}</h1>
          <p className="pdf-message">{documentData.message}</p>
        </div>
        <div className="pdf-meta">
          <p>
            <span>{documentData.numberLabel}</span>
            <strong>{documentData.documentNumber}</strong>
          </p>
          <p>
            <span>{jpLabels.issueDate}</span>
            <strong>{documentData.issueDate}</strong>
          </p>
        </div>
      </header>

      <section className="pdf-parties">
        <div className="pdf-party pdf-client">
          <p className="pdf-section-label">{jpLabels.client}</p>
          <h2>{clientName}</h2>
          <dl>
            <div>
              <dt>{jpLabels.contactPerson}</dt>
              <dd>{clientContact}</dd>
            </div>
            <div>
              <dt>{jpLabels.address}</dt>
              <dd>{clientAddress}</dd>
            </div>
            <div>
              <dt>{jpLabels.phone}</dt>
              <dd>{clientPhone}</dd>
            </div>
            <div>
              <dt>{jpLabels.email}</dt>
              <dd>{clientEmail}</dd>
            </div>
            <div>
              <dt>{jpLabels.registrationNumber}</dt>
              <dd>{clientRegistrationNumber}</dd>
            </div>
          </dl>
        </div>

        <div className="pdf-party">
          <p className="pdf-section-label">{jpLabels.issuer}</p>
          <h2>{documentData.issuerName}</h2>
          <dl>
            <div>
              <dt>{jpLabels.issuer}</dt>
              <dd>{documentData.issuerOwner}</dd>
            </div>
            <div>
              <dt>{jpLabels.postalCode}</dt>
              <dd>{documentData.issuerPostalCode}</dd>
            </div>
            <div>
              <dt>{jpLabels.address}</dt>
              <dd>{documentData.issuerAddress}</dd>
            </div>
            <div>
              <dt>{jpLabels.phone}</dt>
              <dd>{documentData.issuerPhone}</dd>
            </div>
            <div>
              <dt>{jpLabels.email}</dt>
              <dd>{documentData.issuerEmail}</dd>
            </div>
            <div>
              <dt>{jpLabels.qualifiedInvoiceNumber}</dt>
              <dd>{documentData.issuerRegistrationNumber}</dd>
            </div>
          </dl>
          <div className="pdf-stamp">{jpLabels.stamp}</div>
        </div>
      </section>

      <section className="pdf-total-summary">
        <div>
          <p>
            {jpLabels.subject}
            {fullWidthColon}
            {documentData.referenceMonth} {jpUi.workItems}
          </p>
          <p>
            {jpLabels.paymentDue}
            {fullWidthColon}
            {documentData.paymentDue}
          </p>
        </div>
        <div>
          <span>{jpLabels.total}</span>
          <strong>{documentData.total}</strong>
        </div>
      </section>

      <table className="pdf-table">
        <colgroup>
          <col className="pdf-col-date" />
          <col className="pdf-col-description" />
          <col className="pdf-col-quantity" />
          <col className="pdf-col-unit" />
          <col className="pdf-col-money" />
          <col className="pdf-col-money" />
        </colgroup>
        <thead>
          <tr>
            <th>{jpLabels.date}</th>
            <th>{jpLabels.description}</th>
            <th>{jpLabels.quantity}</th>
            <th>{jpLabels.unit}</th>
            <th>{jpLabels.unitPrice}</th>
            <th>{jpLabels.amount}</th>
          </tr>
        </thead>
        <tbody>
          {documentData.rows.map((row, index) => (
            <tr key={`${row.date}-${index}`}>
              <td>{row.date}</td>
              <td>{row.description}</td>
              <td className="pdf-right">{row.quantity}</td>
              <td className="pdf-center">{row.unit}</td>
              <td className="pdf-right">{row.unitPrice}</td>
              <td className="pdf-right">{row.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="pdf-bottom-grid">
        <div className="pdf-box">
          <h3>{jpLabels.paymentInfo}</h3>
          <dl>
            <div>
              <dt>{jpLabels.bankName}</dt>
              <dd>{documentData.bankName}</dd>
            </div>
            <div>
              <dt>{jpLabels.branchName}</dt>
              <dd>{documentData.branchName}</dd>
            </div>
            <div>
              <dt>{jpLabels.accountType}</dt>
              <dd>{documentData.accountType}</dd>
            </div>
            <div>
              <dt>{jpLabels.accountNumber}</dt>
              <dd>{documentData.accountNumber}</dd>
            </div>
            <div>
              <dt>{jpLabels.accountHolder}</dt>
              <dd>{documentData.accountHolder}</dd>
            </div>
          </dl>
          <p className="pdf-bank-text">{documentData.bankInfo}</p>
        </div>

        <table className="pdf-totals">
          <tbody>
            <tr>
              <th>{jpLabels.subtotal}</th>
              <td>{documentData.subtotal}</td>
            </tr>
            <tr>
              <th>{jpLabels.tax}</th>
              <td>{documentData.tax}</td>
            </tr>
            <tr>
              <th>{jpLabels.total}</th>
              <td>{documentData.total}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="pdf-notes">
        <h3>{jpLabels.notes}</h3>
        <p>{documentData.notes}</p>
      </section>

      <footer className="pdf-signature">
        <div>
          <span>{jpLabels.signature}</span>
        </div>
        <div>
          <span>{jpLabels.seal}</span>
        </div>
      </footer>
    </article>
  );
}

function AustralianPreview({ documentData }: { documentData: AustralianDocumentPreviewData }) {
  const client = documentData.client;
  const customerName = client?.companyName || client?.name || documentData.customerName || auUnset;
  const customerContact = client?.contactPerson || documentData.customerContact || auUnset;
  const customerAddress = client?.address || documentData.customerAddress || auUnset;
  const customerPhone = client?.phone || documentData.customerPhone || auUnset;
  const customerEmail = client?.email || documentData.customerEmail || auUnset;
  const customerRegistrationNumber = client?.registrationNumber || documentData.customerRegistrationNumber || auUnset;

  return (
    <article className="pdf-page pdf-page-au">
      <header className="au-header">
        <div>
          <p className="au-kicker">OKH WorkLedger</p>
          <h1 className="au-title">{documentData.title}</h1>
          <p className="au-message">{documentData.message}</p>
        </div>
        <div className="au-meta">
          <p>
            <span>{documentData.numberLabel}</span>
            <strong>{documentData.documentNumber}</strong>
          </p>
          <p>
            <span>{auLabels.issueDate}</span>
            <strong>{documentData.issueDate}</strong>
          </p>
          <p>
            <span>{auLabels.dueDate}</span>
            <strong>{documentData.dueDate}</strong>
          </p>
        </div>
      </header>

      <section className="au-parties">
        <div>
          <h2>{auLabels.billTo}</h2>
          <p className="au-client-name">{customerName}</p>
          <dl className="au-details">
            <div>
              <dt>{auLabels.contactPerson}</dt>
              <dd>{customerContact}</dd>
            </div>
            <div>
              <dt>{auLabels.address}</dt>
              <dd>{customerAddress}</dd>
            </div>
            <div>
              <dt>{auLabels.phone}</dt>
              <dd>{customerPhone}</dd>
            </div>
            <div>
              <dt>{auLabels.email}</dt>
              <dd>{customerEmail}</dd>
            </div>
            <div>
              <dt>{auLabels.abn}</dt>
              <dd>{customerRegistrationNumber}</dd>
            </div>
          </dl>
        </div>
        <div>
          <h2>{auLabels.businessName}</h2>
          <p className="au-business-name">{documentData.businessName}</p>
          <dl className="au-details">
            <div>
              <dt>{auLabels.tradingName}</dt>
              <dd>{documentData.tradingName}</dd>
            </div>
            <div>
              <dt>{auLabels.abn}</dt>
              <dd>{documentData.abn}</dd>
            </div>
            <div>
              <dt>{auLabels.acn}</dt>
              <dd>{documentData.acn}</dd>
            </div>
            <div>
              <dt>{auLabels.address}</dt>
              <dd>{documentData.address}</dd>
            </div>
            <div>
              <dt>{auLabels.phone}</dt>
              <dd>{documentData.phone}</dd>
            </div>
            <div>
              <dt>{auLabels.email}</dt>
              <dd>{documentData.email}</dd>
            </div>
            <div>
              <dt>{auLabels.website}</dt>
              <dd>{documentData.website}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="au-balance">
        <div>
          <span>{auLabels.balanceDue}</span>
          <strong>{documentData.balanceDue}</strong>
        </div>
        <p>{documentData.gstNote}</p>
      </section>

      <table className="pdf-table au-table">
        <colgroup>
          <col className="pdf-col-date" />
          <col className="pdf-col-description" />
          <col className="pdf-col-quantity" />
          <col className="pdf-col-unit" />
          <col className="pdf-col-money" />
          <col className="pdf-col-money" />
        </colgroup>
        <thead>
          <tr>
            <th>{auLabels.date}</th>
            <th>{auLabels.description}</th>
            <th>{auLabels.quantity}</th>
            <th>{auLabels.unit}</th>
            <th>{auLabels.unitPrice}</th>
            <th>{auLabels.amount}</th>
          </tr>
        </thead>
        <tbody>
          {documentData.rows.map((row, index) => (
            <tr key={`${row.date}-${index}`}>
              <td>{row.date}</td>
              <td>{row.description}</td>
              <td className="pdf-right">{row.quantity}</td>
              <td className="pdf-center">{row.unit}</td>
              <td className="pdf-right">{row.unitPrice}</td>
              <td className="pdf-right">{row.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="pdf-bottom-grid au-bottom-grid">
        <div className="pdf-box">
          <h3>{auLabels.paymentDetails}</h3>
          <dl>
            <div>
              <dt>{auLabels.bankName}</dt>
              <dd>{documentData.bankName}</dd>
            </div>
            <div>
              <dt>{auLabels.bsb}</dt>
              <dd>{documentData.bsb}</dd>
            </div>
            <div>
              <dt>{auLabels.accountNumber}</dt>
              <dd>{documentData.accountNumber}</dd>
            </div>
            <div>
              <dt>{auLabels.accountName}</dt>
              <dd>{documentData.accountName}</dd>
            </div>
          </dl>
          <p className="pdf-bank-text">{documentData.paymentTerms}</p>
        </div>

        <table className="pdf-totals">
          <tbody>
            <tr>
              <th>{auLabels.subtotal}</th>
              <td>{documentData.subtotal}</td>
            </tr>
            <tr>
              <th>{auLabels.gst}</th>
              <td>{documentData.gst}</td>
            </tr>
            <tr>
              <th>{auLabels.total}</th>
              <td>{documentData.total}</td>
            </tr>
            <tr>
              <th>{auLabels.amountPaid}</th>
              <td>{documentData.amountPaid}</td>
            </tr>
            <tr>
              <th>{auLabels.balanceDue}</th>
              <td>{documentData.balanceDue}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="pdf-notes">
        <h3>{auLabels.notes}</h3>
        <p>{documentData.notes}</p>
      </section>

      <footer className="pdf-signature">
        <div>
          <span>{auLabels.signature}</span>
        </div>
        <div>
          <span>{auLabels.terms}</span>
        </div>
      </footer>
    </article>
  );
}

function PreviewContent() {
  const searchParams = useSearchParams();
  const [documentData, setDocumentData] = useState<PreviewData | null>(null);
  const [isMissing, setIsMissing] = useState(false);

  useEffect(() => {
    const key = searchParams.get("key");
    const data = readJapaneseDocumentPreview(key) ?? readAustralianDocumentPreview(key);
    setDocumentData(data);
    setIsMissing(!data);
  }, [searchParams]);

  useEffect(() => {
    if (!documentData || searchParams.get("print") !== "1") return;
    const timer = window.setTimeout(() => window.print(), 450);
    return () => window.clearTimeout(timer);
  }, [documentData, searchParams]);

  if (isMissing) return <MissingState />;
  if (!documentData) return <LoadingState />;

  const isAustralian = documentData.market === "AU";

  return (
    <main className={`document-preview-route ${isAustralian ? "document-preview-route-au" : ""}`}>
      <div className="no-print document-preview-toolbar">
        <button onClick={() => window.print()} type="button">
          {isAustralian ? "Print / Save PDF" : jpUi.printSave}
        </button>
        <button onClick={() => window.close()} type="button">
          {isAustralian ? "Close" : jpUi.close}
        </button>
      </div>

      {isAustralian ? <AustralianPreview documentData={documentData} /> : <JapanesePreview documentData={documentData} />}
    </main>
  );
}

export default function DocumentPreviewPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <PreviewContent />
    </Suspense>
  );
}
