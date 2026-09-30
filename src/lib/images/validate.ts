/**
 * What a product photograph has to be before it is stored.
 *
 * Pure: no sharp, no storage, no database. The portal's client component reads
 * MAX_UPLOAD_BYTES from here to refuse an oversized file before sending it,
 * and the server reads everything else. The numbers come from the photography
 * brief (gt-photo-brief.md §4, §6):
 *
 *   - JPEG, PNG or WebP, decided by the file's own first bytes. The browser's
 *     MIME type is whatever the file's name says, and a name is not evidence.
 *   - 4 MB or less. A server action's body is capped at 4.5 MB on Vercel, and
 *     multipart framing needs some of that.
 *   - 4:5 (the product page's frame) or 1:1 (the primary Google and Stripe
 *     image), each edge at least 1500 px — Google Merchant's recommended
 *     minimum, and enough for the product column at twice device resolution.
 *   - Alt text that says what the photograph shows. Required, and never the
 *     filename or a word that could caption any photograph.
 */

export type ImageKind = "jpeg" | "png" | "webp";

export const CONTENT_TYPE: Record<ImageKind, string> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export const EXTENSION: Record<ImageKind, string> = { jpeg: "jpg", png: "png", webp: "webp" };

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/** Each edge. Google Merchant recommends 1500 × 1500 or larger. */
export const MIN_EDGE_PX = 1500;

/** Google Merchant's ceiling (64 MP), and sharp's decompression-bomb limit. */
export const MAX_PIXELS = 64_000_000;

/** How far off 4:5 or 1:1 a hand crop may be. 2% is a few pixels of slack. */
const RATIO_TOLERANCE = 0.02;

export const ALLOWED_RATIOS = [
  { label: "4:5", value: 4 / 5 },
  { label: "1:1", value: 1 },
] as const;

export const ALT_MIN_CHARS = 15;
export const ALT_MAX_CHARS = 250;

/** At most this many photographs on one product. */
export const MAX_IMAGES_PER_PRODUCT = 12;

/**
 * The file's type from its first bytes, or null when it is none of the three.
 *
 *   JPEG  FF D8 FF
 *   PNG   89 50 4E 47 0D 0A 1A 0A
 *   WebP  "RIFF" <4 bytes of length> "WEBP"
 */
export function sniffImageKind(bytes: Uint8Array): ImageKind | null {
  const at = (i: number) => bytes[i];

  if (bytes.length >= 3 && at(0) === 0xff && at(1) === 0xd8 && at(2) === 0xff) {
    return "jpeg";
  }

  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length >= png.length && png.every((byte, i) => at(i) === byte)) {
    return "png";
  }

  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.subarray(from, to));
  if (bytes.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") {
    return "webp";
  }

  return null;
}

/** The size refusal, or null when the size is fine. */
export function checkFileSize(size: number): string | null {
  if (size <= 0) {
    return "Choose a photograph to upload.";
  }

  if (size > MAX_UPLOAD_BYTES) {
    const mb = (size / (1024 * 1024)).toFixed(1);
    return `That file is ${mb} MB. The limit is 4 MB — export it as a JPEG at quality 85 to 90, which a 2400 × 3000 photograph comes in well under.`;
  }

  return null;
}

/**
 * The dimension refusal, or null when the photograph is big enough and framed
 * 4:5 or 1:1. Called with the dimensions AFTER orientation is applied, since
 * that is the shape the page will show.
 */
export function checkDimensions(width: number, height: number): string | null {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    return "That file's dimensions could not be read.";
  }

  if (width * height > MAX_PIXELS) {
    return `That photograph is ${width} × ${height}, over 64 megapixels. Export it at 2400 × 3000 (4:5) or 2400 × 2400 (1:1).`;
  }

  if (width < MIN_EDGE_PX || height < MIN_EDGE_PX) {
    return `That photograph is ${width} × ${height}. Each edge needs to be at least ${MIN_EDGE_PX} px — export it at 2400 × 3000 (4:5) or 2400 × 2400 (1:1).`;
  }

  const ratio = width / height;
  const framed = ALLOWED_RATIOS.some(
    (allowed) => Math.abs(ratio - allowed.value) / allowed.value <= RATIO_TOLERANCE,
  );

  if (!framed) {
    return `That photograph is ${width} × ${height}. The product page frames photographs 4:5 (portrait, like 2400 × 3000) or 1:1 (square, like 2400 × 2400). Crop it to one of those.`;
  }

  return null;
}

