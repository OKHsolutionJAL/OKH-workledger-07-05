"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { formEntries, optionalDate, optionalInt, optionalString, requiredString } from "@/lib/forms";
import { prisma } from "@/lib/prisma";
import { assertCustomerInCompany, requireShopUser } from "@/lib/tenant";

type ExpiryVehicle = {
  id: string;
  companyId: string;
  customerId: string;
  maker: string;
  model: string;
  plateNumber: string | null;
  shakenExpiry: Date | null;
  insuranceExpiry: Date | null;
};

const vehicleSchema = z.object({
  customerId: requiredString,
  maker: requiredString,
  model: requiredString,
  year: optionalInt,
  color: optionalString,
  plateNumber: optionalString,
  chassisNumber: optionalString,
  mileage: optionalInt,
  purchaseDate: optionalDate,
  shakenExpiry: optionalDate,
  insuranceExpiry: optionalDate,
  imageUrl: optionalString,
  notes: optionalString,
});

const updateVehicleSchema = vehicleSchema.extend({
  id: requiredString,
});

function vehicleLabel(vehicle: ExpiryVehicle) {
  return [vehicle.maker, vehicle.model, vehicle.plateNumber].filter(Boolean).join(" - ");
}

async function upsertExpiryReminder(
  vehicle: ExpiryVehicle,
  type: "SHAKEN" | "INSURANCE",
  dueDate: Date | null,
) {
  if (!dueDate) return;

  const label = vehicleLabel(vehicle);
  const existing = await prisma.reminder.findFirst({
    where: {
      companyId: vehicle.companyId,
      vehicleId: vehicle.id,
      type,
      status: "PENDING",
    },
  });

  const payload = {
    companyId: vehicle.companyId,
    customerId: vehicle.customerId,
    vehicleId: vehicle.id,
    type,
    dueDate,
    title: type === "SHAKEN" ? `Shaken - ${label}` : `Seguro - ${label}`,
    message:
      type === "SHAKEN"
        ? "Sugestao automatica baseada no vencimento do shaken."
        : "Sugestao automatica baseada no vencimento do seguro.",
  };

  if (existing) {
    await prisma.reminder.update({
      where: { id: existing.id },
      data: payload,
    });
  } else {
    await prisma.reminder.create({
      data: payload,
    });
  }
}

async function syncVehicleExpiryReminders(vehicle: ExpiryVehicle) {
  await upsertExpiryReminder(vehicle, "SHAKEN", vehicle.shakenExpiry);
  await upsertExpiryReminder(vehicle, "INSURANCE", vehicle.insuranceExpiry);
}

export async function createVehicleAction(formData: FormData) {
  const { companyId } = await requireShopUser();
  const data = vehicleSchema.parse(formEntries(formData));

  await assertCustomerInCompany(data.customerId, companyId);

  const vehicle = await prisma.vehicle.create({
    data: {
      companyId,
      ...data,
    },
  });

  await syncVehicleExpiryReminders(vehicle);

  revalidatePath("/shop/vehicles");
  revalidatePath("/shop/reminders");
  redirect(`/shop/vehicles/${vehicle.id}`);
}

export async function updateVehicleAction(formData: FormData) {
  const { companyId } = await requireShopUser();
  const data = updateVehicleSchema.parse(formEntries(formData));

  await assertCustomerInCompany(data.customerId, companyId);

  const vehicle = await prisma.vehicle.update({
    where: { id: data.id, companyId },
    data: {
      customerId: data.customerId,
      maker: data.maker,
      model: data.model,
      year: data.year,
      color: data.color,
      plateNumber: data.plateNumber,
      chassisNumber: data.chassisNumber,
      mileage: data.mileage,
      purchaseDate: data.purchaseDate,
      shakenExpiry: data.shakenExpiry,
      insuranceExpiry: data.insuranceExpiry,
      imageUrl: data.imageUrl,
      notes: data.notes,
    },
  });

  await syncVehicleExpiryReminders(vehicle);

  revalidatePath("/shop/vehicles");
  revalidatePath("/shop/reminders");
  revalidatePath(`/shop/vehicles/${data.id}`);
}
