"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { clearSessionCookie, getRoleHome, setSessionCookie, verifyPassword } from "@/lib/auth";
import { formEntries } from "@/lib/forms";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1),
});

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse(formEntries(formData));

  if (!parsed.success) {
    redirect("/login?error=invalid");
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    include: { company: true },
  });

  if (!user || user.status !== "ACTIVE") {
    redirect("/login?error=invalid");
  }

  if (user.role !== "SUPER_ADMIN" && user.company?.status !== "ACTIVE") {
    redirect("/login?error=inactive");
  }

  const passwordOk = await verifyPassword(parsed.data.password, user.passwordHash);

  if (!passwordOk) {
    redirect("/login?error=invalid");
  }

  await setSessionCookie(user.id);
  redirect(getRoleHome(user.role));
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}
