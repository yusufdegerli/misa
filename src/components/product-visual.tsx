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
  className?: string;
  artClassName?: string;
}

/**
 * A 4:5 product photo on a pure white tile, or a drawn stand-in while no photo exists.
 * Photos are shot on white, so the tile and the photo read as one surface.
 */
export function ProductVisual({
  product,
  alt,
  pendingLabel,
  sizes,
  priority,
  morph,
  className = "",
  artClassName = "w-[68%]",
}: ProductVisualProps) {
  const photo = product.images[0];
  const frame = (
    <div className={`tile flex aspect-[4/5] items-center justify-center ${className}`}>
      {photo ? (
        // Photos are pre-sized WebP files in storage; srcset lets the browser pick the width,
        // so the Next image optimiser is not needed.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo.src}
          srcSet={photo.srcSet}
          sizes={sizes}
          alt={alt}
          width={photo.width}
          height={photo.height}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          className="tile-zoom absolute inset-0 size-full object-contain"
          style={
            photo.blurDataURL
              ? { backgroundImage: `url(${photo.blurDataURL})`, backgroundSize: "cover", backgroundPosition: "center" }
              : undefined
          }
        />
      ) : (
        <>
          <JewelryArt category={product.category} className={`tile-zoom h-auto ${artClassName}`} />
          <span role="img" aria-label={alt} />
          {pendingLabel && (
            <span className="absolute start-4 top-4 text-[10px] tracking-[0.22em] text-steel uppercase">
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
