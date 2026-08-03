"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  CheckboxField,
  SelectField,
  TextField,
} from "@/components/ui/Field";
import { joinWaitlist } from "@/app/first-edition/actions";
import {
  INITIAL_STATE,
  type WaitlistFormState,
} from "@/lib/waitlist/form-state";

/**
 * The one conversion point on the site.
 *
 * Nothing here manufactures urgency: no countdown, no invented stock figure, no
 * "twelve people are viewing this". The reason to join is that the release date
 * is genuinely unknown and this is the only way to hear about it.
 *
 * On error the summary takes focus and links to the offending fields, which is
 * the behaviour a screen-reader user needs and a sighted user benefits from.
 */

const EXPERIENCE = [
  { value: "", label: "Prefer not to say" },
  { value: "not-training-yet", label: "Not training yet" },
  { value: "under-a-year", label: "Under a year" },
  { value: "one-to-three-years", label: "One to three years" },
  { value: "three-plus-years", label: "Three years or more" },
];

const SLEEVE = [
  { value: "no-preference", label: "No preference" },
  { value: "short", label: "Short sleeve" },
  { value: "long", label: "Long sleeve" },
];

const INTEREST = [
  { value: "rash-guards", label: "Rash guards" },
  { value: "spats", label: "Spats" },
  { value: "shorts", label: "Shorts" },
  { value: "accessories", label: "Accessories" },
];

/** Field ids, in the order they appear, so the summary can link to them. */
const FIELD_ORDER: Array<{ key: string; id: string }> = [
  { key: "firstName", id: "wl-first-name" },
  { key: "email", id: "wl-email" },
  { key: "expectedSize", id: "wl-size" },
  { key: "consent", id: "wl-consent" },
];

function ErrorSummary({ state }: { state: WaitlistFormState }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === "error") ref.current?.focus();
  }, [state]);

  if (state.status !== "error") return null;

  const listed = FIELD_ORDER.filter((field) => state.errors[field.key]);

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      className="border border-signal p-6"
    >
      <p className="display-plain text-base text-chalk">{state.message}</p>
      {listed.length > 0 ? (
        <ul className="m-0 mt-4 flex list-none flex-col gap-2 p-0">
          {listed.map((field) => (
            <li key={field.key}>
              <a
                href={`#${field.id}`}
                className="text-sm text-signal underline underline-offset-[5px]"
              >
                {state.errors[field.key]}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function WaitlistForm() {
  const [state, formAction, pending] = useActionState(joinWaitlist, INITIAL_STATE);

  if (state.status === "success") {
    return (
      <div role="status" className="border border-steel-dim p-8">
        <p className="notation text-2xs text-signal">First Edition</p>
        <h2 className="display-condensed mt-5 text-2xl text-chalk">
          {state.alreadyOnList ? "Already on the list" : "You're on the list"}
        </h2>
        <p className="mt-6 max-w-[34rem] text-base text-steel">
          {state.alreadyOnList
            ? "This address was already registered, so nothing has changed. You will hear from us once, when the First Edition has a release date."
            : "You will hear from us once, when the First Edition has a release date. No newsletter, no drip sequence. Every message includes a one-click unsubscribe."}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="flex flex-col gap-8">
      <ErrorSummary state={state} />

      <TextField
        id="wl-first-name"
        name="firstName"
        label="First name"
        autoComplete="given-name"
        required
        error={state.errors.firstName}
      />

      <TextField
        id="wl-email"
        name="email"
        type="email"
        label="Email address"
        autoComplete="email"
        required
        hint="Used only to tell you when the First Edition is released."
        error={state.errors.email}
      />

      <SelectField
        id="wl-experience"
        name="trainingExperience"
        label="How long have you been training?"
        optional
        defaultValue=""
      >
        {EXPERIENCE.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectField>

      <SelectField
        id="wl-sleeve"
        name="sleevePreference"
        label="Preferred sleeve length"
        optional
        defaultValue="no-preference"
      >
        {SLEEVE.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectField>

      <TextField
        id="wl-size"
        name="expectedSize"
        label="Size you would expect to wear"
        optional
        placeholder="Medium"
        hint="A rough answer helps us plan the first run. Real measurements are not published yet."
        error={state.errors.expectedSize}
      />

      <fieldset className="m-0 border-0 p-0">
        <legend className="display-plain mb-4 text-sm text-chalk">
          What are you interested in?{" "}
          <span className="ml-1 text-steel">Optional</span>
        </legend>
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {INTEREST.map((option) => (
            <div key={option.value} className="flex items-center gap-3">
              <input
                type="checkbox"
                id={`wl-interest-${option.value}`}
                name="productInterest"
                value={option.value}
                className="size-4 shrink-0 accent-signal"
              />
              <label
                htmlFor={`wl-interest-${option.value}`}
                className="text-sm text-steel"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </fieldset>

      <CheckboxField
        id="wl-consent"
        name="consent"
        label="Email me when the First Edition is released. I can unsubscribe from any message."
        error={state.errors.consent}
      />

      <p className="text-sm text-steel">
        We store your name, email and the preferences you give us, and we use
        them only for this. We do not sell or share them. You can ask us to
        delete your details at any time — see the{" "}
        <Link
          href="/policies/privacy"
          className="text-chalk underline decoration-steel-dim underline-offset-[5px]"
        >
          privacy policy
        </Link>
        .
      </p>

      {/* Not shown to people. Left unlabelled deliberately and hidden from
          assistive tech, so only an automated submitter fills it in. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="wl-website">Leave this field empty</label>
        <input id="wl-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Joining…" : "Join the First Edition list"}
        </Button>
      </div>
    </form>
  );
}
