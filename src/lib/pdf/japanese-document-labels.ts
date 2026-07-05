import type { JapaneseDocumentType } from "@/lib/pdf/types";

export const documentLanguage = "ja";

export const japaneseDocumentLabels: Record<JapaneseDocumentType, string> = Object.freeze({
  invoice: "\u8acb\u6c42\u66f8",
  estimate: "\u898b\u7a4d\u66f8",
  delivery: "\u7d0d\u54c1\u66f8",
  receipt: "\u9818\u53ce\u66f8"
});

export const japaneseDocumentPrefixes: Record<JapaneseDocumentType, string> = Object.freeze({
  invoice: "INV",
  estimate: "EST",
  delivery: "DEL",
  receipt: "REC"
});

export const japaneseDocumentNumberLabels: Record<JapaneseDocumentType, string> = Object.freeze({
  invoice: "\u8acb\u6c42\u756a\u53f7",
  estimate: "\u898b\u7a4d\u756a\u53f7",
  delivery: "\u7d0d\u54c1\u756a\u53f7",
  receipt: "\u9818\u53ce\u756a\u53f7"
});

export const japanesePdfLabels = Object.freeze({
  issueDate: "\u767a\u884c\u65e5",
  client: "\u53d6\u5f15\u5148",
  contactPerson: "\u62c5\u5f53\u8005",
  subject: "\u4ef6\u540d",
  description: "\u5185\u5bb9",
  date: "\u65e5\u4ed8",
  quantity: "\u6570\u91cf",
  unit: "\u5358\u4f4d",
  unitPrice: "\u5358\u4fa1",
  amount: "\u91d1\u984d",
  subtotal: "\u5c0f\u8a08",
  tax: "\u6d88\u8cbb\u7a0e",
  total: "\u5408\u8a08",
  paymentDue: "\u304a\u652f\u6255\u671f\u9650",
  paymentInfo: "\u304a\u632f\u8fbc\u60c5\u5831",
  bankName: "\u9280\u884c\u540d",
  branchName: "\u652f\u5e97\u540d",
  accountType: "\u53e3\u5ea7\u7a2e\u5225",
  accountNumber: "\u53e3\u5ea7\u756a\u53f7",
  accountHolder: "\u53e3\u5ea7\u540d\u7fa9",
  notes: "\u5099\u8003",
  issuer: "\u767a\u884c\u8005",
  address: "\u4f4f\u6240",
  postalCode: "\u90f5\u4fbf\u756a\u53f7",
  phone: "\u96fb\u8a71\u756a\u53f7",
  email: "\u30e1\u30fc\u30eb",
  registrationNumber: "\u767b\u9332\u756a\u53f7",
  qualifiedInvoiceNumber: "\u9069\u683c\u8acb\u6c42\u66f8\u767a\u884c\u4e8b\u696d\u8005\u767b\u9332\u756a\u53f7",
  stamp: "\u5370",
  honorific: "\u5fa1\u4e2d",
  workSite: "\u73fe\u5834",
  service: "\u4f5c\u696d\u5185\u5bb9",
  start: "\u958b\u59cb",
  end: "\u7d42\u4e86",
  break: "\u4f11\u61a9",
  hours: "\u6642\u9593",
  minutes: "\u5206",
  hourlyRate: "\u6642\u9593\u5358\u4fa1",
  workMonth: "\u5bfe\u8c61\u6708",
  workReport: "\u4f5c\u696d\u6642\u9593\u5831\u544a\u66f8",
  workReportNumber: "\u4f5c\u696d\u6642\u9593\u5831\u544a\u66f8\u756a\u53f7",
  totalDays: "\u7a3c\u50cd\u65e5\u6570",
  totalHours: "\u4f5c\u696d\u6642\u9593",
  totalExpenses: "\u7d4c\u8cbb\u5408\u8a08",
  signature: "\u7f72\u540d",
  seal: "\u637a\u5370",
  createdBy: "\u4f5c\u6210"
});

export const japanesePreviewUiLabels = Object.freeze({
  printSave: "\u5370\u5237 / PDF\u4fdd\u5b58",
  close: "\u9589\u3058\u308b",
  loading: "\u8aad\u307f\u8fbc\u307f\u4e2d...",
  missingTitle: "\u66f8\u985e\u30c7\u30fc\u30bf\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093",
  missingMessage: "\u30ec\u30dd\u30fc\u30c8\u753b\u9762\u304b\u3089\u3082\u3046\u4e00\u5ea6\u66f8\u985e\u3092\u4f5c\u6210\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
  workItems: "\u4f5c\u696d\u5206",
  saveAsPdfHint: "\u5370\u5237\u753b\u9762\u3067\u300cPDF\u306b\u4fdd\u5b58\u300d\u3092\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
  previewOpenError: "\u66f8\u985e\u306e\u30d7\u30ec\u30d3\u30e5\u30fc\u3092\u958b\u3051\u307e\u305b\u3093\u3067\u3057\u305f\u3002",
  shareText: "\u66f8\u985e\u3092\u4f5c\u6210\u3057\u307e\u3057\u305f\u3002"
});

export const japaneseDocumentMessages: Record<JapaneseDocumentType, string> = Object.freeze({
  invoice: "\u4e0b\u8a18\u306e\u901a\u308a\u3054\u8acb\u6c42\u7533\u3057\u4e0a\u3052\u307e\u3059\u3002",
  estimate: "\u4e0b\u8a18\u306e\u901a\u308a\u304a\u898b\u7a4d\u308a\u7533\u3057\u4e0a\u3052\u307e\u3059\u3002",
  delivery: "\u4e0b\u8a18\u306e\u901a\u308a\u7d0d\u54c1\u3044\u305f\u3057\u307e\u3057\u305f\u3002",
  receipt: "\u4e0b\u8a18\u306e\u91d1\u984d\u3092\u9818\u53ce\u3044\u305f\u3057\u307e\u3057\u305f\u3002"
});
