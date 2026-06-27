import { useEffect, useRef } from 'react';

export function useFocusTrap(isActive: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;
    const modal = ref.current;
    if (!modal) return;

    // Capture the element that had focus before the modal opened
    previousFocus.current = document.activeElement as HTMLElement;

    // Wait a brief moment for the modal contents/animations to render
    const timeout = setTimeout(() => {
      const focusableElements = Array.from(
        modal.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true');

      if (focusableElements.length === 0) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      // Auto focus the first element initially
      first.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === first) {
              last.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === last) {
              first.focus();
              e.preventDefault();
            }
          }
        }
      };

      modal.addEventListener('keydown', handleKeyDown);
      // Clean up event listener when effect reruns or component unmounts
      // Store the cleanup function on the modal object to ensure we don't leak
      (modal as any)._focusTrapCleanup = () => modal.removeEventListener('keydown', handleKeyDown);
    }, 100);

    return () => {
      clearTimeout(timeout);
      if (modal && (modal as any)._focusTrapCleanup) {
        (modal as any)._focusTrapCleanup();
      }
      // Restore focus to the element that originally triggered the modal
      if (previousFocus.current && typeof previousFocus.current.focus === 'function') {
        // Use a small timeout to ensure the modal has unmounted and the element is interactive
        setTimeout(() => {
          previousFocus.current?.focus();
        }, 10);
      }
    };
  }, [isActive]);

  return ref;
}
