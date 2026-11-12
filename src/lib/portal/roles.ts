/**
 * Who may do what in the Crew Portal.
 *
 * Two roles. `crew` handles orders: views them, buys and prints labels, saves
 * tracking, marks shipped and delivered, and can read the products. `owner`
 * does all of that and everything that moves money or changes the shop:
 * refunds, cancels, products, prices, photographs, categories, settings, the
 * mailing list, the sales export, messages and the crew itself.
 *
 * Every server action names the role it needs as its first statement
 * (`await requireRole("crew")` or `await requireRole("owner")`), and
 * tests/unit/crew-actions-guard.test.ts fails the build if one does not — and
 * fails if an action listed as owner-only there is opened to crew. Hiding a
 * button from crew is presentation; the action's own check is the lock.
 *
 * Pure: no database and no request, so the rule itself is unit-tested.
 */

export type Role = "owner" | "crew";

export const ROLES: readonly Role[] = ["owner", "crew"];

export const ROLE_LABEL: Record<Role, string> = {
  owner: "Owner",
  crew: "Crew",
};

export function isRole(value: unknown): value is Role {
  return value === "owner" || value === "crew";
}

/** The person behind a session, as every page and action sees them. */
export type Actor = {
  /** null for the shared-password owner sign-in (PORTAL_PASSWORD_HASH). */
  userId: string | null;
  role: Role;
  /** What the order history prints after "by". */
  name: string;
};

/** The name the shared-password sign-in is recorded under. */
export const SHARED_OWNER_NAME = "Owner (shared password)";

/**
 * Whether a signed-in person with `has` may do something that needs `needs`.
 * Owner may do everything crew may; crew may do nothing that needs owner.
 */
export function roleAllows(has: Role, needs: Role): boolean {
  return needs === "crew" ? has === "crew" || has === "owner" : has === "owner";
}

export class NotAuthorised extends Error {
  constructor(message = "Not signed in to the Crew Portal.") {
    super(message);
    this.name = "NotAuthorised";
  }
}

/**
 * The decision `requireRole` makes, without the cookie lookup: throws unless
 * there is a session and its role covers `needs`.
 */
export function authorise<T extends { role: Role }>(session: T | null, needs: Role): T {
  if (!session) {
    throw new NotAuthorised();
  }

  if (!roleAllows(session.role, needs)) {
    throw new NotAuthorised("Only the owner can do that.");
  }

  return session;
}
