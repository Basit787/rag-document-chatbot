import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "Admin123!";
  const hash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { password: hash, role: Role.ADMIN },
    create: { email, password: hash, role: Role.ADMIN },
  });

  console.log(`Seeded admin: ${email}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
