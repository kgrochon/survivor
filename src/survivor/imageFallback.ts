import type { SyntheticEvent } from "react";

/**
 * Neutral silhouette shown when a cast photo (hot-linked from a third-party
 * CDN) fails to load. Inlined as a data URI so it never makes another
 * request that could also fail.
 */
const FALLBACK_PHOTO =
  "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20100%20100'%3E%3Crect%20width='100'%20height='100'%20fill='%23D4CABB'/%3E%3Ccircle%20cx='50'%20cy='40'%20r='18'%20fill='%238C8578'/%3E%3Crect%20x='22'%20y='62'%20width='56'%20height='40'%20rx='28'%20fill='%238C8578'/%3E%3C/svg%3E";

/**
 * Swap a broken cast photo for the neutral placeholder. The dataset guard
 * stops us looping if the fallback itself somehow fails to load.
 */
export function handleImageError(e: SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (img.dataset.fallback === "true") return;
  img.dataset.fallback = "true";
  img.src = FALLBACK_PHOTO;
}
