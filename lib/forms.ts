import { z } from "zod";

export const requiredString = z.string().trim().min(1, "Campo obrigatorio");

export const optionalString = z.preprocess((value) => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}, z.string().optional());

export const optionalInt = z.preprocess((value) => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : value;
}, z.number().int().nonnegative().optional());

export const requiredInt = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : value;
}, z.number().int().nonnegative());

export const optionalDate = z.preprocess((value) => {
  if (typeof value !== "string") return undefined;
  if (!value.trim()) return undefined;
  return new Date(value);
}, z.date().optional());

export const requiredDate = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  return new Date(value);
}, z.date());

export function formEntries(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export function mustGetString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || !value) {
    throw new Error(`Campo ausente: ${key}`);
  }

  return value;
}
