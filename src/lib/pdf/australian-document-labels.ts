import type { AustralianDocumentType } from "@/lib/pdf/types";

export const australianDocumentLanguage = "en-AU";

export const australianDocumentLabels: Record<AustralianDocumentType, string> = Object.freeze({
  tax_invoice: "Tax Invoice",
  invoice: "Invoice",
  quote: "Quote",
  receipt: "Receipt",
  statement: "Statement"
});

export const australianDocumentPrefixes: Record<AustralianDocumentType, string> = Object.freeze({
  tax_invoice: "TAX",
  invoice: "INV",
  quote: "QUO",
  receipt: "REC",
  statement: "STM"
});

export const australianDocumentNumberLabels: Record<AustralianDocumentType, string> = Object.freeze({
  tax_invoice: "Invoice Number",
  invoice: "Invoice Number",
  quote: "Quote Number",
  receipt: "Receipt Number",
  statement: "Statement Number"
});

export const australianPdfLabels = Object.freeze({
  taxInvoice: "Tax Invoice",
  invoice: "Invoice",
  quote: "Quote",
  receipt: "Receipt",
  statement: "Statement",
  invoiceNumber: "Invoice Number",
  quoteNumber: "Quote Number",
  receiptNumber: "Receipt Number",
  issueDate: "Issue Date",
  dueDate: "Due Date",
  billTo: "Bill To",
  customer: "Customer",
  contactPerson: "Contact Person",
  description: "Description",
  date: "Date",
  quantity: "Quantity",
  unit: "Unit",
  unitPrice: "Unit Price",
  amount: "Amount",
  subtotal: "Subtotal",
  gst: "GST",
  total: "Total",
  amountPaid: "Amount Paid",
  balanceDue: "Balance Due",
  paymentDetails: "Payment Details",
  bankName: "Bank Name",
  bsb: "BSB",
  accountNumber: "Account Number",
  accountName: "Account Name",
  abn: "ABN",
  acn: "ACN",
  businessName: "Business Name",
  tradingName: "Trading Name",
  address: "Address",
  phone: "Phone",
  email: "Email",
  website: "Website",
  notes: "Notes",
  terms: "Terms",
  signature: "Signature",
  paid: "Paid",
  unpaid: "Unpaid",
  overdue: "Overdue",
  labour: "Labour",
  totalDays: "Days",
  hours: "Hours",
  hourlyRate: "Hourly Rate",
  expenses: "Expenses",
  noGstCharged: "No GST has been charged.",
  gstIncluded: "GST has been calculated at 10%.",
  referenceMonth: "Reference Month"
});

export const australianDocumentMessages: Record<AustralianDocumentType, string> = Object.freeze({
  tax_invoice: "Thank you for your business. Please find the tax invoice below.",
  invoice: "Thank you for your business. Please find the invoice below.",
  quote: "Thank you for your enquiry. Please find the quote below.",
  receipt: "Payment received. Please retain this receipt for your records.",
  statement: "Please find the statement of work and charges below."
});
