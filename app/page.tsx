import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { branding } from "@/lib/branding";

const features = [
  {
    title: "Secure Document Vault",
    description:
      "Every legal and ownership document is stored privately and is only ever accessed through short-lived, signed links.",
  },
  {
    title: "Verified Ownership Records",
    description:
      "Each client account is manually verified and linked to the correct plot by the admin team before any document is visible.",
  },
  {
    title: "Dedicated Support",
    description:
      "Our team is available to help clients with account access, verification, and any questions about their documents.",
  },
  {
    title: "Transparent Process",
    description:
      "Clients can view and download their own records any time, with a clear record of what has been uploaded and when.",
  },
];

export default function Home() {
  return (
    <>
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <Image src={branding.logoPath} alt={branding.siteName} width={36} height={36} />
          <span className="font-semibold tracking-tight">{branding.siteName}</span>
        </div>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/login" className="text-muted-foreground hover:text-foreground">
            Client Login
          </Link>
          <Link href="/signup" className="text-muted-foreground hover:text-foreground">
            Sign Up
          </Link>
        </nav>
      </header>

      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="flex flex-col items-center gap-8 px-6 py-24 text-center">
          <div className="flex max-w-2xl flex-col gap-4">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              {branding.siteName}
            </h1>
            <p className="text-lg text-muted-foreground">{branding.tagline}</p>
            <p className="text-muted-foreground">
              A 17-acre residential plot project in Surjani Sector 12, Karachi, with
              360 fully sold plots. This portal gives every client secure, private
              access to their own ownership and legal documents.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/login" className={buttonVariants({ size: "lg" })}>
              Client Login
            </Link>
            <Link href="/signup" className={buttonVariants({ size: "lg", variant: "outline" })}>
              Sign Up
            </Link>
          </div>
        </section>

        {/* About the Project */}
        <section className="border-t bg-muted/30 px-6 py-16">
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">About the Project</h2>
            <p className="text-muted-foreground">
              Spanning 17 acres in Surjani Sector 12, Karachi, this is a fully
              developed residential plot scheme made up of 360 plots, all of which
              have already been sold to their respective owners.
            </p>
            <p className="text-muted-foreground">
              With every plot allotted, our focus has shifted to giving each owner a
              simple, secure way to access the paperwork tied to their property —
              allotment letters, sale agreements, payment records, and identification
              documents — without relying on physical copies or in-person visits.
            </p>
            <p className="text-muted-foreground">
              This portal was built specifically for that purpose: a private,
              read-only record of each client&apos;s documents, available whenever
              they need it.
            </p>
          </div>
        </section>

        {/* Why Choose Us / Features */}
        <section className="px-6 py-16">
          <div className="mx-auto flex max-w-5xl flex-col gap-8">
            <div className="flex flex-col gap-2 text-center">
              <h2 className="text-2xl font-semibold tracking-tight">Why Choose Us</h2>
              <p className="text-muted-foreground">
                Built around one priority: keeping your documents safe and easy to
                reach.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <Card key={feature.title}>
                  <CardHeader>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="border-t bg-muted/30 px-6 py-16">
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">Location</h2>
            <p className="text-muted-foreground">
              The project is located in Surjani Sector 12, Karachi, occupying a
              17-acre site of fully allotted residential plots.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="px-6 py-16">
          <div className="mx-auto flex max-w-3xl flex-col gap-4 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">Contact</h2>
            <p className="text-muted-foreground">
              Have a question about your account or documents? Reach out to us
              directly.
            </p>
            <div className="flex flex-col gap-1 text-sm">
              <span>
                Email:{" "}
                <a href={`mailto:${branding.contact.email}`} className="text-primary underline">
                  {branding.contact.email}
                </a>
              </span>
              <span>
                Phone:{" "}
                <a href={`tel:${branding.contact.phone}`} className="text-primary underline">
                  {branding.contact.phone}
                </a>
              </span>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 text-center text-sm text-muted-foreground sm:flex-row sm:justify-between">
          <span>
            &copy; {new Date().getFullYear()} {branding.siteName}. All rights reserved.
          </span>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-foreground">
              Client Login
            </Link>
            <Link href="/signup" className="hover:text-foreground">
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
