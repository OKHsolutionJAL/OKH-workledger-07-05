import type { Client } from "@/lib/database.types";

export type DocumentClient = {
  id: string;
  name: string;
  companyName: string;
  contactPerson: string;
  address: string;
  phone: string;
  email: string;
  registrationNumber: string;
  country: "JP" | "AU";
  currency: "JPY" | "AUD";
  preferredDocumentMarket: "JP" | "AU";
};

type ClientWithAliases = Client & {
  company_name?: string | null;
  name?: string | null;
  registration_number?: string | null;
  country?: "JP" | "AU" | null;
};

function text(value: unknown) {
  return String(value ?? "").trim();
}

export function buildDocumentClient(client: Client | null): DocumentClient | null {
  if (!client) return null;

  const clientWithAliases = client as ClientWithAliases;
  const name = text(clientWithAliases.name || client.client_name);
  const companyName = text(clientWithAliases.company_name || client.client_name_jp || client.client_name);
  const country = clientWithAliases.country || client.client_country || "JP";
  const preferredDocumentMarket = client.preferred_document_market || country;
  const currency = client.currency || (preferredDocumentMarket === "AU" ? "AUD" : "JPY");

  return {
    id: client.id,
    name,
    companyName,
    contactPerson: text(client.contact_person),
    address: text(client.address),
    phone: text(client.phone),
    email: text(client.email),
    registrationNumber: text(clientWithAliases.registration_number || client.invoice_number),
    country,
    currency,
    preferredDocumentMarket
  };
}

export function documentClientDisplayName(client: Client | null) {
  const documentClient = buildDocumentClient(client);
  return documentClient?.companyName || documentClient?.name || "";
}
