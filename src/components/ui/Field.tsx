import type { ComponentPropsWithoutRef, ReactNode } from "react";

/**
 * One field, one job. The label labels, the hint demonstrates, the error says
 * what went wrong and how to fix it — nothing quietly does double duty, and the
 * hint is never used as a substitute for a label.
 *
 * The input is always programmatically tied to its label, its hint and its
 * error via ids, so the description a sighted reader gets is the description a
 * screen reader gets.
 */

type FieldShellProps = {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  children: (props: {
    id: string;
    "aria-describedby": string | undefined;
    "aria-invalid": boolean | undefined;
  }) => ReactNode;
};

export function FieldShell({
  id,
  label,
  hint,
  error,
  optional,
  children,
}: FieldShellProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="display-plain text-sm text-chalk">
        {label}
        {optional ? (
          <span className="ml-2 text-steel">Optional</span>
        ) : null}
      </label>

      {hint ? (
        <p id={hintId} className="text-sm text-steel">
          {hint}
        </p>
      ) : null}

      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      })}

      {error ? (
        <p id={errorId} className="notation text-xs text-signal-lift">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const CONTROL =
  "w-full border bg-graphite px-4 py-3 text-base text-chalk placeholder:text-steel transition-colors duration-[140ms] ease-[var(--ease-control)] focus:border-signal-lift";

type TextFieldProps = {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
} & Omit<ComponentPropsWithoutRef<"input">, "id">;

export function TextField({
  id,
  label,
  hint,
  error,
  optional,
  className = "",
  ...rest
}: TextFieldProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional}>
      {(a11y) => (
        <input
          {...a11y}
          {...rest}
          className={`${CONTROL} ${
            error ? "border-signal-lift" : "border-steel-dim"
          } ${className}`}
        />
      )}
    </FieldShell>
  );
}

type TextAreaFieldProps = {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
} & Omit<ComponentPropsWithoutRef<"textarea">, "id">;

export function TextAreaField({
  id,
  label,
  hint,
  error,
  optional,
  className = "",
  rows = 7,
  ...rest
}: TextAreaFieldProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional}>
      {(a11y) => (
        <textarea
          {...a11y}
          {...rest}
          rows={rows}
          className={`${CONTROL} resize-y ${
            error ? "border-signal-lift" : "border-steel-dim"
          } ${className}`}
        />
      )}
    </FieldShell>
  );
}

type SelectFieldProps = {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"select">, "id" | "children">;

export function SelectField({
  id,
  label,
  hint,
  error,
  optional,
  className = "",
  children,
  ...rest
}: SelectFieldProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional}>
      {(a11y) => (
        <select
          {...a11y}
          {...rest}
          className={`${CONTROL} ${
            error ? "border-signal-lift" : "border-steel-dim"
          } ${className}`}
        >
          {children}
        </select>
      )}
    </FieldShell>
  );
}

type CheckboxFieldProps = {
  id: string;
  label: ReactNode;
  error?: string;
} & Omit<ComponentPropsWithoutRef<"input">, "id" | "type">;

/**
 * Never pre-checked. Consent is something the reader gives, not something the
 * form assumes.
 */
export function CheckboxField({
  id,
  label,
  error,
  className = "",
  ...rest
}: CheckboxFieldProps) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id={id}
          aria-describedby={errorId}
          aria-invalid={error ? true : undefined}
          className={`mt-1 size-4 shrink-0 accent-signal ${className}`}
          {...rest}
        />
        <label htmlFor={id} className="text-sm text-steel">
          {label}
        </label>
      </div>
      {error ? (
        <p id={errorId} className="notation text-xs text-signal-lift">
          {error}
        </p>
      ) : null}
    </div>
  );
}
