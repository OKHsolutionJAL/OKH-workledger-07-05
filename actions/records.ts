"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { formEntries, optionalDate, optionalInt, optionalString, requiredString } from "@/lib/forms";
import { prisma } from "@/lib/prisma";
import { assertCustomerInCompany, assertServiceInCompany, assertVehicleInCompany, requireShopUser } from "@/lib/tenant";

const recordSchema = z.object({
  customerId: requiredString,
  vehicleId: requiredString,
  serviceId: optionalString,
  title: requiredString,
  description: optionalString,
  mileage: optionalInt,
  price: optionalInt,
  performedAt: optionalDate,
  beforeImageUrl: optionalString,
  afterImageUrl: optionalString,
  notes: optionalString,
});

export async function createServiceRecordAction(formData: FormData) {
  const { companyId } = await requireShopUser();
  const data = recordSchema.parse(formEntries(formData));

  await assertCustomerInCompany(data.customerId, companyId);
  await assertVehicleInCompany(data.vehicleId, companyId, data.customerId);
  await assertServiceInCompany(data.serviceId, companyId);

  await prisma.serviceRecord.create({
    data: {
      companyId,
      customerId: data.customerId,
      vehicleId: data.vehicleId,
      serviceId: data.serviceId,
      title: data.title,
      description: data.description,
      mileage: data.mileage,
      price: data.price,
      performedAt: data.performedAt ?? new Date(),
      beforeImageUrl: data.beforeImageUrl,
      afterImageUrl: data.afterImageUrl,
      notes: data.notes,
    },
  });

  revalidatePath("/shop/records");
}
