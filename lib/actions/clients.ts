"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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
