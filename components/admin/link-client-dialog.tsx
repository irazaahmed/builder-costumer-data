"use client";

import { useActionState, useState } from "react";
import { linkClientAction, type ClientActionState } from "@/lib/actions/clients";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface PendingUser {
  id: string;
  name: string;
  email: string;
  claimedCnic: string | null;
  claimedPlotNumber: string | null;
}

interface AvailablePlot {
  id: string;
  plotNumber: string;
}

const initialState: ClientActionState = {};

export function LinkClientDialog({
  user,
  availablePlots,
}: {
  user: PendingUser;
  availablePlots: AvailablePlot[];
}) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(linkClientAction, initialState);

  const claimedMatch = availablePlots.find((p) => p.plotNumber === user.claimedPlotNumber);

  // On success, revalidatePath in the action removes this user from the
  // PENDING list server-side, which unmounts this row (and dialog) entirely
  // — no manual close needed.

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" onClick={() => setOpen(true)}>
        Link to plot
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link {user.name} to a plot</DialogTitle>
          <DialogDescription>
            Claimed CNIC: {user.claimedCnic ?? "—"} · Claimed plot:{" "}
            {user.claimedPlotNumber ?? "—"}
          </DialogDescription>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4">
          <input type="hidden" name="userId" value={user.id} />
          <Select name="plotId" defaultValue={claimedMatch?.id}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a plot">
                {(value: string | null) =>
                  availablePlots.find((p) => p.id === value)?.plotNumber ?? "Select a plot"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {availablePlots.map((plot) => (
                <SelectItem key={plot.id} value={plot.id}>
                  {plot.plotNumber}
                  {plot.id === claimedMatch?.id ? " (claimed)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Linking..." : "Confirm link"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
