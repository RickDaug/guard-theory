"use client";

import { useState } from "react";

/**
 * The result of a form that answers without a page load.
 *
 * Both live regions are in the DOM from the first render and only their
 * contents change. A `role="status"` element that is inserted already holding
 * its message is announced by some screen readers and not by others (SC
 * 4.1.3); one that exists empty and then gains text is announced by all of
 * them. The message element is re-keyed on every new result, so pressing the
 * same button twice and getting the same answer twice is announced twice rather
 * than read as "nothing changed".
 *
 * `id` is the message element's id, for `aria-describedby` on the field the
 * error is about — see `fieldProps` below.
 */

type State = { status: "idle" | "success" | "error"; message: string; field?: string };

const BOX = "border-l-2 border-signal-lift bg-graphite px-5 py-3 text-base text-chalk";
const INLINE = "text-sm text-steel";

export function FormFeedback({
  id,
  state,
  inline = false,
  className = "",
}: {
  id: string;
  state: State;
  /** A one-line note under a small control, rather than the boxed summary. */
  inline?: boolean;
  /** Layout for the wrapper, such as a width or an alignment. */
  className?: string;
}) {
  const [last, setLast] = useState(state);
  const [count, setCount] = useState(0);

  if (state !== last) {
    setLast(state);
    setCount(count + 1);
  }

  const text = inline ? INLINE : BOX;

  // Empty, the wrapper is taken out of flow rather than hidden: a live region
  // under display:none is not in the accessibility tree, so the first message
  // would arrive with the region instead of into it. Out of flow, it adds no
  // gap to the flex column it sits in.
  return (
    <div className={`[&:not(:has(p))]:absolute ${className}`}>
      <div role="alert" aria-atomic="true">
        {state.status === "error" ? (
          <p key={count} id={id} className={text}>
            {state.message}
          </p>
        ) : null}
      </div>
      <div role="status" aria-atomic="true">
        {state.status === "success" ? (
          <p key={count} id={id} className={text}>
            {state.message}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/**
 * `aria-invalid` and `aria-describedby` for one input, from the form's state.
 *
 * `hint` is the id of a standing description, kept whether or not there is an
 * error. The error is attached only to the field it names.
 */
export function fieldProps(
  state: State,
  name: string,
  feedbackId: string,
  hint?: string,
): { "aria-invalid"?: true; "aria-describedby"?: string } {
  const invalid = state.status === "error" && state.field === name;
  const describedBy = [invalid ? feedbackId : undefined, hint].filter(Boolean).join(" ");

  return {
    ...(invalid ? { "aria-invalid": true as const } : {}),
    ...(describedBy ? { "aria-describedby": describedBy } : {}),
  };
}

/**
 * The portal's control, against the graphite form ground.
 *
 * `border-steel-mid`, not `border-steel-dim`: the border is how a sighted
 * reader finds the field, SC 1.4.11 asks 3:1 of it, and steel-dim is 1.7:1 on
 * graphite. The same fix `Field.tsx` carries for the public forms. An invalid
 * field takes the signal-lift rule as well as `aria-invalid`, and the message
 * says what is wrong, so the colour is never the only signal.
 */
export const PORTAL_CONTROL =
  "min-h-6 min-w-0 border border-steel-mid bg-graphite px-4 py-3 text-chalk transition-colors duration-[140ms] ease-[var(--ease-control)] focus:border-signal-lift aria-[invalid=true]:border-signal-lift";
