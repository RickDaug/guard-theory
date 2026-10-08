"use client";

import { Button } from "@/components/ui/Button";

/** Opens the browser's print dialog. The page's print styles do the rest. */
export function PrintButton() {
  return (
    <Button type="button" onClick={() => window.print()}>
      Print
    </Button>
  );
}
