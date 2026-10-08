import Image from "next/image";

export type GalleryImage = { url: string; alt: string; width: number; height: number };

/**
 * The owner's photographs of a garment, in the owner's order.
 *
 * A plain grid, not a carousel: the shop and home specifications forbid
 * carousels, and a grid needs no controls to reach every photograph. The first
 * is the primary and spans the column; it is the page's largest element, so it
 * is loaded eagerly at high priority — the figures pages' pattern, since
 * `priority` is deprecated in Next 16 and no longer reaches the <img>.
 *
 * NO LAYOUT SHIFT. Every photograph sits in a fixed 4:5 box on graphite and is
 * contained inside it, so the box's height is known before a byte arrives and
 * a 1:1 photograph is letterboxed rather than resizing the row.
 *
 * `next/image` only. It fetches the original from the Blob host on the server
 * and serves the result from /_next/image on this origin; a raw <img> would be
 * the site's first third-party image request and would break the CSP.
 * tests/unit/images.test.ts enforces that.
 */
export function ProductGallery({ images, productName }: { images: GalleryImage[]; productName: string }) {
  if (images.length === 0) {
    return null;
  }

  return (
    <section aria-label={`Photographs of the ${productName}`} className="mb-12">
      <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0">
        {images.map((image, index) => (
          <li key={image.url} className={index === 0 ? "col-span-2" : undefined}>
            <div className="relative aspect-4/5 w-full overflow-hidden bg-graphite">
              <Image
                src={image.url}
                alt={image.alt}
                fill
                // The column is 7 of 12 inside a 104rem container: about 900px
                // at most. The rest are half of it.
                sizes={
                  index === 0
                    ? "(min-width: 1664px) 900px, (min-width: 1024px) 55vw, 100vw"
                    : "(min-width: 1664px) 450px, (min-width: 1024px) 28vw, 50vw"
                }
                {...(index === 0 ? { loading: "eager" as const, fetchPriority: "high" as const } : {})}
                className="object-contain"
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
