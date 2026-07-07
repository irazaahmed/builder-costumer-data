"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteClientAction, type ClientActionState } from "@/lib/actions/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const initialState: ClientActionState = {};

interface DeleteClientDialogProps {
  clientId: string;
  clientName: string;
  plotNumber: string;
  documentCount: number;
}

export function DeleteClientDialog(props: DeleteClientDialogProps) {
  const [open, setOpen] = useState(false);
  // Bump this on every open so the inner form (and its useActionState) is a
  // fresh instance — otherwise a stale error/success would linger the next
  // time the dialog is reopened (the Dialog hides content, doesn't unmount).
  const [instanceKey, setInstanceKey] = useState(0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="destructive"
        onClick={() => {
          setInstanceKey((k) => k + 1);
          setOpen(true);
        }}
      >
        Delete client
      </Button>
      <DeleteClientForm key={instanceKey} {...props} />
    </Dialog>
  );
}

function DeleteClientForm({
  clientId,
  clientName,
  plotNumber,
  documentCount,
}: DeleteClientDialogProps) {
  const router = useRouter();
  const [state, action, pending] = useActionState(deleteClientAction, initialState);
  const [confirmation, setConfirmation] = useState("");

  // Client-side gate: the button stays disabled until the typed value matches
  // the plot number exactly. The server re-checks this too (defense in depth).
  const matches =
    confirmation.trim().toUpperCase() === plotNumber.toUpperCase();

  useEffect(() => {
    if (state?.success) {
      // The client's own page no longer exists — send the admin back to the list.
      router.push("/admin/clients");
      router.refresh();
    }
  }, [state?.success, router]);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete this client?</DialogTitle>
        <DialogDescription>
          This permanently deletes <strong>{clientName}</strong> (plot{" "}
          {plotNumber}), their login, and all {documentCount}{" "}
          {documentCount === 1 ? "document" : "documents"} they have — including
          the files in storage. Plot {plotNumber} will be freed and can be
          re-assigned later. This cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="clientId" value={clientId} />
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmation">
            Type the plot number{" "}
            <span className="font-semibold text-foreground">{plotNumber}</span>{" "}
            to confirm
          </Label>
          <Input
            id="confirmation"
            name="confirmation"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder={plotNumber}
            autoComplete="off"
            autoCapitalize="characters"
          />
        </div>
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
        <DialogFooter>
          <Button
            type="submit"
            variant="destructive"
            disabled={pending || !matches}
          >
            {pending ? "Deleting..." : "Delete client permanently"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
