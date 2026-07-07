"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ReminderStatus, ReminderType } from "@/generated/prisma/enums";
import { formEntries, optionalString, requiredDate, requiredString } from "@/lib/forms";
import { prisma } from "@/lib/prisma";
import { assertCustomerInCompany, assertVehicleInCompany, requireShopUser } from "@/lib/tenant";

const reminderSchema = z.object({
  customerId: requiredString,
  vehicleId: requiredString,
  type: z.enum([
    ReminderType.SHAKEN,
    ReminderType.INSURANCE,
    ReminderType.OIL_CHANGE,
    ReminderType.MAINTENANCE,
    ReminderType.WASH,
    ReminderType.CUSTOM,
  ]),
  title: requiredString,
  message: optionalString,
  dueDate: requiredDate,
});

const statusSchema = z.object({
  id: requiredString,
  status: z.enum([
    ReminderStatus.PENDING,
    ReminderStatus.SENT,
    ReminderStatus.DONE,
    ReminderStatus.CANCELLED,
  ]),
});

export async function createReminderAction(formData: FormData) {
  const { companyId } = await requireShopUser();
  const data = reminderSchema.parse(formEntries(formData));

  await assertCustomerInCompany(data.customerId, companyId);
  await assertVehicleInCompany(data.vehicleId, companyId, data.customerId);

  await prisma.reminder.create({
    data: {
      companyId,
      customerId: data.customerId,
      vehicleId: data.vehicleId,
      type: data.type,
      title: data.title,
      message: data.message,
      dueDate: data.dueDate,
    },
  });

  revalidatePath("/shop/reminders");
}

export async function updateReminderStatusAction(formData: FormData) {
  const { companyId } = await requireShopUser();
  const data = statusSchema.parse(formEntries(formData));

  await prisma.reminder.update({
    where: { id: data.id, companyId },
    data: { status: data.status },
  });

  revalidatePath("/shop/reminders");
}
