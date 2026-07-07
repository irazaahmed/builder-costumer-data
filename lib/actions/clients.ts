"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { deleteFile } from "@/lib/storage";
import { Prisma } from "@/lib/generated/prisma/client";

export interface ClientActionState {
  error?: string;
  success?: boolean;
}

const linkClientSchema = z.object({
  userId: z.string().min(1),
  plotId: z.string().min(1),
});

export async function linkClientAction(
  _prevState: ClientActionState | undefined,
  formData: FormData
): Promise<ClientActionState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Not authorized." };
  }

  const parsed = linkClientSchema.safeParse({
    userId: formData.get("userId"),
    plotId: formData.get("plotId"),
  });
  if (!parsed.success) {
    return { error: "Please select a plot." };
  }

  const { userId, plotId } = parsed.data;

  const [user, plot] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.plot.findUnique({ where: { id: plotId }, include: { client: true } }),
  ]);

  if (!user || user.role !== "CLIENT" || user.status !== "PENDING") {
    return { error: "This user is not a pending signup." };
  }
  if (!plot) {
    return { error: "Plot not found." };
  }
  if (plot.status === "CANCELLED") {
    return { error: "This plot is cancelled and cannot be linked." };
  }
  if (plot.client) {
    return { error: "This plot is already linked to another client." };
  }

  await prisma.$transaction([
    prisma.client.create({
      data: {
        userId: user.id,
        fullName: user.name,
        cnic: user.claimedCnic,
        phone: user.phone,
        plotId: plot.id,
        linkedBy: session.user.id,
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { status: "ACTIVE" },
    }),
  ]);

  revalidatePath("/admin/pending");
  revalidatePath("/admin/clients");
  revalidatePath("/admin/plots");
  revalidatePath("/admin/dashboard");

  return { success: true };
}

const updateClientSchema = z.object({
  clientId: z.string().min(1),
  fullName: z.string().trim().min(2, "Name must be at least 2 characters."),
  fatherName: z.string().trim().optional(),
  cnic: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  membershipDate: z.coerce.date().optional(),
});

export async function updateClientAction(
  _prevState: ClientActionState | undefined,
  formData: FormData
): Promise<ClientActionState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Not authorized." };
  }

  const parsed = updateClientSchema.safeParse({
    clientId: formData.get("clientId"),
    fullName: formData.get("fullName"),
    fatherName: formData.get("fatherName") || undefined,
    cnic: formData.get("cnic") || undefined,
    phone: formData.get("phone") || undefined,
    address: formData.get("address") || undefined,
    membershipDate: formData.get("membershipDate") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { clientId, ...data } = parsed.data;

  try {
    await prisma.client.update({
      where: { id: clientId },
      data,
    });
  } catch {
    return { error: "Client not found." };
  }

  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/admin/clients");

  return { success: true };
}

const createClientSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters."),
  fatherName: z.string().trim().optional(),
  email: z.string().trim().email("Please enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  phone: z.string().trim().optional(),
  cnic: z.string().trim().optional(),
  address: z.string().trim().optional(),
  membershipDate: z.coerce.date().optional(),
  plotId: z.string().min(1, "Please select a plot."),
});

/**
 * Admin-only. Creates a login (User + Client) directly, skipping the
 * self-signup/PENDING step entirely — the admin already knows who this
 * client is and is the one setting their initial password, so the account
 * goes straight to ACTIVE.
 */
