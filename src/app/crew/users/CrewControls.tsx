"use client";

import { useActionState, useId } from "react";
import {
  addCrewMember,
  sendPasswordLink,
  setCrewMemberActive,
  setCrewMemberRole,
  turnOffSharedPassword,
} from "./actions";
import {
  CREW_LINK_INITIAL_STATE,
  PORTAL_INITIAL_STATE,
  type CrewLinkFormState,
} from "@/lib/portal/form-state";
import { Button } from "@/components/ui/Button";
import { FormFeedback, PORTAL_CONTROL, fieldProps } from "@/components/ui/FormFeedback";

/**
 * A link nobody was emailed, shown once. Selectable text rather than a copy
 * button: the owner may be reading it aloud, writing it down or pasting it,
 * and a plain paragraph serves all three.
 */
function OneTimeLink({ state }: { state: CrewLinkFormState }) {
  if (state.status !== "success" || !state.link) return null;

  return (
    <p
      data-one-time-link
      className="max-w-[46rem] break-all border border-steel-mid bg-graphite px-5 py-4 text-base text-chalk select-all"
    >
      {state.link}
    </p>
  );
}

export function AddCrewMemberForm() {
  const [state, formAction, pending] = useActionState(addCrewMember, CREW_LINK_INITIAL_STATE);
  const feedbackId = useId();

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-6 border border-steel-dim p-7">
        <h2 className="display-condensed text-xl text-chalk">Add someone</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="display-plain text-sm text-steel">Name, as the order history shows it</span>
            <input name="displayName" autoComplete="off" required {...fieldProps(state, "displayName", feedbackId)} className={PORTAL_CONTROL} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="display-plain text-sm text-steel">Username</span>
            <input name="username" autoComplete="off" autoCapitalize="none" spellCheck={false} required {...fieldProps(state, "username", feedbackId)} className={PORTAL_CONTROL} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="display-plain text-sm text-steel">Email, where their link goes</span>
            <input name="email" type="email" autoComplete="off" required {...fieldProps(state, "email", feedbackId)} className={PORTAL_CONTROL} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="display-plain text-sm text-steel">Role</span>
            <select name="role" defaultValue="crew" {...fieldProps(state, "role", feedbackId)} className={PORTAL_CONTROL}>
              <option value="crew">Crew — orders, labels and shipping</option>
              <option value="owner">Owner — everything, including refunds and the crew</option>
            </select>
          </label>
        </div>
        <div>
          <Button type="submit" disabled={pending}>
            {pending ? "Adding…" : "Add and send their link"}
          </Button>
        </div>
      </form>
      <FormFeedback id={feedbackId} state={state} />
      <OneTimeLink state={state} />
    </div>
  );
}

export function PasswordLinkControl({ id, label }: { id: string; label: string }) {
  const [state, formAction, pending] = useActionState(sendPasswordLink, CREW_LINK_INITIAL_STATE);
  const feedbackId = useId();

  return (
    <div className="flex flex-col gap-3">
      <form action={formAction}>
        <input type="hidden" name="id" value={id} />
        <Button type="submit" intent="outline" disabled={pending}>
          {pending ? "Sending…" : label}
        </Button>
      </form>
      <FormFeedback id={feedbackId} state={state} />
      <OneTimeLink state={state} />
    </div>
  );
}

export function ActiveControl({ id, active, name }: { id: string; active: boolean; name: string }) {
  const [state, formAction, pending] = useActionState(setCrewMemberActive, PORTAL_INITIAL_STATE);
  const feedbackId = useId();

  return (
    <div className="flex flex-col gap-3">
      <form action={formAction}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="active" value={active ? "false" : "true"} />
        <Button type="submit" intent="outline" disabled={pending}>
          {pending ? "Working…" : active ? "Turn off and sign out" : "Turn on"}
          <span className="sr-only">{`, ${name}`}</span>
        </Button>
      </form>
      <FormFeedback id={feedbackId} state={state} />
    </div>
  );
}

export function RoleControl({ id, role, name }: { id: string; role: string; name: string }) {
  const [state, formAction, pending] = useActionState(setCrewMemberRole, PORTAL_INITIAL_STATE);
  const feedbackId = useId();
  const other = role === "owner" ? "crew" : "owner";

  return (
    <div className="flex flex-col gap-3">
      <form action={formAction}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="role" value={other} />
        <Button type="submit" intent="quiet" disabled={pending}>
          {pending ? "Working…" : other === "owner" ? "Make owner" : "Make crew"}
          <span className="sr-only">{`, ${name}`}</span>
        </Button>
      </form>
      <FormFeedback id={feedbackId} state={state} />
    </div>
  );
}

export function SharedPasswordControl({ blockedBecause }: { blockedBecause: string | null }) {
  const [state, formAction, pending] = useActionState(turnOffSharedPassword, PORTAL_INITIAL_STATE);
  const feedbackId = useId();
  const noteId = useId();

  return (
    <div className="flex flex-col gap-3">
      <form action={formAction}>
        <Button
          type="submit"
          intent="outline"
          disabled={pending || blockedBecause !== null}
          aria-describedby={blockedBecause ? noteId : undefined}
        >
          {pending ? "Working…" : "Turn off the shared password"}
        </Button>
      </form>
      {blockedBecause ? (
        <p id={noteId} className="max-w-[46rem] text-sm text-steel">
          {blockedBecause}
        </p>
      ) : null}
      <FormFeedback id={feedbackId} state={state} />
    </div>
  );
}
