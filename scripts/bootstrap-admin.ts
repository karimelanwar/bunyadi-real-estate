import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Creates or updates the single admin account from ADMIN_EMAIL / ADMIN_PASSWORD
// and touches nothing else. This is deliberately separate from the demo-content
// seed so that recovering admin access can never destroy real listings or
// enquiries — and so that a fresh deploy can bootstrap itself on first boot.
const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  // Fail loudly rather than silently creating a well-known default account.
  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must both be set. Copy .env.example to .env and fill them in."
    );
  }

  if (password.length < 10) {
    throw new Error("ADMIN_PASSWORD must be at least 10 characters.");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await prisma.admin.findUnique({ where: { email } });

  await prisma.admin.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash, name: "Admin" },
  });

  console.log(
    existing
      ? `Admin password updated for ${email}`
      : `Admin account created for ${email}`
  );
}

main()
  .catch((err) => {
    console.error(`\nAdmin bootstrap failed: ${err instanceof Error ? err.message : err}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
