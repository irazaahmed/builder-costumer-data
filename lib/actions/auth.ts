"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(1, "Password is required."),
});

export interface AuthActionState {
  error?: string;
}

export async function loginAction(
  _prevState: AuthActionState | undefined,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (!user || !(await verifyPassword(parsed.data.password, user.password))) {
    return { error: "Invalid email or password." };
  }

  const destination =
    user.role === "ADMIN" ? "/admin/dashboard" : "/client/dashboard";

  try {
    // Letting signIn perform its own redirect (rather than passing
    // `redirect: false`) is required here — with `redirect: false` the
    // session cookie was not reliably persisted from this Server Action.
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: destination,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw err;
  }

  return {};
}

const signupSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters."),
    email: z.string().trim().email("Please enter a valid email."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    phone: z.string().trim().min(7, "Please enter a valid phone number."),
    claimedCnic: z.string().trim().optional(),
    claimedPlotNumber: z.string().trim().optional(),
  })
  .refine((data) => data.claimedCnic || data.claimedPlotNumber, {
    message: "Provide your CNIC and/or plot number so we can verify you.",
    path: ["claimedCnic"],
  });

export async function signupAction(
  _prevState: AuthActionState | undefined,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    phone: formData.get("phone"),
    claimedCnic: formData.get("claimedCnic") || undefined,
    claimedPlotNumber: formData.get("claimedPlotNumber") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const password = await hashPassword(parsed.data.password);
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password,
      phone: parsed.data.phone,
      role: "CLIENT",
      status: "PENDING",
      claimedCnic: parsed.data.claimedCnic,
      claimedPlotNumber: parsed.data.claimedPlotNumber,
    },
  });

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/client/dashboard",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      // Account was created but auto-login failed for some reason —
      // send them to log in manually instead of failing the signup.
      redirect("/login");
    }
    throw err;
  }

  return {};
}
