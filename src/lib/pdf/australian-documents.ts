import { openAustralianDocumentPreview } from "@/lib/pdf/australian-document-preview";
import type { AustralianDocumentInput } from "@/lib/pdf/types";

export async function generateAustralianDocumentPdf(input: AustralianDocumentInput) {
  return openAustralianDocumentPreview(input, input.action ?? "preview");
}
