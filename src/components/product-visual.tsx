import Image from "next/image";
import { ViewTransition } from "react";
import { JewelryArt } from "@/components/brand";
import { productSlug, type Product } from "@/lib/catalog/types";

interface ProductVisualProps {
  product: Product;
  /** Accessible description of the photo. */
  alt: string;
  /** Shown on the placeholder until a real photo is uploaded. */
  pendingLabel?: string;
  /** Responsive `sizes` hint so the image CDN sends the right width. */
  sizes: string;
  priority?: boolean;
  /** Links this image to the same product's image on the next page for the morph animation. */
  morph?: boolean;
  autoShine?: boolean;
  className?: string;
  artClassName?: string;
}

/** A 4:5 product photo on the dark stage, or a drawn stand-in while no photo exists. */
export function ProductVisual({
  product,
  alt,
  pendingLabel,
  sizes,
  priority,
  morph,
  autoShine,
  className = "",
  artClassName = "w-[68%]",
}: ProductVisualProps) {
  const photo = product.images[0];
  const frame = (
    <div
      className={`stage shine relative flex aspect-[4/5] items-center justify-center ${autoShine ? "shine-auto" : ""} ${className}`}
    >
      {photo ? (
        <Image
          src={photo.src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          placeholder={photo.blurDataURL ? "blur" : "empty"}
          blurDataURL={photo.blurDataURL}
          className="object-cover"
        />
      ) : (
        <>
          <JewelryArt category={product.category} className={`h-auto ${artClassName}`} />
          <span role="img" aria-label={alt} />
          {pendingLabel && (
            <span className="absolute start-4 top-4 text-[10px] tracking-[0.22em] text-smoke uppercase">
              {pendingLabel}
            </span>
          )}
        </>
      )}
    </div>
  );

  if (!morph) return frame;
  return (
    <ViewTransition name={`product-${productSlug(product.code)}`} share="morph" default="none">
      {frame}
    </ViewTransition>
  );
}
