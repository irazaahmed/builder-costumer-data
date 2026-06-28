"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
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
  email: z.string().trim().email("Please enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  phone: z.string().trim().min(7, "Please enter a valid phone number."),
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
    email: formData.get("email"),
    password: formData.get("password"),
    phone: formData.get("phone"),
    cnic: formData.get("cnic") || undefined,
    address: formData.get("address") || undefined,
    membershipDate: formData.get("membershipDate") || undefined,
    plotId: formData.get("plotId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { fullName, email, password, phone, cnic, address, membershipDate, plotId } =
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
