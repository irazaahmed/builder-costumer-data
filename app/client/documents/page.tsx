import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatFileSize } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { DocumentActions } from "@/components/client/document-actions";
import { CategoryBadge } from "@/components/category-badge";

const CATEGORIES = [
  { value: "LEGAL", label: "Legal" },
  { value: "PAYMENT", label: "Payment" },
  { value: "ALLOTMENT", label: "Allotment" },
  { value: "CNIC", label: "CNIC" },
  { value: "OTHER", label: "Other" },
] as const;

type CategoryValue = (typeof CATEGORIES)[number]["value"];

function isValidCategory(value: string | undefined): value is CategoryValue {
  return CATEGORIES.some((c) => c.value === value);
}

export default async function ClientDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CLIENT") {
    redirect("/login");
  }

  // Middleware already filters non-ACTIVE clients out of /client/*, but this
  // page must not trust that alone — it queries documents by clientId below,
  // so it independently re-checks status and clientId presence first.
  if (session.user.status !== "ACTIVE" || !session.user.clientId) {
    redirect("/client/dashboard");
  }

  const { category } = await searchParams;
  const activeCategory = isValidCategory(category) ? category : undefined;

  const documents = await prisma.document.findMany({
    where: {
      clientId: session.user.clientId,
      ...(activeCategory ? { category: activeCategory } : {}),
    },
    orderBy: { uploadedAt: "desc" },
  });

  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Your Documents</h1>
        <p className="text-sm text-muted-foreground">
          View or download your documents. Links expire shortly after they are
          generated.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/client/documents"
          className={buttonVariants({
            variant: activeCategory === undefined ? "default" : "outline",
            size: "sm",
          })}
        >
          All
        </Link>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.value}
            href={`/client/documents?category=${cat.value}`}
            className={buttonVariants({
              variant: activeCategory === cat.value ? "default" : "outline",
              size: "sm",
            })}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {activeCategory
              ? CATEGORIES.find((c) => c.value === activeCategory)?.label
              : "All"}{" "}
            Documents ({documents.length})
          </CardTitle>
          <CardDescription>
            Documents uploaded by the admin for your plot.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {activeCategory
                ? "No documents in this category yet."
                : "No documents have been uploaded for you yet."}
            </p>
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>{doc.title}</TableCell>
                        <TableCell>
                          <CategoryBadge category={doc.category} />
                        </TableCell>
                        <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                        <TableCell>
                          {doc.uploadedAt.toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DocumentActions documentId={doc.id} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex flex-col gap-3 md:hidden">
                {documents.map((doc) => (
                  <Card key={doc.id} size="sm">
                    <CardContent className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium">{doc.title}</span>
                        <CategoryBadge category={doc.category} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(doc.fileSize)} ·{" "}
                        {doc.uploadedAt.toLocaleDateString()}
                      </p>
                      <div className="flex gap-2">
                        <DocumentActions documentId={doc.id} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
