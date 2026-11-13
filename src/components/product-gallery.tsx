"use client";

import Image from "next/image";
import { useState, type MouseEvent } from "react";
import { ZoomIcon } from "@/components/icons";
import { ProductVisual } from "@/components/product-visual";
import type { Product } from "@/lib/catalog";

interface ProductGalleryProps {
  product: Product;
  alt: string;
  pendingLabel: string;
  zoomHint: string;
  /** Template like "Image {n}" for thumbnail labels. */
  thumbLabel: string;
}

/** Main 4:5 photo with hover magnification, plus thumbnails when there is more than one photo. */
export function ProductGallery({ product, alt, pendingLabel, zoomHint, thumbLabel }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const images = product.images;

  function track(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    setZoom({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  }

  const magnified = zoom
    ? { transform: "scale(2.2)", transformOrigin: `${zoom.x}% ${zoom.y}%` }
    : { transform: "scale(1)" };

  return (
    <div className="flex gap-4">
      {images.length > 1 && (
        <div className="flex w-19 shrink-0 flex-col gap-3">
          {images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              onClick={() => setActive(index)}
              aria-label={thumbLabel.replace("{n}", String(index + 1))}
              aria-pressed={index === active}
              className={`tile relative aspect-[4/5] overflow-hidden border ${
                index === active ? "border-antique" : "border-hairline hover:border-ink/40"
              }`}
            >
              <Image src={image.src} alt="" fill sizes="76px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
      <div
        className="relative min-w-0 flex-1 cursor-zoom-in overflow-hidden"
        onMouseMove={track}
        onMouseLeave={() => setZoom(null)}
      >
        <div className="transition-transform duration-300 ease-out" style={magnified}>
          <ProductVisual
            product={{ ...product, images: images.length ? [images[active]] : [] }}
            alt={alt}
            sizes="(min-width: 1024px) 640px, 100vw"
            priority
            morph
            pendingLabel={pendingLabel}
            artClassName="w-[70%]"
          />
        </div>
        <span
          className={`pointer-events-none absolute start-5 bottom-5 hidden items-center gap-2 text-[11px] tracking-[0.14em] text-steel transition-opacity md:flex ${
            zoom ? "opacity-0" : "opacity-100"
          }`}
        >
          <ZoomIcon size={14} />
          {zoomHint}
        </span>
      </div>
    </div>
  );
}
