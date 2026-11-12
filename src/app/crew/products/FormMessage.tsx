import type { PortalFormState } from "@/lib/portal/form-state";

/** The one sentence a portal form answers with. Same look on every form. */
export function FormMessage({ state }: { state: PortalFormState }) {
  if (state.status === "idle") return null;

  return (
    <p
      role={state.status === "error" ? "alert" : "status"}
      className="border-l-2 border-signal-lift bg-graphite px-5 py-3 text-base text-chalk"
    >
      {state.message}
    </p>
  );
}
