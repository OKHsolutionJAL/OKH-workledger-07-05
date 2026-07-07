"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { CompanyStatus } from "@/generated/prisma/enums";
import { hashPassword, requireRole } from "@/lib/auth";
import { formEntries, optionalInt, optionalString, requiredString } from "@/lib/forms";
import { prisma } from "@/lib/prisma";

const companySchema = z.object({
  name: requiredString,
  slug: z.string().trim().min(2).regex(/^[a-z0-9-]+$/, "Use apenas letras, numeros e hifens"),
  logoUrl: optionalString,
  phone: optionalString,
  email: optionalString,
  address: optionalString,
  city: optionalString,
  prefecture: optionalString,
  postalCode: optionalString,
});

const createCompanySchema = companySchema.extend({
  adminName: requiredString,
  adminEmail: z.string().trim().email().toLowerCase(),
  adminPassword: z.string().min(8),
});

const updateCompanySchema = companySchema.extend({
  id: requiredString,
});

const companyStatusSchema = z.object({
  id: requiredString,
  status: z.enum([CompanyStatus.ACTIVE, CompanyStatus.INACTIVE]),
});

const planSchema = z.object({
  name: requiredString,
  priceMonthly: optionalInt.default(0),
  customerLimit: optionalInt,
  vehicleLimit: optionalInt,
});

export async function createCompanyAction(formData: FormData) {
  await requireRole("SUPER_ADMIN");
  const data = createCompanySchema.parse(formEntries(formData));
  const passwordHash = await hashPassword(data.adminPassword);

  const company = await prisma.company.create({
    data: {
      name: data.name,
      slug: data.slug,
      logoUrl: data.logoUrl,
      phone: data.phone,
      email: data.email,
      address: data.address,
      city: data.city,
      prefecture: data.prefecture,
      postalCode: data.postalCode,
      users: {
        create: {
          name: data.adminName,
          email: data.adminEmail,
          passwordHash,
          role: "SHOP_ADMIN",
        },
      },
    },
  });

  revalidatePath("/admin/companies");
  redirect(`/admin/companies/${company.id}`);
}

export async function updateCompanyAction(formData: FormData) {
  await requireRole("SUPER_ADMIN");
  const data = updateCompanySchema.parse(formEntries(formData));

  await prisma.company.update({
    where: { id: data.id },
    data: {
      name: data.name,
      slug: data.slug,
      logoUrl: data.logoUrl,
      phone: data.phone,
      email: data.email,
      address: data.address,
      city: data.city,
      prefecture: data.prefecture,
      postalCode: data.postalCode,
    },
  });

  revalidatePath("/admin/companies");
  revalidatePath(`/admin/companies/${data.id}`);
}

export async function setCompanyStatusAction(formData: FormData) {
  await requireRole("SUPER_ADMIN");
  const data = companyStatusSchema.parse(formEntries(formData));

  await prisma.company.update({
    where: { id: data.id },
    data: { status: data.status },
  });

  revalidatePath("/admin/companies");
  revalidatePath(`/admin/companies/${data.id}`);
}

export async function createPlanAction(formData: FormData) {
  await requireRole("SUPER_ADMIN");
  const data = planSchema.parse(formEntries(formData));

  await prisma.subscriptionPlan.create({
    data: {
      name: data.name,
      priceMonthly: data.priceMonthly,
      customerLimit: data.customerLimit,
      vehicleLimit: data.vehicleLimit,
      features: {},
    },
  });

  revalidatePath("/admin/plans");
}

export async function togglePlanAction(formData: FormData) {
  await requireRole("SUPER_ADMIN");
  const id = z.object({ id: requiredString }).parse(formEntries(formData)).id;

  const plan = await prisma.subscriptionPlan.findUniqueOrThrow({
    where: { id },
    select: { active: true },
  });

  await prisma.subscriptionPlan.update({
    where: { id },
    data: { active: !plan.active },
  });

  revalidatePath("/admin/plans");
}
