import { PrismaClient, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("FarmFuse123", 10);
  const farmerData = [
    ["farmer@farmfuse.demo", "Arjun Patil", "Nashik, Maharashtra", "Tomato", 250, 22],
    ["meera@farmfuse.demo", "Meera Shinde", "Dhule, Maharashtra", "Tomato", 200, 23],
    ["suresh@farmfuse.demo", "Suresh Jadhav", "Jalgaon, Maharashtra", "Tomato", 300, 21],
    ["kavita@farmfuse.demo", "Kavita More", "Nandurbar, Maharashtra", "Tomato", 350, 24],
  ] as const;

  for (const [email, name, location, crop, quantityKg, pricePerKg] of farmerData) {
    const farmer = await prisma.user.upsert({
      where: { email },
      update: { name, passwordHash },
      create: { email, name, passwordHash, role: UserRole.FARMER, farmerProfile: { create: { location } } },
    });
    const existing = await prisma.produce.findFirst({ where: { farmerId: farmer.id, crop }, orderBy: { createdAt: "asc" } });
    if (existing) {
      await prisma.produce.update({ where: { id: existing.id }, data: { quantityKg, pricePerKg, location, available: true } });
      await prisma.produce.deleteMany({ where: { farmerId: farmer.id, crop, id: { not: existing.id }, poolMembers: { none: {} } } });
    } else {
      await prisma.produce.create({ data: { farmerId: farmer.id, crop, quantityKg, pricePerKg, location } });
    }
  }

  await prisma.user.upsert({
    where: { email: "buyer@farmfuse.demo" },
    update: { name: "Narmada Foods", passwordHash },
    create: { email: "buyer@farmfuse.demo", name: "Narmada Foods", passwordHash, role: UserRole.BUYER, buyerProfile: { create: { companyName: "Narmada Foods", location: "Dhule, Maharashtra" } } },
  });
}

main().finally(() => prisma.$disconnect());
