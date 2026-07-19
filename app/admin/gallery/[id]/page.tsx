import Link from "next/link";
import Image from "next/image";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Images, PlayCircle } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getGallerySecureUrl } from "@/lib/storage";
import { formatFileSize } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { UploadGalleryForm } from "@/components/admin/upload-gallery-form";
import { DeleteGalleryItemButton } from "@/components/admin/delete-gallery-item-button";
import { DeleteGalleryFolderDialog } from "@/components/admin/delete-gallery-folder-dialog";

export default async function AdminGalleryFolderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const { id } = await params;
  const folder = await prisma.galleryFolder.findUnique({
    where: { id },
    include: { items: { orderBy: { sortIndex: "asc" } } },
  });

  if (!folder) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/admin/gallery"
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to gallery
        </Link>
        <PageHeader
          icon={Images}
          title={folder.title}
          description={
            folder.description ??
            `${folder.items.length} item${folder.items.length === 1 ? "" : "s"} in this folder.`
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload photos or videos</CardTitle>
          <CardDescription>
            Drop multiple files at once. Images up to 25 MB, videos up to 200
            MB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UploadGalleryForm folderId={folder.id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items ({folder.items.length})</CardTitle>
          <CardDescription>
            Remove any photo or video from this folder.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {folder.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No items uploaded yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {folder.items.map((item) => (
                <div
                  key={item.id}
                  className="group relative aspect-square overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/10"
                >
                  {item.type === "IMAGE" ? (
                    <Image
                      src={getGallerySecureUrl(item.fileKey, "image", item.format)}
                      alt={item.fileName}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    />
                  ) : (
                    <>
                      <video
                        src={getGallerySecureUrl(item.fileKey, "video", item.format)}
                        className="size-full object-cover"
                        muted
                        preload="metadata"
                        playsInline
                      />
                      <div className="absolute inset-0 bg-black/20" />
                      <PlayCircle className="absolute inset-0 m-auto size-8 text-white drop-shadow" />
                    </>
                  )}
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                    <span className="truncate text-xs text-white">
                      {formatFileSize(item.fileSize)}
                    </span>
                  </div>
                  <DeleteGalleryItemButton itemId={item.id} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>
            Permanently delete this folder and all {folder.items.length}{" "}
            {folder.items.length === 1 ? "item" : "items"} inside it (files
            included). This cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteGalleryFolderDialog
            folderId={folder.id}
            folderTitle={folder.title}
            itemCount={folder.items.length}
          />
        </CardContent>
      </Card>
    </main>
  );
}
