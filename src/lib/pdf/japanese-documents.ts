import { openJapaneseDocumentPreview } from "@/lib/pdf/japanese-document-preview";
import type { JapaneseDocumentInput } from "@/lib/pdf/types";

export async function generateJapaneseDocumentPdf(input: JapaneseDocumentInput) {
  return openJapaneseDocumentPreview(input, input.action ?? "preview");
}
