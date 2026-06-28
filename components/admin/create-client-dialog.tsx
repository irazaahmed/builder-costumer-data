"use client";

import { useActionState, useState } from "react";
import { createClientAction, type ClientActionState } from "@/lib/actions/clients";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface AvailablePlot {
  id: string;
  plotNumber: string;
}

const initialState: ClientActionState = {};

export function CreateClientDialog({ availablePlots }: { availablePlots: AvailablePlot[] }) {
  const [open, setOpen] = useState(false);
  // useActionState's state survives this component staying mounted across
  // close/reopen (the Dialog hides its content rather than unmounting it),
  // so a stale "success" from the last create would otherwise reappear the
  // next time the dialog opens. Bumping this key forces a fresh
  // CreateClientForm instance — and a fresh useActionState — on every open.
  const [instanceKey, setInstanceKey] = useState(0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        onClick={() => {
          setInstanceKey((k) => k + 1);
          setOpen(true);
        }}
      >
        Create new client
      </Button>
      <CreateClientForm
        key={instanceKey}
        availablePlots={availablePlots}
        onDone={() => setOpen(false)}
      />
    </Dialog>
  );
}

function CreateClientForm({
  availablePlots,
  onDone,
}: {
  availablePlots: AvailablePlot[];
  onDone: () => void;
}) {
  const [state, action, pending] = useActionState(createClientAction, initialState);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [cnic, setCnic] = useState("");
  const [address, setAddress] = useState("");
  const [membershipDate, setMembershipDate] = useState("");
  const [plotId, setPlotId] = useState("");

  const created = state?.success === true;

  return (
    <DialogContent>
      {created ? (
        <>
          <DialogHeader>
            <DialogTitle>Client created</DialogTitle>
            <DialogDescription>
              Share these login details with the client yourself — there&apos;s no
              email/SMS in this app yet.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 rounded-lg bg-muted p-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Email</span>
              <span className="text-sm font-medium">{email}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Password</span>
              <span className="text-sm font-medium">{password}</span>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={onDone}>Done</Button>
          </DialogFooter>
        </>
      ) : (
        <>
          <DialogHeader>
            <DialogTitle>Create new client</DialogTitle>
            <DialogDescription>
              This creates an active login right away — no signup or verification
              step. You are vouching for this person and setting their initial
              password yourself.
            </DialogDescription>
          </DialogHeader>
          <form action={action} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                name="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="off"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
                autoComplete="new-password"
              />
              <p className="text-xs text-muted-foreground">
                You&apos;ll need to share this with the client yourself — there&apos;s
                no email/SMS in this app yet.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cnic">CNIC (optional)</Label>
              <Input
                id="cnic"
                name="cnic"
                placeholder="42101-1234567-1"
                value={cnic}
                onChange={(e) => setCnic(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="membershipDate">Date of membership (optional)</Label>
              <Input
                id="membershipDate"
                name="membershipDate"
                type="date"
                value={membershipDate}
                onChange={(e) => setMembershipDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="address">Address (optional)</Label>
              <Input
                id="address"
                name="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="plotId">Plot</Label>
              <Select
                name="plotId"
                value={plotId}
                onValueChange={(value) => setPlotId(value ?? "")}
              >
                <SelectTrigger id="plotId" className="w-full">
                  <SelectValue placeholder="Select a plot">
                    {(value: string | null) =>
                      availablePlots.find((p) => p.id === value)?.plotNumber ??
                      "Select a plot"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {availablePlots.map((plot) => (
                    <SelectItem key={plot.id} value={plot.id}>
                      {plot.plotNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? "Creating..." : "Create client"}
              </Button>
            </DialogFooter>
          </form>
        </>
      )}
    </DialogContent>
  );
}
