import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { FolderOpen, Images, Video } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getGallerySecureUrl } from "@/lib/storage";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateGalleryFolderDialog } from "@/components/admin/create-gallery-folder-dialog";

export default async function AdminGalleryPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const folders = await prisma.galleryFolder.findMany({
    include: {
      items: { take: 1, orderBy: { sortIndex: "asc" } },
      _count: { select: { items: true } },
    },
    orderBy: { sortIndex: "asc" },
  });

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-6">
      <PageHeader
        icon={Images}
        title="Gallery"
        description={`${folders.length} folder${folders.length === 1 ? "" : "s"} on the public homepage gallery.`}
        action={<CreateGalleryFolderDialog />}
      />

      {folders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <FolderOpen className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No gallery folders yet. Create one to start uploading photos and
              videos.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {folders.map((folder) => {
            const cover = folder.items[0];
            return (
              <Link
                key={folder.id}
                href={`/admin/gallery/${folder.id}`}
                className="group flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-video w-full bg-muted">
                  {cover && cover.type === "IMAGE" ? (
                    <Image
                      src={getGallerySecureUrl(cover.fileKey, "image", cover.format)}
                      alt={folder.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Video className="size-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1.5 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="truncate font-heading text-base font-medium">
                      {folder.title}
                    </h2>
                    <Badge variant="outline" className="shrink-0">
                      {folder._count.items}{" "}
                      {folder._count.items === 1 ? "item" : "items"}
                    </Badge>
                  </div>
                  {folder.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {folder.description}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