/** "theory-01_LS flat.front.JPG" → "theory 01 ls flat front". */
function words(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\.(jpe?g|png|webp|gif|heic|heif|tiff?|bmp|avif)$/i, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Words that could caption any photograph on any shop. Alone, or as the whole
 * of an alt text once the filler words are gone, they describe nothing.
 */
const GENERIC = new Set([
  "image",
  "photo",
  "photograph",
  "picture",
  "pic",
  "product",
  "product image",
  "product photo",
  "product photograph",
  "rash guard",
  "rashguard",
  "shirt",
  "garment",
  "apparel",
  "front",
  "back",
  "untitled",
  "placeholder",
]);

/** The words GENERIC is made of. An alt text needs at least two others. */
const GENERIC_WORDS = new Set([...GENERIC].flatMap((phrase) => phrase.split(" ")));

/**
 * Claims the brief names as the wrong thing to put in alt text: rulesets,
 * quality words and performance promises. None of them is visible in a
 * photograph, and none is published anywhere else on the site.
 */
const CLAIMS = /\b(ibjjf|adcc|premium|guarantee[ds]?|never rides? up|best[- ]in[- ]class|world[- ]class)\b/i;

export type AltResult = { ok: true; alt: string } | { ok: false; message: string };

/**
 * Reads alt text typed for a photograph, refusing what would not help someone
 * who cannot see it. `filename` is the uploaded file's name, so an alt that is
 * only the filename can be recognised; pass "" when there is none.
 */
export function readAltText(raw: FormDataEntryValue | null, filename = ""): AltResult {
  const alt = typeof raw === "string" ? raw.replace(/\s+/g, " ").trim() : "";

  if (!alt) {
    return {
      ok: false,
      message: "Write alt text: one sentence saying what the photograph shows, for someone who cannot see it.",
    };
  }

  if (alt.length > ALT_MAX_CHARS) {
    return { ok: false, message: `Keep alt text under ${ALT_MAX_CHARS} characters. One sentence is enough.` };
  }

  const said = words(alt);
  const stem = words(filename);

  if (
    (stem && said === stem) ||
    /\.(jpe?g|png|webp|gif|heic|heif|tiff?|bmp|avif)\b/i.test(alt) ||
    /^(img|dsc|dscn|dcim|pxl|mvimg|photo|image)[\s_-]?\d+/i.test(alt)
  ) {
    return {
      ok: false,
      message: "That is a filename, not alt text. Say what the photograph shows — for example, \"Theory 01 long sleeve rash guard laid flat, front view, on white.\"",
    };
  }

  if (/^(an? |the )?(image|photo|photograph|picture|pic) (of|showing)\b/i.test(alt)) {
    return {
      ok: false,
      message: "Leave out \"image of\" or \"photo of\" — a screen reader already says it is an image. Start with what it shows.",
    };
  }

  const meaningful = said.split(" ").filter((word) => !["a", "an", "the", "of", "on", "in", "and"].includes(word));

  const specific = meaningful.filter((word) => !GENERIC_WORDS.has(word));

  if (
    GENERIC.has(said) ||
    GENERIC.has(meaningful.join(" ")) ||
    alt.length < ALT_MIN_CHARS ||
    meaningful.length < 3 ||
    specific.length < 2
  ) {
    return {
      ok: false,
      message: "That alt text could caption any photograph. Say which garment, which view and what is in the frame — for example, \"Side seam of the Theory 01 long sleeve, close up, showing the doubled stitch line.\"",
    };
  }

  if (CLAIMS.test(alt)) {
    return {
      ok: false,
      message: "Alt text says what the photograph shows. Rulesets, quality words and performance claims are not in the frame, so they do not belong in it.",
    };
  }

  return { ok: true, alt };
}

export type ImageOp = "up" | "down" | "primary";

/**
 * The new order of a product's photographs after one move, or null when the
 * move changes nothing or names a photograph that is not there.
 *
 * The first photograph is the primary: the product page's LCP image, the
 * first `image` in Product JSON-LD and the Stripe Checkout thumbnail. So
 * "make primary" is a move to the front, not a flag — one ordering, and no
 * second column that could disagree with it.
 */
export function reorderImages(ids: readonly string[], id: string, op: ImageOp): string[] | null {
  const index = ids.indexOf(id);

  if (index === -1) {
    return null;
  }

  const next = [...ids];

  if (op === "primary") {
    if (index === 0) return null;
    next.splice(index, 1);
    next.unshift(id);
    return next;
  }

  const target = op === "up" ? index - 1 : index + 1;

  if (target < 0 || target >= ids.length) {
    return null;
  }

  next[index] = ids[target]!;
  next[target] = id;
  return next;
}
