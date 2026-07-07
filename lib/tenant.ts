import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function requireShopUser() {
  const user = await requireRole(["SHOP_ADMIN", "SHOP_STAFF"]);

  if (!user.companyId) {
    redirect("/login");
  }

  return {
    user,
    companyId: user.companyId,
  };
}

export async function assertCustomerInCompany(customerId: string, companyId: string) {
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, companyId },
  });

  if (!customer) {
    throw new Error("Cliente nao encontrado para esta loja.");
  }

  return customer;
}

export async function assertVehicleInCompany(vehicleId: string, companyId: string, customerId?: string) {
  const vehicle = await prisma.vehicle.findFirst({
    where: {
      id: vehicleId,
      companyId,
      ...(customerId ? { customerId } : {}),
    },
  });

  if (!vehicle) {
    throw new Error("Veiculo nao encontrado para esta loja.");
  }

  return vehicle;
}

export async function assertServiceInCompany(serviceId: string | undefined, companyId: string) {
  if (!serviceId) return null;

  const service = await prisma.service.findFirst({
    where: { id: serviceId, companyId },
  });

  if (!service) {
    throw new Error("Servico nao encontrado para esta loja.");
  }

  return service;
}
