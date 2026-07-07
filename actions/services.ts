"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { formEntries, optionalInt, optionalString, requiredString } from "@/lib/forms";
import { prisma } from "@/lib/prisma";
import { requireShopUser } from "@/lib/tenant";

const serviceSchema = z.object({
  name: requiredString,
  category: requiredString,
  description: optionalString,
  price: optionalInt,
  durationMin: optionalInt,
});

const updateServiceSchema = serviceSchema.extend({
  id: requiredString,
});

export async function createServiceAction(formData: FormData) {
  const { companyId } = await requireShopUser();
  const data = serviceSchema.parse(formEntries(formData));

  await prisma.service.create({
    data: {
      companyId,
      ...data,
    },
  });

  revalidatePath("/shop/services");
}

export async function updateServiceAction(formData: FormData) {
  const { companyId } = await requireShopUser();
  const data = updateServiceSchema.parse(formEntries(formData));

  await prisma.service.update({
    where: { id: data.id, companyId },
    data: {
      name: data.name,
      category: data.category,
      description: data.description,
      price: data.price,
      durationMin: data.durationMin,
    },
  });

  revalidatePath("/shop/services");
}

export async function toggleServiceAction(formData: FormData) {
  const { companyId } = await requireShopUser();
  const id = z.object({ id: requiredString }).parse(formEntries(formData)).id;

  const service = await prisma.service.findFirstOrThrow({
    where: { id, companyId },
    select: { active: true },
  });

  await prisma.service.update({
    where: { id, companyId },
    data: { active: !service.active },
  });

  revalidatePath("/shop/services");
}
