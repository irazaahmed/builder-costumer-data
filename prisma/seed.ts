import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/password";
import { Role, UserStatus } from "../lib/generated/prisma/client";

const TOTAL_PLOTS = 360;
const BLOCKS = ["A", "B", "C", "D"];
const SIZES = ["120 sq yd", "150 sq yd", "200 sq yd", "240 sq yd"];

async function seedAdmin() {
  console.log("Seeding admin user...");
  const password = await hashPassword("Admin123!");
  await prisma.user.upsert({
    where: { email: "admin@portal.com" },
    update: {},
    create: {
      name: "Portal Admin",
      email: "admin@portal.com",
      password,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });
}

async function seedPlots() {
  console.log(`Seeding ${TOTAL_PLOTS} plots...`);
  const plotData = Array.from({ length: TOTAL_PLOTS }, (_, i) => ({
    plotNumber: `P-${String(i + 1).padStart(3, "0")}`,
    size: SIZES[i % SIZES.length],
    block: BLOCKS[i % BLOCKS.length],
    status: "SOLD",
  }));
  await prisma.plot.createMany({ data: plotData, skipDuplicates: true });
}

async function main() {
  await seedAdmin();
  await seedPlots();
  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
