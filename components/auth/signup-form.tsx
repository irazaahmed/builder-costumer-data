"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction, type AuthActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

const initialState: AuthActionState = {};

export function SignupForm() {
  const [state, action, pending] = useActionState(signupAction, initialState);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Client Sign Up</CardTitle>
        <CardDescription>
          Create an account, then the admin will verify and link you to your
          plot before you can see your documents.
        </CardDescription>
      </CardHeader>
      <form action={action}>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" required autoComplete="name" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" required autoComplete="tel" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="claimedCnic">CNIC</Label>
            <Input id="claimedCnic" name="claimedCnic" placeholder="42101-1234567-1" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="claimedPlotNumber">Plot number</Label>
            <Input id="claimedPlotNumber" name="claimedPlotNumber" placeholder="P-001" />
          </div>
          <p className="text-xs text-muted-foreground">
            Provide your CNIC and/or plot number so the admin can verify and
            link your account.
          </p>
          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-3 border-t-0 bg-transparent">
          <Button type="submit" disabled={pending}>
            {pending ? "Creating account..." : "Sign Up"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
