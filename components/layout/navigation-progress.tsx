"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function ProgressBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;

  const [visible, setVisible] = useState(false);
  const [scale, setScale] = useState(0);
  const timerRef = useRef<number | null>(null);
  const finishTimerRef = useRef<number | null>(null);
  const lastRouteRef = useRef(routeKey);

  useEffect(() => {
    if (lastRouteRef.current !== routeKey) {
      lastRouteRef.current = routeKey;
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (finishTimerRef.current) window.clearTimeout(finishTimerRef.current);
      setScale(1);
      finishTimerRef.current = window.setTimeout(() => {
        setVisible(false);
        setScale(0);
      }, 140);
    }
  }, [routeKey]);

  useEffect(() => {
    const onDocumentClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      const anchor = (e.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;
      if (anchor.hasAttribute("data-no-progress")) return;
      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        anchor.hasAttribute("download") ||
        anchor.getAttribute("target") === "_blank"
      ) {
        return;
      }

      try {
        const dest = new URL(anchor.href, window.location.href);
        if (dest.origin !== window.location.origin) return;
        if (dest.pathname === window.location.pathname && dest.search === window.location.search) {
          return;
        }
      } catch {
        return;
      }

      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (finishTimerRef.current) window.clearTimeout(finishTimerRef.current);

      setVisible(true);
      setScale(0.35);
      timerRef.current = window.setTimeout(() => setScale(0.78), 160);
      finishTimerRef.current = window.setTimeout(() => {
        setVisible(false);
        setScale(0);
      }, 6000);
    };

    document.addEventListener("click", onDocumentClick, { capture: true });
    return () => {
      document.removeEventListener("click", onDocumentClick, { capture: true });
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (finishTimerRef.current) window.clearTimeout(finishTimerRef.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden"
    >
      <div
        className="h-full w-full origin-left bg-[#A3E635] transition-transform duration-150 ease-out motion-reduce:transition-none"
        style={{ transform: `scaleX(${scale})` }}
      />
    </div>
  );
}

export function NavigationProgressBar() {
  return (
    <Suspense fallback={null}>
      <ProgressBarInner />
    </Suspense>
  );
}
