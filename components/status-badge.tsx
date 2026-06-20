import { Badge } from "@/components/ui/badge";
import type { UserStatus } from "@/lib/generated/prisma/client";

const VARIANT_BY_STATUS: Record<UserStatus, "outline" | "default" | "destructive"> = {
  PENDING: "outline",
  ACTIVE: "default",
  BLOCKED: "destructive",
};

export function StatusBadge({ status }: { status: UserStatus }) {
  return <Badge variant={VARIANT_BY_STATUS[status]}>{status}</Badge>;
}
