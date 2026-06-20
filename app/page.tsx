import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { branding } from "@/lib/branding";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <Image src={branding.logoPath} alt={branding.siteName} width={200} height={40} />
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">{branding.siteName}</h1>
        <p className="max-w-md text-muted-foreground">{branding.tagline}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/login" className={buttonVariants({ size: "lg" })}>
          Client Login
        </Link>
        <Link href="/signup" className={buttonVariants({ size: "lg", variant: "outline" })}>
          Sign Up
        </Link>
      </div>
    </main>
  );
}
