"use client";

import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { deleteImage, finishImageUpload, reorderImages, requestImageUpload } from "@/lib/admin/actions";
import type { ProductImageRow } from "@/lib/catalog/db";
import { IMAGE_BUCKET, publicImageUrl, supabasePublishableKey, supabaseUrl } from "@/lib/supabase/config";
import { Card, secondaryButton } from "./ui";

const storage = () =>
  createClient(supabaseUrl, supabasePublishableKey, { auth: { persistSession: false } }).storage.from(IMAGE_BUCKET);

/** Draws the image at `width` pixels wide (never upscaled) and encodes it as WebP. */
async function resize(bitmap: ImageBitmap, width: number, quality: number): Promise<Blob> {
  const target = Math.min(width, bitmap.width);
  const height = Math.round((bitmap.height / bitmap.width) * target);
  const canvas = document.createElement("canvas");
  canvas.width = target;
  canvas.height = height;
  const context = canvas.getContext("2d")!;
  context.imageSmoothingQuality = "high";
  // Photos are shot on white; fill first so transparent PNGs also land on white.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, target, height);
  context.drawImage(bitmap, 0, 0, target, height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
  if (!blob) throw new Error("Bu tarayıcı WebP oluşturamıyor. Lütfen güncel Chrome, Edge veya Safari kullanın.");
  return blob;
}

/** A 20px-wide preview, inlined as a data URL and shown blurred while the photo loads. */
function blurPreview(bitmap: ImageBitmap): string {
  const canvas = document.createElement("canvas");
  canvas.width = 20;
  canvas.height = Math.max(1, Math.round((bitmap.height / bitmap.width) * 20));
  const context = canvas.getContext("2d")!;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/webp", 0.5);
}

type Status = { name: string; state: "working" | "done" | "error"; message?: string };

export function ImageManager({ productId, images }: { productId: string; images: ProductImageRow[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [dragging, setDragging] = useState(false);
  const [busy, startTransition] = useTransition();

  function setStatus(name: string, state: Status["state"], message?: string) {
    setStatuses((list) => {
      const next = list.filter((item) => item.name !== name);
      return [...next, { name, state, message }];
    });
  }

  async function uploadOne(file: File) {
    setStatus(file.name, "working");
    try {
      if (!file.type.startsWith("image/")) throw new Error("Görsel dosyası değil.");
      const bitmap = await createImageBitmap(file);
      const ticket = await requestImageUpload(productId);
      for (const upload of ticket.uploads) {
        const blob = await resize(bitmap, upload.width, upload.width <= 640 ? 0.8 : 0.86);
        const { error } = await storage().uploadToSignedUrl(upload.path, upload.token, blob, {
          contentType: "image/webp",
        });
        if (error) throw new Error(error.message);
      }
      await finishImageUpload({
        productId,
        pathPrefix: ticket.pathPrefix,
        width: bitmap.width,
        height: bitmap.height,
        blurDataURL: blurPreview(bitmap),
      });
      bitmap.close();
      setStatus(file.name, "done");
    } catch (error) {
      setStatus(file.name, "error", error instanceof Error ? error.message : "Yüklenemedi.");
    }
  }

  async function uploadAll(files: FileList | File[]) {
    const list = Array.from(files);
    if (!list.length) return;
    // Two at a time: fast, without saturating a phone connection.
    const queue = [...list];
    await Promise.all(
      [0, 1].map(async () => {
        for (let file = queue.shift(); file; file = queue.shift()) await uploadOne(file);
      }),
    );
    router.refresh();
  }

  function move(index: number, delta: number) {
    const ids = images.map((image) => image.id);
    const [moved] = ids.splice(index, 1);
    ids.splice(index + delta, 0, moved);
    startTransition(async () => {
      await reorderImages(productId, ids);
      router.refresh();
    });
  }

  function remove(id: string) {
    if (!window.confirm("Bu fotoğraf silinsin mi? Bu işlem geri alınamaz.")) return;
    startTransition(async () => {
      await deleteImage(id);
      router.refresh();
    });
  }

  const working = statuses.some((status) => status.state === "working");

  return (
    <Card title={`Fotoğraflar (${images.length})`}>
      <p className="mb-4 text-sm leading-relaxed text-steel">
        Beyaz fonda, dikey 4:5 çekilmiş fotoğraflar en iyi sonucu verir. İlk fotoğraf kartlarda görünür. Her fotoğraf
        otomatik olarak üç boyutta (640, 1200, 2000 px) kaydedilir.
      </p>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void uploadAll(event.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dragging ? "border-ink bg-fog-deep" : "border-hairline"
        }`}
      >
        <p className="text-[15px] text-ink">Fotoğrafları buraya sürükleyin</p>
        <p className="text-xs text-steel">ya da</p>
        <button type="button" onClick={() => inputRef.current?.click()} disabled={working} className={secondaryButton}>
          Dosya seç
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          aria-label="Fotoğraf seç"
          onChange={(event) => {
            if (event.target.files) void uploadAll(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {statuses.length > 0 && (
        <ul aria-live="polite" className="mt-4 flex flex-col gap-1 text-sm">
          {statuses.map((status) => (
            <li key={status.name} className="flex justify-between gap-3">
              <span className="truncate text-ink">{status.name}</span>
              <span
                className={
                  status.state === "error" ? "text-red-800" : status.state === "done" ? "text-emerald-800" : "text-steel"
                }
              >
                {status.state === "working" ? "Yükleniyor…" : status.state === "done" ? "Yüklendi" : status.message}
              </span>
            </li>
          ))}
        </ul>
      )}

      {images.length > 0 && (
        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {images.map((image, index) => (
            <li key={image.id} className="flex flex-col gap-2">
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-hairline bg-tile">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={publicImageUrl(`${image.path_prefix}/640.webp`)}
                  alt={`Fotoğraf ${index + 1}`}
                  className="absolute inset-0 size-full object-contain"
                />
                {index === 0 && (
                  <span className="absolute top-2 left-2 rounded-full bg-ink px-2 py-0.5 text-[11px] text-tile">Kapak</span>
                )}
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={busy || index === 0}
                    aria-label="Sola taşı"
                    className="flex size-9 items-center justify-center rounded-full border border-hairline disabled:opacity-30"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={busy || index === images.length - 1}
                    aria-label="Sağa taşı"
                    className="flex size-9 items-center justify-center rounded-full border border-hairline disabled:opacity-30"
                  >
                    →
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remove(image.id)}
                  disabled={busy}
                  className="min-h-9 text-red-800 hover:underline disabled:opacity-30"
                >
                  Sil
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
