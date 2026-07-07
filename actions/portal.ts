"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCustomerScope } from "@/lib/auth";
import { formEntries, optionalString, requiredDate, requiredString } from "@/lib/forms";
import { prisma } from "@/lib/prisma";
import { assertServiceInCompany, assertVehicleInCompany } from "@/lib/tenant";

const appointmentRequestSchema = z.object({
  vehicleId: requiredString,
  serviceId: optionalString,
  scheduledAt: requiredDate,
  notes: optionalString,
});

const profileSchema = z.object({
  name: requiredString,
  phone: optionalString,
  email: optionalString,
  lineId: optionalString,
  whatsapp: optionalString,
  address: optionalString,
  language: optionalString.default("pt"),
});

export async function requestPortalAppointmentAction(formData: FormData) {
  const { companyId, customerId } = await getCustomerScope();
  const data = appointmentRequestSchema.parse(formEntries(formData));

  await assertVehicleInCompany(data.vehicleId, companyId, customerId);
  const service = await assertServiceInCompany(data.serviceId, companyId);

  await prisma.appointment.create({
    data: {
      companyId,
      customerId,
      vehicleId: data.vehicleId,
      serviceId: data.serviceId,
      title: service?.name ?? "Solicitacao de atendimento",
      scheduledAt: data.scheduledAt,
      status: "PENDING",
      notes: data.notes,
    },
  });

  revalidatePath("/portal");
  revalidatePath("/portal/appointments");
}

export async function updatePortalProfileAction(formData: FormData) {
  const { user, companyId, customerId } = await getCustomerScope();
  const data = profileSchema.parse(formEntries(formData));

  await prisma.customer.update({
    where: { id: customerId, companyId },
    data,
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: data.name,
      phone: data.phone,
    },
  });

  revalidatePath("/portal/profile");
}
