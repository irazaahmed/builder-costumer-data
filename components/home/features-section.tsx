"use client";

import { motion } from "motion/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

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

export default function FeaturesSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className="px-6 py-16"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="flex flex-col gap-2 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Why Choose Us</h2>
          <p className="text-muted-foreground">
            Built around one priority: keeping your documents safe and easy to
            reach.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
