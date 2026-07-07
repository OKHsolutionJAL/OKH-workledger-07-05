"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AppointmentStatus } from "@/generated/prisma/enums";
import { formEntries, optionalString, requiredDate, requiredString } from "@/lib/forms";
import { prisma } from "@/lib/prisma";
import { assertCustomerInCompany, assertServiceInCompany, assertVehicleInCompany, requireShopUser } from "@/lib/tenant";

const appointmentSchema = z.object({
  customerId: requiredString,
  vehicleId: requiredString,
  serviceId: optionalString,
  title: requiredString,
  scheduledAt: requiredDate,
  notes: optionalString,
});

const statusSchema = z.object({
  id: requiredString,
  status: z.enum([
    AppointmentStatus.PENDING,
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.IN_PROGRESS,
    AppointmentStatus.COMPLETED,
    AppointmentStatus.CANCELLED,
  ]),
});

export async function createAppointmentAction(formData: FormData) {
  const { companyId } = await requireShopUser();
  const data = appointmentSchema.parse(formEntries(formData));

  await assertCustomerInCompany(data.customerId, companyId);
  await assertVehicleInCompany(data.vehicleId, companyId, data.customerId);
  await assertServiceInCompany(data.serviceId, companyId);

  await prisma.appointment.create({
    data: {
      companyId,
      customerId: data.customerId,
      vehicleId: data.vehicleId,
      serviceId: data.serviceId,
      title: data.title,
      scheduledAt: data.scheduledAt,
      notes: data.notes,
    },
  });

  revalidatePath("/shop/appointments");
}

export async function updateAppointmentStatusAction(formData: FormData) {
  const { companyId } = await requireShopUser();
  const data = statusSchema.parse(formEntries(formData));

  await prisma.appointment.update({
    where: { id: data.id, companyId },
    data: { status: data.status },
  });

  revalidatePath("/shop/appointments");
}
