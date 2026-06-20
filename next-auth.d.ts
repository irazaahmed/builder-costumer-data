import type { DefaultSession } from "@auth/core/types";
import type { Role, UserStatus } from "@/lib/generated/prisma/client";

// `next-auth` re-exports these types from "@auth/core/types" and
// "@auth/core/jwt" rather than declaring them itself, so the module
// augmentation has to target the original modules to merge correctly.
declare module "@auth/core/types" {
  interface User {
    role: Role;
    status: UserStatus;
    clientId: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      status: UserStatus;
      clientId: string | null;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role: Role;
    status: UserStatus;
    clientId: string | null;
  }
}
