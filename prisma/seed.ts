import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/password";
import { Role, UserStatus } from "../lib/generated/prisma/client";

// Real plot scheme for the Surjani Sector 12 project, taken from the official
// member list: R-01..R-322 (residential) and L-01..L-37. Numbers below 10 are
// written with a leading zero (R-01), matching the source document.
const R_PLOTS = 322;
const L_PLOTS = 37;

// R-248 is recorded as "Cancelled" in the member list — it exists as a plot but
// is not sold/linked to anyone.
const CANCELLED_PLOTS = new Set(["R-248"]);

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function buildPlots() {
  const numbers: string[] = [];
  for (let i = 1; i <= R_PLOTS; i++) numbers.push(`R-${pad(i)}`);
  for (let i = 1; i <= L_PLOTS; i++) numbers.push(`L-${pad(i)}`);
  // sortIndex preserves the exact order of the official member list
  // (R-01..R-322 then L-01..L-37) so the app displays plots in that order
  // rather than lexicographically by plotNumber.
  return numbers.map((plotNumber, i) => ({
    plotNumber,
    status: CANCELLED_PLOTS.has(plotNumber) ? "CANCELLED" : "SOLD",
    sortIndex: i + 1,
  }));
}

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
  const plotData = buildPlots();
  console.log(`Seeding ${plotData.length} plots...`);

  // Clear out any unlinked plots from an earlier scheme (e.g. the old
  // P-001..P-360 placeholders) so re-running doesn't leave stale numbers.
  // Plots already linked to a real client are left untouched.
  await prisma.plot.deleteMany({ where: { client: null } });

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
