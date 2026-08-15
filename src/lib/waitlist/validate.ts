import type {
  ProductInterest,
  SleevePreference,
  TrainingExperience,
} from "./types.ts";

/**
 * Server-side validation. The client form validates too, for immediacy, but
 * nothing here trusts that — every rule is enforced again on the server.
 *
 * Error messages say what went wrong and how to fix it, in the interface's
 * voice. They do not apologise and they are never vague.
 */

export type FieldErrors = Partial<Record<string, string>>;

const SLEEVE: SleevePreference[] = ["no-preference", "short", "long"];
const EXPERIENCE: TrainingExperience[] = [
  "not-training-yet",
  "under-a-year",
  "one-to-three-years",
  "three-plus-years",
];
const INTEREST: ProductInterest[] = [
  "rash-guards",
  "spats",
  "shorts",
  "accessories",
];

/** Deliberately permissive. Address validity is proved by delivery, not regex. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_EMAIL = 254;
const MAX_NAME = 80;

export type ParsedSignup = {
  email: string;
  firstName: string;
  trainingExperience?: TrainingExperience;
  sleevePreference?: SleevePreference;
  productInterest: ProductInterest[];
  consent: true;
};

export type ParseResult =
  | { ok: true; value: ParsedSignup }
  | { ok: false; errors: FieldErrors };

function readString(data: FormData, key: string): string {
  const raw = data.get(key);
  return typeof raw === "string" ? raw.trim() : "";
}

/** Strips control characters that have no business in a name. */
function sanitise(value: string): string {
  return value.replace(/[\u0000-\u001F\u007F]/g, "");
}

export function parseSignup(data: FormData): ParseResult {
  const errors: FieldErrors = {};

  const email = sanitise(readString(data, "email"));
  const firstName = sanitise(readString(data, "firstName"));
  const sleeveRaw = readString(data, "sleevePreference");
  const experienceRaw = readString(data, "trainingExperience");
  const interestRaw = data
    .getAll("productInterest")
    .filter((v): v is string => typeof v === "string");
  const consent = data.get("consent") === "on" || data.get("consent") === "true";

  if (!email) {
    errors.email = "Enter your email address so we can tell you when the First Edition is released.";
  } else if (email.length > MAX_EMAIL) {
    errors.email = "That email address is too long. Check it for a typo.";
  } else if (!EMAIL.test(email)) {
    errors.email = "Enter an email address that includes an @ symbol and a domain.";
  }

  if (!firstName) {
    errors.firstName = "Enter your first name so we know how to address you.";
  } else if (firstName.length > MAX_NAME) {
    errors.firstName = "Enter a shorter first name — 80 characters at most.";
  }


  const sleevePreference = SLEEVE.includes(sleeveRaw as SleevePreference)
    ? (sleeveRaw as SleevePreference)
    : undefined;

  const trainingExperience = EXPERIENCE.includes(experienceRaw as TrainingExperience)
    ? (experienceRaw as TrainingExperience)
    : undefined;

  const productInterest = interestRaw.filter((v): v is ProductInterest =>
    INTEREST.includes(v as ProductInterest),
  );

  if (!consent) {
    errors.consent =
      "Tick the box to confirm we can email you about the First Edition. We cannot add you to the list without it.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      email: email.toLowerCase(),
      firstName,
      trainingExperience,
      sleevePreference,
      productInterest,
      consent: true,
    },
  };
}
