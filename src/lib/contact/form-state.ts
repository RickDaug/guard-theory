export type ContactTopic =
  | "correction"
  | "accessibility"
  | "product"
  | "press"
  | "other";

export type ContactFieldErrors = Partial<Record<string, string>>;

/**
 * Lives outside the "use server" module: every export from a server-actions
 * file must be an async function, so a constant exported from there is stripped
 * and arrives undefined on the client.
 */
export type ContactFormState = {
  status: "idle" | "success" | "error";
  message: string;
  errors: ContactFieldErrors;
};

export const CONTACT_INITIAL_STATE: ContactFormState = {
  status: "idle",
  message: "",
  errors: {},
};

export const TOPICS: Array<{ value: ContactTopic; label: string }> = [
  { value: "correction", label: "A correction to something we published" },
  { value: "accessibility", label: "Something on the site does not work for me" },
  { value: "product", label: "A question about the First Edition" },
  { value: "press", label: "Press or collaboration" },
  { value: "other", label: "Something else" },
];

export const TOPIC_VALUES = TOPICS.map((topic) => topic.value);
