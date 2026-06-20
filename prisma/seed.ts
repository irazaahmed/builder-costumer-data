import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/password";
import { getUploadUrl, buildDocumentKey } from "../lib/storage";
import {
  Role,
  UserStatus,
  DocumentCategory,
} from "../lib/generated/prisma/client";

const TOTAL_PLOTS = 360;
const DUMMY_CLIENT_COUNT = 25;
const CLIENTS_WITH_DOCUMENTS = 8;
const PENDING_SIGNUP_COUNT = 5;

const BLOCKS = ["A", "B", "C", "D"];
const SIZES = ["120 sq yd", "150 sq yd", "200 sq yd", "240 sq yd"];
const CATEGORIES = [
  DocumentCategory.LEGAL,
  DocumentCategory.PAYMENT,
  DocumentCategory.ALLOTMENT,
  DocumentCategory.CNIC,
  DocumentCategory.OTHER,
];

// The smallest commonly-recognized valid PDF structure (no xref table
// needed) — good enough as a placeholder so view/download works end to end.
const PLACEHOLDER_PDF = Buffer.from(
  `%PDF-1.0
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 300 150]>>endobj
trailer<</Root 1 0 R>>`,
  "utf-8"
);

async function uploadPlaceholderPdf(
  clientId: string,
  category: DocumentCategory,
  fileName: string
) {
  const key = buildDocumentKey(clientId, category, fileName);
  const { url } = await getUploadUrl({ key, contentType: "application/pdf" });
  const res = await fetch(url, {
    method: "PUT",
    body: PLACEHOLDER_PDF,
    headers: { "Content-Type": "application/pdf" },
  });
  if (!res.ok) {
    throw new Error(`Placeholder PDF upload failed (${res.status}) for key ${key}`);
  }
  return { key, size: PLACEHOLDER_PDF.byteLength };
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
  console.log(`Seeding ${TOTAL_PLOTS} plots...`);
  const plotData = Array.from({ length: TOTAL_PLOTS }, (_, i) => ({
    plotNumber: `P-${String(i + 1).padStart(3, "0")}`,
    size: SIZES[i % SIZES.length],
    block: BLOCKS[i % BLOCKS.length],
    status: "SOLD",
  }));
  await prisma.plot.createMany({ data: plotData, skipDuplicates: true });
  return prisma.plot.findMany({ orderBy: { plotNumber: "asc" } });
}

async function seedDummyClients(plots: { id: string; plotNumber: string }[]) {
  console.log(`Seeding ${DUMMY_CLIENT_COUNT} ACTIVE dummy clients...`);
  const password = await hashPassword("Client123!");

  for (let i = 0; i < DUMMY_CLIENT_COUNT; i++) {
    const plot = plots[i];
    const email = `client${i + 1}@example.com`;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) continue;

    const fullName = `Dummy Client ${i + 1}`;
    const cnic = `42101-${String(1000000 + i)}-1`;
    const phone = `0300-${1000000 + i}`;

    const user = await prisma.user.create({
      data: {
        name: fullName,
        email,
        password,
        phone,
        role: Role.CLIENT,
        status: UserStatus.ACTIVE,
        claimedCnic: cnic,
        claimedPlotNumber: plot.plotNumber,
      },
    });

    const client = await prisma.client.create({
      data: {
        userId: user.id,
        fullName,
        cnic,
        phone,
        plotId: plot.id,
        linkedBy: "seed-script",
      },
    });

    if (i < CLIENTS_WITH_DOCUMENTS) {
      const docCount = 3 + (i % 4); // 3 to 6 documents
      for (let d = 0; d < docCount; d++) {
        const category = CATEGORIES[d % CATEGORIES.length];
        const title = `${category} Document ${d + 1}`;
        const fileName = `${category.toLowerCase()}-${d + 1}.pdf`;
        const { key, size } = await uploadPlaceholderPdf(client.id, category, fileName);

        await prisma.document.create({
          data: {
            clientId: client.id,
            uploadedBy: "seed-script",
            title,
            category,
            fileKey: key,
            fileName,
            fileSize: size,
            mimeType: "application/pdf",
          },
        });
      }
      console.log(`  uploaded ${docCount} documents for ${fullName}`);
    }
  }
}

async function seedPendingSignups(plots: { plotNumber: string }[]) {
  console.log(`Seeding ${PENDING_SIGNUP_COUNT} PENDING (unlinked) signups...`);
  const password = await hashPassword("Client123!");

  for (let i = 0; i < PENDING_SIGNUP_COUNT; i++) {
    const plot = plots[DUMMY_CLIENT_COUNT + i];
    const email = `pending${i + 1}@example.com`;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) continue;

    await prisma.user.create({
      data: {
        name: `Pending Signup ${i + 1}`,
        email,
        password,
        phone: `0300-${2000000 + i}`,
        role: Role.CLIENT,
        status: UserStatus.PENDING,
        claimedCnic: `42101-${String(2000000 + i)}-1`,
        claimedPlotNumber: plot.plotNumber,
      },
    });
  }
}

async function main() {
  await seedAdmin();
  const plots = await seedPlots();
  await seedDummyClients(plots);
  await seedPendingSignups(plots);
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
