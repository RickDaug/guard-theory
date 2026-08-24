"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/portal/session";
import { query } from "@/lib/db/client";
import { transitionOrder, getOrder, getOrderItems, toEmailShape } from "@/lib/orders/manage";
import type { OrderStatus } from "@/lib/orders/manage";
import { refundOrder } from "@/lib/orders/refund";
import { reconcileStripeSessions, recordReconcileRun } from "@/lib/orders/reconcile";
import { sendEmail } from "@/lib/mail";
import {
  orderConfirmation,
  orderInProcess,
  orderShipped,
} from "@/lib/mail/templates";
import { portalUrl } from "@/lib/portal/routes";
import { buyUspsLabel, isShippoConfigured, refreshLabelUrl } from "@/lib/shipping/shippo";
import type { PortalFormState } from "@/lib/portal/form-state";

/** Every action authorises itself. A proxy matcher is not a boundary for these. */

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function revalidateOrders(id?: string): void {
  revalidatePath(portalUrl("/orders"));
  if (id) {
    revalidatePath(portalUrl(`/orders/${id}`));
  }
}

export async function advanceOrder(
  _previous: PortalFormState,
  formData: FormData,
): Promise<PortalFormState> {
  await requireSession();

  const id = text(formData, "id");
  const to = text(formData, "to") as OrderStatus;

  if (!id || !to) {
    return { status: "error", message: "That order could not be identified." };
  }

  const result = await transitionOrder(id, to);

  if (!result.ok) {
    return { status: "error", message: result.reason };
  }

  revalidateOrders(id);

  return {
    status: "success",
    message: result.emailed
      ? "Moved, and the customer has been told."
      : "Moved. The email did not send — there is a Resend button on the order.",
  };
}

/** Tracking typed in by hand, for a label bought outside the portal. */
export async function setTracking(
  _previous: PortalFormState,
  formData: FormData,
): Promise<PortalFormState> {
  await requireSession();

  const id = text(formData, "id");
  const number = text(formData, "trackingNumber");
  const carrier = text(formData, "trackingCarrier") || "USPS";

  if (!id) {
    return { status: "error", message: "That order could not be identified." };
  }

  if (!number) {
    return { status: "error", message: "Enter the tracking number." };
  }

  const url =
    carrier.toUpperCase() === "USPS"
      ? `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(number)}`
      : null;

  await query(
    `update "order" set tracking_number = $2, tracking_carrier = $3, tracking_url = $4 where id = $1`,
    [id, number, carrier, url],
  );

  revalidateOrders(id);
  return { status: "success", message: "Tracking saved. You can mark this shipped now." };
}

export async function issueRefund(
  _previous: PortalFormState,
  formData: FormData,
): Promise<PortalFormState> {
  await requireSession();

  const id = text(formData, "id");
  const raw = text(formData, "amount");

  if (!id) {
    return { status: "error", message: "That order could not be identified." };
  }

  let amountCents: number | undefined;

  if (raw !== "") {
    const cleaned = raw.replace(/[$,\s]/g, "");

    if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
      return { status: "error", message: "Write the amount as a number, like 20 or 20.00." };
    }

    const [whole, fraction = ""] = cleaned.split(".");
    amountCents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  }

  const result = await refundOrder(id, amountCents);

  if (!result.ok) {
    return { status: "error", message: result.reason };
  }

  revalidateOrders(id);

  return {
    status: "success",
    message:
      result.status === "full"
        ? "Refunded in full. The money goes back to the card it came from."
        : "Partly refunded. The money goes back to the card it came from.",
  };
}

/** Sends a message again after a provider failure. */
export async function resendEmail(
  _previous: PortalFormState,
  formData: FormData,
): Promise<PortalFormState> {
  await requireSession();

  const id = text(formData, "id");
  const template = text(formData, "template");
  const order = id ? await getOrder(id) : undefined;

  if (!order) {
    return { status: "error", message: "That order could not be identified." };
  }

  const shape = toEmailShape(order, await getOrderItems(order.id));
  let sent = false;

  if (template === "order-confirmation") {
    sent = await sendEmail("order-confirmation", orderConfirmation(shape), order.id);
  } else if (template === "order-in-process") {
    sent = await sendEmail("order-in-process", orderInProcess(shape), order.id);
  } else if (template === "order-shipped") {
    if (!order.tracking_number) {
      return { status: "error", message: "There is no tracking number to send." };
    }
    sent = await sendEmail(
      "order-shipped",
      orderShipped(shape, {
        number: order.tracking_number,
        url: order.tracking_url,
        carrier: order.tracking_carrier,
      }),
      order.id,
    );
  } else {
    return { status: "error", message: "That is not a message this order sends." };
  }

  revalidateOrders(order.id);

  return sent
    ? { status: "success", message: "Sent." }
    : { status: "error", message: "It did not send. The reason is on the order, under Messages." };
}

