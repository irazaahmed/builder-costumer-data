"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, signIn, signOut } from "@/auth";
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
    phone: z.string().trim().optional(),
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
    phone: formData.get("phone") || undefined,
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

export interface PasswordActionState {
  error?: string;
  success?: boolean;
}

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirmation do not match.",
    path: ["confirmPassword"],
  });

/**
 * Lets the logged-in user change their own password. The account is always
 * derived from the session (never from input), so a caller can only ever
 * change their own password. The current password must be verified first.
 */
export async function changePasswordAction(
  _prevState: PasswordActionState | undefined,
  formData: FormData
): Promise<PasswordActionState> {
  // 1. Auth check first.
  const session = await auth();
  if (!session?.user) {
    return { error: "Not authenticated." };
  }

  // 2. Validate input.
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { currentPassword, newPassword } = parsed.data;

  if (currentPassword === newPassword) {
    return {
      error: "New password must be different from your current password.",
    };
  }

  // 3. Business logic — scope strictly to the session user's own id.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) {
    return { error: "Account not found." };
  }

  const valid = await verifyPassword(currentPassword, user.password);
  if (!valid) {
    return { error: "Your current password is incorrect." };
  }

  const hashed = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  });

  return { success: true };
}
