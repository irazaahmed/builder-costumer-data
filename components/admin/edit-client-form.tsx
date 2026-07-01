"use client";

import { useActionState } from "react";
import { updateClientAction, type ClientActionState } from "@/lib/actions/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ClientActionState = {};

export function EditClientForm({
  clientId,
  fullName,
  fatherName,
  cnic,
  phone,
  address,
  membershipDate,
}: {
  clientId: string;
  fullName: string;
  fatherName: string | null;
  cnic: string | null;
  phone: string | null;
  address: string | null;
  // ISO date (YYYY-MM-DD) for the native date input, or null.
  membershipDate: string | null;
}) {
  const [state, action, pending] = useActionState(updateClientAction, initialState);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="clientId" value={clientId} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" name="fullName" defaultValue={fullName} required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="fatherName">Father&apos;s name (optional)</Label>
        <Input id="fatherName" name="fatherName" defaultValue={fatherName ?? ""} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="cnic">CNIC</Label>
        <Input id="cnic" name="cnic" defaultValue={cnic ?? ""} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" defaultValue={phone ?? ""} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="membershipDate">Date of membership</Label>
        <Input
          id="membershipDate"
          name="membershipDate"
          type="date"
          defaultValue={membershipDate ?? ""}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="address" defaultValue={address ?? ""} />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.success && <p className="text-sm text-muted-foreground">Saved.</p>}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