/** Clears a flag once the owner has dealt with whatever it was for. */
export async function clearFlag(formData: FormData): Promise<void> {
  await requireSession();

  const id = text(formData, "id");

  if (id) {
    await query(`update "order" set flagged_reason = null where id = $1`, [id]);
    revalidateOrders(id);
  }
}

export async function runReconcile(
  _previous: PortalFormState,
  _formData: FormData,
): Promise<PortalFormState> {
  await requireSession();

  const report = await reconcileStripeSessions();
  await recordReconcileRun(report).catch(() => {});

  revalidateOrders();

  if (report.created > 0) {
    return {
      status: "success",
      message:
        report.created === 1
          ? "One paid order the webhook had missed was recovered. It is flagged for you to look at."
          : `${report.created} paid orders the webhook had missed were recovered. They are flagged for you to look at.`,
    };
  }

  return {
    status: "success",
    message: `Checked ${report.scanned} recent payment${report.scanned === 1 ? "" : "s"}. Nothing was missing.`,
  };
}


/**
 * Buys a USPS label and attaches its tracking to the order.
 *
 * The transaction id is what gets stored, not the label URL: Shippo's
 * `label_url` is a pre-signed link with an undocumented expiry, so treating it
 * as permanent is a bug that only shows up weeks later. `labelLink` below
 * re-fetches a fresh one when someone actually wants to print.
 */
export async function buyLabel(
  _previous: PortalFormState,
  formData: FormData,
): Promise<PortalFormState> {
  await requireSession();

  const id = text(formData, "id");

  if (!id) {
    return { status: "error", message: "That order could not be identified." };
  }

  if (!isShippoConfigured()) {
    return {
      status: "error",
      message: "Shippo is not connected yet, so no label can be bought. Paste a tracking number instead.",
    };
  }

  const order = await getOrder(id);

  if (!order) {
    return { status: "error", message: "That order no longer exists." };
  }

  if (order.tracking_number) {
    // Buying a second label for the same parcel is real money and two barcodes
    // on one box. Refuse rather than let a double-click cost postage.
    return {
      status: "error",
      message: "This order already has a tracking number. Clear it first if the label was wrong.",
    };
  }

  let label;

  try {
    label = await buyUspsLabel(
      {
        name: order.ship_name,
        street1: order.ship_line1,
        street2: order.ship_line2,
        city: order.ship_city,
        state: order.ship_state,
        zip: order.ship_postal,
        country: order.ship_country,
        phone: order.phone,
        email: order.email,
      },
      order.id,
    );
  } catch (error) {
    console.error(
      "[guard-theory] label purchase failed:",
      error instanceof Error ? error.message : error,
    );
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "The label could not be bought. Nothing has been charged.",
    };
  }

  await query(
    `update "order"
        set tracking_number = $2, tracking_carrier = $3, tracking_url = $4,
            label_url = $5, shippo_transaction_id = $6
      where id = $1`,
    [
      order.id,
      label.trackingNumber,
      label.carrier,
      label.trackingUrl,
      label.labelUrl,
      label.transactionId,
    ],
  );

  revalidateOrders(order.id);

  return {
    status: "success",
    message: `Label bought, ${label.amount} ${label.currency}. Print it, then mark this shipped.`,
  };
}

/** A freshly-signed link to the label PDF, because the stored one expires. */
export async function labelLink(formData: FormData): Promise<void> {
  await requireSession();

  const id = text(formData, "id");
  const order = id ? await getOrder(id) : undefined;

  if (!order?.shippo_transaction_id) {
    return;
  }

  const fresh = await refreshLabelUrl(order.shippo_transaction_id);

  if (fresh && fresh !== order.label_url) {
    await query(`update "order" set label_url = $2 where id = $1`, [order.id, fresh]);
    revalidateOrders(order.id);
  }
}
