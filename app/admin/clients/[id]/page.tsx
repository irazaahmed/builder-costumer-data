import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatFileSize } from "@/lib/format";
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
import { EditClientForm } from "@/components/admin/edit-client-form";
import { UploadDocumentForm } from "@/components/admin/upload-document-form";
import { DeleteDocumentButton } from "@/components/admin/delete-document-button";

export default async function ClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: { plot: true, documents: { orderBy: { uploadedAt: "desc" } } },
  });

  if (!client) {
    notFound();
  }

  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{client.fullName}</h1>
        <p className="text-sm text-muted-foreground">
          Plot {client.plot.plotNumber}
          {client.plot.block ? ` · Block ${client.plot.block}` : ""}
          {client.plot.size ? ` · ${client.plot.size}` : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Edit details</CardTitle>
            <CardDescription>Update this client&apos;s profile information.</CardDescription>
          </CardHeader>
          <CardContent>
            <EditClientForm
              clientId={client.id}
              fullName={client.fullName}
              cnic={client.cnic}
              phone={client.phone}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documents ({client.documents.length})</CardTitle>
            <CardDescription>
              Upload a new document for this client, or remove an existing one.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <UploadDocumentForm clientId={client.id} />
            {client.documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {client.documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>{doc.title}</TableCell>
                      <TableCell>{doc.category}</TableCell>
                      <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                      <TableCell>
                        <DeleteDocumentButton documentId={doc.id} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
