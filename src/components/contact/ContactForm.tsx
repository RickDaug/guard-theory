"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { sendMessage } from "@/app/contact/actions";
import {
  CONTACT_INITIAL_STATE,
  TOPICS,
  type ContactFormState,
} from "@/lib/contact/form-state";

const FIELD_ORDER: Array<{ key: string; id: string }> = [
  { key: "name", id: "ct-name" },
  { key: "email", id: "ct-email" },
  { key: "message", id: "ct-message" },
];

function ErrorSummary({ state }: { state: ContactFormState }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === "error") ref.current?.focus();
  }, [state]);

  if (state.status !== "error") return null;

  const listed = FIELD_ORDER.filter((field) => state.errors[field.key]);

  return (
    <div ref={ref} tabIndex={-1} role="alert" className="border border-signal p-6">
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

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    sendMessage,
    CONTACT_INITIAL_STATE,
  );

  if (state.status === "success") {
    return (
      <div role="status" className="border border-steel-dim p-8">
        <p className="notation text-2xs text-signal">Received</p>
        <h2 className="display-condensed mt-5 text-2xl text-chalk">
          Message received
        </h2>
        <p className="mt-6 max-w-[34rem] text-base text-steel">
          Your message is stored. Until a mail provider is connected nobody is
          notified automatically, so a reply may take a while - see the note
          below. If you sent a correction it will be acted on whether or not we
          end up changing the piece.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="flex flex-col gap-8">
      <ErrorSummary state={state} />

      <TextField
        id="ct-name"
        name="name"
        label="Your name"
        autoComplete="name"
        required
        error={state.errors.name}
      />

      <TextField
        id="ct-email"
        name="email"
        type="email"
        label="Email address"
        autoComplete="email"
        required
        hint="Used only to reply to this message."
        error={state.errors.email}
      />

      <SelectField
        id="ct-topic"
        name="topic"
        label="What is this about?"
        defaultValue="other"
      >
        {TOPICS.map((topic) => (
          <option key={topic.value} value={topic.value}>
            {topic.label}
          </option>
        ))}
      </SelectField>

      <TextAreaField
        id="ct-message"
        name="message"
        label="Message"
        required
        hint="If you are reporting an error, point at the specific claim and, if you have one, the source that contradicts it."
        error={state.errors.message}
      />

      <div className="hidden" aria-hidden="true">
        <label htmlFor="ct-website">Leave this field empty</label>
        <input id="ct-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Sending…" : "Send message"}
        </Button>
      </div>
    </form>
  );
}
