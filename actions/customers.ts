"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { formEntries, optionalString, requiredString } from "@/lib/forms";
import { prisma } from "@/lib/prisma";
import { requireShopUser } from "@/lib/tenant";

const customerSchema = z.object({
  name: requiredString,
  phone: optionalString,
  email: optionalString,
  lineId: optionalString,
  whatsapp: optionalString,
  address: optionalString,
  language: optionalString.default("pt"),
  notes: optionalString,
});

const updateCustomerSchema = customerSchema.extend({
  id: requiredString,
});

export async function createCustomerAction(formData: FormData) {
  const { companyId } = await requireShopUser();
  const data = customerSchema.parse(formEntries(formData));

  const customer = await prisma.customer.create({
    data: {
      companyId,
      ...data,
      language: data.language ?? "pt",
    },
  });

  revalidatePath("/shop/customers");
  redirect(`/shop/customers/${customer.id}`);
}

export async function updateCustomerAction(formData: FormData) {
  const { companyId } = await requireShopUser();
  const data = updateCustomerSchema.parse(formEntries(formData));

  await prisma.customer.update({
    where: { id: data.id, companyId },
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email,
      lineId: data.lineId,
      whatsapp: data.whatsapp,
      address: data.address,
      language: data.language ?? "pt",
      notes: data.notes,
    },
  });

  revalidatePath("/shop/customers");
  revalidatePath(`/shop/customers/${data.id}`);
}