export async function createClientAction(
  _prevState: ClientActionState | undefined,
  formData: FormData
): Promise<ClientActionState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Not authorized." };
  }

  const parsed = createClientSchema.safeParse({
    fullName: formData.get("fullName"),
    fatherName: formData.get("fatherName") || undefined,
    email: formData.get("email"),
    password: formData.get("password"),
    phone: formData.get("phone") || undefined,
    cnic: formData.get("cnic") || undefined,
    address: formData.get("address") || undefined,
    membershipDate: formData.get("membershipDate") || undefined,
    plotId: formData.get("plotId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { fullName, fatherName, email, password, phone, cnic, address, membershipDate, plotId } =
    parsed.data;

  const [existingUser, plot] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.plot.findUnique({ where: { id: plotId }, include: { client: true } }),
  ]);

  if (existingUser) {
    return { error: "An account with this email already exists." };
  }
  if (!plot) {
    return { error: "Plot not found." };
  }
  if (plot.status === "CANCELLED") {
    return { error: "This plot is cancelled and cannot be linked." };
  }
  if (plot.client) {
    return { error: "This plot is already linked to another client." };
  }

  const hashedPassword = await hashPassword(password);

  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: fullName,
          email,
          password: hashedPassword,
          phone,
          role: "CLIENT",
          status: "ACTIVE",
        },
      });
      await tx.client.create({
        data: {
          userId: user.id,
          fullName,
          fatherName,
          cnic,
          phone,
          address,
          membershipDate,
          plotId: plot.id,
          linkedBy: session.user.id,
        },
      });
    });
  } catch (err) {
    // The existence/plot-linked checks above are read-then-act, so a second
    // admin submitting at the same instant can still lose the race to the
    // unique constraints on User.email / Client.plotId — give them an
    // accurate reason instead of a generic failure.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "That email or plot was just taken. Please try again." };
    }
    return { error: "Failed to create client. Please try again." };
  }

  revalidatePath("/admin/clients");
  revalidatePath("/admin/plots");
  revalidatePath("/admin/dashboard");

  return { success: true };
}

const deleteClientSchema = z.object({
  clientId: z.string().min(1),
  // The admin must retype the exact plot number — enforced again here on the
  // server, not just in the dialog UI, so a client can never be deleted by an
  // accidental or forged call that skips the typed confirmation.
  confirmation: z.string().min(1),
});

/**
 * Admin-only, deliberately strict. Permanently deletes a client: their
 * uploaded documents (rows AND the underlying Cloudinary files), their
 * Client record, and their User login. The linked Plot is left intact and
 * simply freed (plotId is unique on Client), so it can be re-assigned later.
 * Requires the admin to retype the client's plot number as confirmation.
 */
export async function deleteClientAction(
  _prevState: ClientActionState | undefined,
  formData: FormData
): Promise<ClientActionState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Not authorized." };
  }

  const parsed = deleteClientSchema.safeParse({
    clientId: formData.get("clientId"),
    confirmation: formData.get("confirmation"),
  });
  if (!parsed.success) {
    return { error: "Invalid input." };
  }

  const { clientId, confirmation } = parsed.data;

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: { plot: true, documents: true },
  });
  if (!client) {
    return { error: "Client not found." };
  }

  if (
    confirmation.trim().toUpperCase() !== client.plot.plotNumber.toUpperCase()
  ) {
    return {
      error: `Confirmation does not match. Type the plot number (${client.plot.plotNumber}) exactly to delete.`,
    };
  }

  // Delete the DB rows first, in one transaction, so the client is never left
  // half-deleted (documents → client → the user login). The Plot row is left
  // untouched and simply unlinked.
  try {
    await prisma.$transaction([
      prisma.document.deleteMany({ where: { clientId: client.id } }),
      prisma.client.delete({ where: { id: client.id } }),
      prisma.user.delete({ where: { id: client.userId } }),
    ]);
  } catch {
    return { error: "Failed to delete client. Please try again." };
  }

  // Rows are gone; now remove the underlying Cloudinary objects. A failure
  // here only leaves a harmless orphaned file, never a dangling DB reference —
  // same tradeoff as deleteDocumentAction.
  await Promise.all(
    client.documents.map((doc) => deleteFile(doc.fileKey).catch(() => {}))
  );

  revalidatePath("/admin/clients");
  revalidatePath("/admin/plots");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/pending");

  return { success: true };
}
