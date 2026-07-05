import { z } from "zod";

const optionalCurrency = z.preprocess(
  (value) => (value === "" || value === undefined ? null : value),
  z.coerce.number().min(0, "validationPositive").nullable()
);
const requiredCurrency = z.coerce.number().min(0, "validationPositive");

export const profileSchema = z.object({
  owner_name: z.string().min(2, "validationOwnerName"),
  business_name: z.string().min(2, "validationBusinessName"),
  email: z.string().email("validationEmail"),
  phone: z.string().optional().nullable(),
  country: z.enum(["JP", "AU"]).default("JP"),
  company_country: z.enum(["JP", "AU"]).default("JP"),
  document_market: z.enum(["JP", "AU"]).default("JP"),
  address: z.string().optional().nullable(),
  postal_code: z.string().optional().nullable(),
  website: z.string().url("validationUrl").optional().or(z.literal("")).nullable(),
  invoice_number: z.string().optional().nullable(),
  invoice_registration_number: z.string().optional().nullable(),
  bank_info: z.string().optional().nullable(),
  trading_name: z.string().optional().nullable(),
  abn: z.string().optional().nullable(),
  acn: z.string().optional().nullable(),
  gst_registered: z.preprocess((value) => value === true || value === "true", z.boolean()).default(true),
  gst_rate: z.coerce.number().min(0, "validationPositive").default(10),
  business_address: z.string().optional().nullable(),
  bank_name: z.string().optional().nullable(),
  bsb: z.string().optional().nullable(),
  account_number: z.string().optional().nullable(),
  account_name: z.string().optional().nullable(),
  branch_name: z.string().optional().nullable(),
  account_type: z.string().optional().nullable(),
  account_holder: z.string().optional().nullable(),
  payment_terms: z.string().optional().nullable(),
  default_currency: z.enum(["JPY", "AUD"]).default("JPY"),
  default_hourly_rate: requiredCurrency,
  notes: z.string().optional().nullable(),
  logo_url: z.string().url("validationUrl").optional().or(z.literal("")).nullable(),
  stamp_url: z.string().url("validationUrl").optional().or(z.literal("")).nullable(),
  stamp_image: z.string().url("validationUrl").optional().or(z.literal("")).nullable(),
  qr_code_url: z.string().url("validationUrl").optional().or(z.literal("")).nullable()
});

export const clientSchema = z.object({
  client_name: z.string().min(2, "validationClientName"),
  client_name_jp: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email("validationEmail").optional().or(z.literal("")).nullable(),
  contact_person: z.string().optional().nullable(),
  invoice_number: z.string().optional().nullable(),
  client_country: z.enum(["JP", "AU"]).default("JP"),
  preferred_document_market: z.enum(["JP", "AU"]).default("JP"),
  currency: z.enum(["JPY", "AUD"]).default("JPY"),
  hourly_rate: optionalCurrency,
  notes: z.string().optional().nullable()
});

export const timeEntrySchema = z.object({
  client_id: z.string().uuid("validationSelectClient"),
  work_date: z.string().min(1, "validationDate"),
  site_name: z.string().optional().nullable(),
  service_type: z.string().optional().nullable(),
  start_time: z.string().min(1, "validationStartTime"),
  end_time: z.string().min(1, "validationEndTime"),
  break_minutes: z.coerce.number().min(0, "validationBreak"),
  hourly_rate: requiredCurrency,
  expense_amount: z.coerce.number().min(0).default(0),
  toll_amount: z.coerce.number().min(0).default(0),
  fuel_amount: z.coerce.number().min(0).default(0),
  memo: z.string().optional().nullable(),
  is_invoiced: z.boolean().default(false)
});

export type ValidationErrors = Record<string, string | undefined>;

export function getZodErrors(error: z.ZodError) {
  return error.errors.reduce<ValidationErrors>((acc, issue) => {
    const field = issue.path[0];
    if (field) acc[field] = issue.message;
    return acc;
  }, {});
}
