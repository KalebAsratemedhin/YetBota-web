"use client";
import { useEffect, useRef, useState } from "react";

export function useInView<T extends Element = HTMLDivElement>({
  threshold = 0.2,
  once = false,
}: { threshold?: number; once?: boolean } = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once && entry.boundingClientRect.top > 0) {
          // Only reset once the element is back below the viewport, so reveals
          // play when scrolling down and stay put when scrolling back up.
          setInView(false);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  return { ref, inView };
}
