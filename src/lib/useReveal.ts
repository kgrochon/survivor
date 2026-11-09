import { useEffect, useRef, useState } from "react";

/**
 * Scroll-reveal: returns a ref to attach to a DOM node and a boolean that
 * flips to `true` the first time the node intersects the viewport. Honours
 * `prefers-reduced-motion` by short-circuiting to visible immediately.
 */
export function useReveal<T extends Element = HTMLDivElement>(
  rootMargin = "0px 0px -10% 0px",
) {
  const ref = useRef<T | null>(null);
  // Decided once, up front: with reduced motion (or no observer) there is
  // nothing to wait for, so the node is visible from its first render.
  const [visible, setVisible] = useState(
    () =>
      typeof window !== "undefined" &&
      (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ||
        !("IntersectionObserver" in window)),
  );

  useEffect(() => {
    if (visible) return;
    const node = ref.current;
    if (!node) return;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            obs.disconnect();
            return;
          }
        }
      },
      { rootMargin, threshold: 0.05 },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [visible, rootMargin]);

  return { ref, visible } as const;
}
