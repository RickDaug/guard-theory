"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { changeProductImage, uploadProductImage } from "./actions";
import { FormMessage } from "./FormMessage";
import { useKeptForm } from "./useKeptForm";
import { Button } from "@/components/ui/Button";
import type { PortalFormState } from "@/lib/portal/form-state";
import { ALT_MAX_CHARS, MIN_EDGE_PX, checkFileSize } from "@/lib/images/validate";

export type EditorImage = {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  /** Whether this build may show it — its URL is on the configured Blob host. */
  showable: boolean;
};

const INPUT = "min-h-6 border border-steel-dim bg-graphite px-4 py-3 text-chalk";

const ALT_HINT =
  "Say what the photograph shows and nothing it does not: which garment, which view, what is in the frame. For example: “Theory 01 long sleeve rash guard laid flat, front view, on white.” Not the filename, not “image of”, and no colour, measurement or claim the page does not state.";

function ImageRow({
  productId,
  image,
  index,
  count,
  onRemove,
}: {
  productId: string;
  image: EditorImage;
  index: number;
  count: number;
  /** The section's remove handler; null when storage is not connected. */
  onRemove: ((event: FormEvent<HTMLFormElement>) => void) | null;
}) {
  const { state, onSubmit, pending, version } = useKeptForm(changeProductImage);
  const altId = `alt-${image.id}`;
  const messageId = `image-message-${image.id}`;
  const primary = index === 0;

  return (
    <li className="border-b border-steel-dim py-6">
      <form onSubmit={onSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
        <input type="hidden" name="id" value={productId} />
        <input type="hidden" name="imageId" value={image.id} />

        <div className="relative aspect-4/5 w-28 shrink-0 overflow-hidden bg-graphite">
          {image.showable ? (
            <Image
              src={image.url}
              alt={image.alt}
              fill
              sizes="112px"
              className="object-contain"
            />
          ) : null}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <p className="notation text-2xs text-orchid">
            {primary ? "Primary" : `Photograph ${index + 1}`} · {image.width} × {image.height}
          </p>
          {image.showable ? null : (
            <p className="text-sm text-steel">
              This build is not set to show photographs from this address. Check
              NEXT_PUBLIC_BLOB_HOSTNAME against the Blob store and redeploy.
            </p>
          )}

          <label htmlFor={altId} className="flex flex-col gap-2">
            <span className="display-plain text-sm text-steel">Alt text</span>
            <textarea
              key={`${version}-${image.alt}`}
              id={altId}
              name="alt"
              defaultValue={image.alt}
              rows={2}
              maxLength={ALT_MAX_CHARS}
              aria-invalid={state.status === "error" && state.field === "alt" ? true : undefined}
              aria-describedby={state.status === "error" && state.field === "alt" ? messageId : undefined}
              className={INPUT}
            />
          </label>

          <div className="flex flex-wrap items-center gap-4">
            <Button type="submit" name="op" value="alt" intent="outline" disabled={pending}>
              Save alt text
            </Button>
            {primary ? null : (
              <Button type="submit" name="op" value="primary" intent="quiet" disabled={pending}>
                Make primary
              </Button>
            )}
            {index > 0 ? (
              <Button type="submit" name="op" value="up" intent="quiet" disabled={pending}>
                Move up
              </Button>
            ) : null}
            {index < count - 1 ? (
              <Button type="submit" name="op" value="down" intent="quiet" disabled={pending}>
                Move down
              </Button>
            ) : null}
          </div>

          <div id={messageId}>
            <FormMessage state={state} />
          </div>
        </div>
      </form>
      {/* Its own form, answered by the section rather than the row: a removed
          row is gone from the page, and its answer with it — including the one
          that says the file could not be deleted from storage. */}
      {onRemove ? (
        <form onSubmit={onRemove} className="mt-4 sm:pl-34">
          <input type="hidden" name="id" value={productId} />
          <input type="hidden" name="imageId" value={image.id} />
          <input type="hidden" name="op" value="remove" />
          <Button type="submit" intent="quiet">
            Remove photograph {index + 1}
          </Button>
        </form>
      ) : null}
    </li>
  );
}

/**
 * A product's photographs: upload, describe, order, remove.
 *
 * The first one is the primary — the product page's first image, the first
 * image in Product JSON-LD and the Stripe Checkout thumbnail. A product cannot
 * go live without at least one.
 *
 * With no Blob store connected the uploader is replaced by one sentence and
 * nothing else changes: existing photographs can still be described and
 * reordered, since that is only the database.
 */
export function ImagesEditor({
  productId,
  images,
  connected,
}: {
  productId: string;
  images: EditorImage[];
  connected: boolean;
}) {
  const upload = useKeptForm(uploadProductImage);
  const remove = useKeptForm(changeProductImage);
  const [tooBig, setTooBig] = useState<PortalFormState | null>(null);
  const fileId = `image-file-${productId}`;
  const altId = `image-alt-${productId}`;
  const messageId = `image-upload-message-${productId}`;
  const shown = tooBig ?? upload.state;
  const invalid = (name: string) => shown.status === "error" && shown.field === name;

  // A file over the limit is refused here, before it is sent: over 4.5 MB the
  // platform rejects the request before the action can answer with a sentence.
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const input = event.currentTarget.elements.namedItem("file");
    const file = input instanceof HTMLInputElement ? input.files?.[0] : undefined;
    const problem = file ? checkFileSize(file.size) : null;

    if (problem) {
      event.preventDefault();
      setTooBig({ status: "error", message: problem, field: "file" });
      return;
    }

    setTooBig(null);
    upload.onSubmit(event);
  }

  return (
    <section
      aria-labelledby={`images-${productId}`}
      className="flex flex-col gap-5 border border-steel-dim p-7"
    >
      <h3 id={`images-${productId}`} className="display-condensed text-lg text-chalk">
        Photographs
      </h3>

      {images.length === 0 ? (
        <p className="text-base text-steel">No photographs yet.</p>
      ) : (
        <ul className="m-0 list-none p-0">
          {images.map((image, index) => (
            <ImageRow
              key={image.id}
              productId={productId}
              image={image}
              index={index}
              count={images.length}
              onRemove={connected ? remove.onSubmit : null}
            />
          ))}
        </ul>
      )}

      <FormMessage state={remove.state} />

      {connected ? (
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <input type="hidden" name="id" value={productId} />

          <div key={upload.version} className="flex flex-col gap-5">
            <label htmlFor={fileId} className="flex flex-col gap-2">
              <span className="display-plain text-sm text-steel">Photograph</span>
              <input
                id={fileId}
                type="file"
                name="file"
                accept="image/jpeg,image/png,image/webp"
                required
                aria-invalid={invalid("file") ? true : undefined}
                aria-describedby={invalid("file") ? messageId : undefined}
                className="min-h-6 text-sm text-chalk"
              />
            </label>

            <label htmlFor={altId} className="flex flex-col gap-2">
              <span className="display-plain text-sm text-steel">Alt text</span>
              <textarea
                id={altId}
                name="alt"
                required
                rows={2}
                maxLength={ALT_MAX_CHARS}
                aria-invalid={invalid("alt") ? true : undefined}
                aria-describedby={invalid("alt") ? `${messageId} ${altId}-hint` : `${altId}-hint`}
                className={INPUT}
              />
            </label>
            <p id={`${altId}-hint`} className="text-sm text-steel">
              {ALT_HINT}
            </p>
          </div>

          <div>
            <Button type="submit" intent="outline" disabled={upload.pending}>
              {upload.pending ? "Uploading…" : "Upload photograph"}
            </Button>
          </div>

          <div id={messageId}>
            <FormMessage state={shown} />
          </div>

          <p className="text-sm text-steel">
            JPEG, PNG or WebP, 4 MB or less, framed 4:5 or 1:1, each edge at least {MIN_EDGE_PX} px.
            Export JPEG in sRGB at 2400 × 3000 or 2400 × 2400. Location and camera data are
            removed before the file is stored, and the stored file is public.
          </p>
        </form>
      ) : (
        <p className="border-l-2 border-steel-mid bg-graphite px-5 py-3 text-base text-chalk">
          Image storage not connected. Photographs can be uploaded once a Vercel Blob store is
          connected to this project; docs/provisioning.md has the steps.
        </p>
      )}
    </section>
  );
}
