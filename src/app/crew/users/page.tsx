import { requirePortalPage } from "@/lib/portal/guard";
import { portalUrl } from "@/lib/portal/routes";
import { isDatabaseConfigured } from "@/lib/db/client";
import { countUsableOwners, isSharedPasswordDisabled, listCrewUsers, type CrewUser } from "@/lib/portal/users";
import { ROLE_LABEL } from "@/lib/portal/roles";
import {
  ActiveControl,
  AddCrewMemberForm,
  PasswordLinkControl,
  RoleControl,
  SharedPasswordControl,
} from "./CrewControls";

export const dynamic = "force-dynamic";

function day(at: Date): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(at));
}

/** One line saying where this person stands. */
function standing(user: CrewUser): { text: string; problem: boolean } {
  if (!user.active) return { text: "Turned off — cannot sign in", problem: false };
  if (!user.has_password) {
    if (!user.pending_expires_at) return { text: "Never set a password, and the link has run out", problem: true };
    return {
      text:
        user.pending_delivery === "sent"
          ? `Invited — link emailed, works until ${day(user.pending_expires_at)}`
          : `Invited — link handed over in person, works until ${day(user.pending_expires_at)}`,
      problem: user.pending_delivery === "failed",
    };
  }
  return {
    text: user.last_sign_in_at ? `Last signed in ${day(user.last_sign_in_at)}` : "Password set, not signed in yet",
    problem: false,
  };
}

/**
 * Crew: who can sign in to the portal, and what they may do.
 *
 * Owner only. Crew handle orders, labels and shipping; owners do that and
 * everything else. Nobody's password is ever seen here: each person chooses
 * their own from a one-time link.
 */
export default async function CrewUsersPage() {
  const session = await requirePortalPage(portalUrl("/users"), "owner");

  if (!isDatabaseConfigured()) {
    return (
      <main id="main" className="px-6 py-16 md:px-12">
        <div className="mx-auto max-w-[80rem]">
          <h1 className="display-condensed mb-8 text-3xl text-chalk">Crew</h1>
          <p className="text-lg text-steel">There is no database connected.</p>
        </div>
      </main>
    );
  }

  const [users, sharedOff, usableOwners] = await Promise.all([
    listCrewUsers(),
    isSharedPasswordDisabled(),
    countUsableOwners(),
  ]);
  const sharedConfigured = Boolean(process.env.PORTAL_PASSWORD_HASH?.trim());

  return (
    <main id="main" className="px-6 py-16 md:px-12">
      <div className="mx-auto flex max-w-[80rem] flex-col gap-14">
        <div>
          <h1 className="display-condensed mb-4 text-3xl text-chalk">Crew</h1>
          <p className="max-w-[46rem] text-lg text-steel">
            Crew can see orders, buy and print labels, save tracking and mark orders shipped.
            Refunds, cancels, products, the list, messages, settings and this page are the
            owner&rsquo;s.
          </p>
        </div>

        <AddCrewMemberForm />

        <section aria-labelledby="people">
          <h2 id="people" className="display-condensed mb-6 text-xl text-chalk">
            People
          </h2>
          {users.length === 0 ? (
            <p className="text-base text-steel">Nobody yet. Add yourself first, as an owner.</p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-px bg-steel-dim p-0">
              {users.map((user) => {
                const where = standing(user);
                const self = user.id === session.userId;

                return (
                  <li key={user.id} data-crew-user={user.username} className="flex flex-col gap-4 bg-ink px-6 py-5">
                    <p className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
                      <span className="display-plain text-base text-chalk">{user.display_name}</span>{" "}
                      <span className="notation text-2xs text-orchid">{user.username}</span>{" "}
                      <span className="text-sm text-steel">{user.email}</span>{" "}
                      <span className="text-sm text-chalk">{ROLE_LABEL[user.role]}</span>{" "}
                      <span className={`text-sm ${where.problem ? "text-signal-lift" : "text-steel"}`}>
                        {self ? `${where.text} · this is you` : where.text}
                      </span>
                    </p>
                    {user.active ? (
                      <div className="flex flex-wrap items-start gap-6">
                        <PasswordLinkControl
                          id={user.id}
                          label={user.has_password ? `Reset ${user.display_name}'s password` : `Send ${user.display_name} a new invite`}
                        />
                        {self ? null : <RoleControl id={user.id} role={user.role} name={user.display_name} />}
                        {self ? null : <ActiveControl id={user.id} active name={user.display_name} />}
                      </div>
                    ) : (
                      <div>
                        <ActiveControl id={user.id} active={false} name={user.display_name} />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section aria-labelledby="shared" className="flex flex-col gap-4">
          <h2 id="shared" className="display-condensed text-xl text-chalk">
            The shared owner password
          </h2>
          {!sharedConfigured ? (
            <p className="text-base text-steel">Not set on this deployment. Only crew accounts open the portal.</p>
          ) : sharedOff ? (
            <p className="text-base text-steel">Off. Only crew accounts open the portal.</p>
          ) : (
            <>
              <p className="max-w-[46rem] text-base text-steel">
                On. Signing in with no username still uses it. Turn it off once you sign in with
                your own owner account.
              </p>
              <SharedPasswordControl
                blockedBecause={
                  usableOwners === 0
                    ? "Add yourself as an owner and set your password first, so turning this off cannot lock you out."
                    : session.userId === null
                      ? "Sign in with your own owner account to turn this off."
                      : null
                }
              />
            </>
          )}
        </section>
      </div>
    </main>
  );
}
