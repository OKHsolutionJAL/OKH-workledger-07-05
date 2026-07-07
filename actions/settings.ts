"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { formEntries, optionalString, requiredString } from "@/lib/forms";
import { prisma } from "@/lib/prisma";
import { requireShopUser } from "@/lib/tenant";

const settingsSchema = z.object({
  name: requiredString,
  phone: optionalString,
  email: optionalString,
  address: optionalString,
  city: optionalString,
  prefecture: optionalString,
  postalCode: optionalString,
});

export async function updateShopSettingsAction(formData: FormData) {
  const { companyId } = await requireShopUser();
  const data = settingsSchema.parse(formEntries(formData));

  await prisma.company.update({
    where: { id: companyId },
    data,
  });

  revalidatePath("/shop/settings");
}
