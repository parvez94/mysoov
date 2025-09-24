// Reusable hook to ensure a minimum loader display time per loading cycle
// Usage: const showLoader = useMinLoading(isLoading, 1200);
import { useEffect, useRef, useState } from 'react';

export function useMinLoading(isLoading, minDuration = 800) {
  const [show, setShow] = useState(false);
  const startRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // When loading starts, immediately show and mark start time
    if (isLoading) {
      startRef.current = Date.now();
      setShow(true);
      // Clear any previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // When loading finishes, keep spinner until minDuration has elapsed
    if (!isLoading && show) {
      const elapsed = startRef.current ? Date.now() - startRef.current : 0;
      const remaining = Math.max(0, minDuration - elapsed);
      timeoutRef.current = setTimeout(() => {
        setShow(false);
        timeoutRef.current = null;
      }, remaining);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isLoading, minDuration, show]);

  // If no loading has occurred yet, keep it false by default
  return show;
}
