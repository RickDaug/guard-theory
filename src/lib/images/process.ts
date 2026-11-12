import sharp from "sharp";
import {
  CONTENT_TYPE,
  EXTENSION,
  MAX_PIXELS,
  checkDimensions,
  checkFileSize,
  sniffImageKind,
  type ImageKind,
} from "./validate.ts";

/**
 * Turning an uploaded file into the one that is stored.
 *
 * The stored original is public: it is linked from Product JSON-LD and sent to
 * Stripe, and anyone can fetch it. A phone photograph carries GPS coordinates
 * in its EXIF, and a garment shot at home or at a gym would publish where that
 * is. So nothing the camera wrote survives. sharp re-encodes the pixels and, by
 * default, writes no metadata at all; the one thing added back is an sRGB ICC
 * profile, so a file exported in a wider space is not shown desaturated
 * (brief §4.3: "sRGB IEC61966-2.1, embedded").
 *
 * Orientation is applied to the pixels before the EXIF that carried it is
 * dropped, or a portrait phone photograph would be stored on its side.
 *
 * The same format goes out as came in. JPEG is re-encoded at quality 90, the
 * top of the brief's 85–90 range, so a second generation costs as little as it
 * can; Next makes the AVIF and WebP the browser actually receives.
 */

export type PreparedImage = {
  bytes: Buffer;
  kind: ImageKind;
  contentType: string;
  extension: string;
  width: number;
  height: number;
};

export type PrepareResult = { ok: true; image: PreparedImage } | { ok: false; message: string };

const NOT_AN_IMAGE =
  "That file is not a JPEG, PNG or WebP photograph. Export it as a JPEG and try again.";

export async function prepareUpload(input: Uint8Array): Promise<PrepareResult> {
  const sizeProblem = checkFileSize(input.byteLength);

  if (sizeProblem) {
    return { ok: false, message: sizeProblem };
  }

  const kind = sniffImageKind(input);

  if (!kind) {
    return { ok: false, message: NOT_AN_IMAGE };
  }

  try {
    // failOn "error": a truncated or corrupt file is refused, not half-decoded
    // into a grey band. limitInputPixels is the decompression-bomb limit.
    const source = sharp(input, { failOn: "error", limitInputPixels: MAX_PIXELS });
    const metadata = await source.metadata();

    // The first bytes said one thing; the decoder must agree. A PNG header on a
    // file sharp reads as something else is not a PNG.
    if (metadata.format !== kind) {
      return { ok: false, message: NOT_AN_IMAGE };
    }

    if ((metadata.pages ?? 1) > 1) {
      return { ok: false, message: "That is an animated image. Upload a still photograph." };
    }

    let pipeline = source.autoOrient().withIccProfile("srgb");

    pipeline =
      kind === "jpeg"
        ? pipeline.jpeg({ quality: 90, mozjpeg: true, chromaSubsampling: "4:4:4" })
        : kind === "png"
          ? pipeline.png({ compressionLevel: 9 })
          : pipeline.webp({ quality: 90 });

    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });

    const dimensionProblem = checkDimensions(info.width, info.height);

    if (dimensionProblem) {
      return { ok: false, message: dimensionProblem };
    }

    return {
      ok: true,
      image: {
        bytes: data,
        kind,
        contentType: CONTENT_TYPE[kind],
        extension: EXTENSION[kind],
        width: info.width,
        height: info.height,
      },
    };
  } catch (error) {
    console.error(
      "[guard-theory] could not read an uploaded image:",
      error instanceof Error ? error.message : error,
    );
    return { ok: false, message: "That file could not be read as a photograph. It may be damaged; export it again." };
  }
}
