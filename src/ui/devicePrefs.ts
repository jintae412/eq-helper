// Per-device UI conveniences (dismissed cards). Not app data: losing these just re-shows a card.
const PREFIX = 'eq-helper/ui/';

export function isDismissed(key: string): boolean {
  try {
    return localStorage.getItem(PREFIX + key) === '1';
  } catch {
    return false; // private mode / blocked storage: just show the card
  }
}

export function dismiss(key: string): void {
  try {
    localStorage.setItem(PREFIX + key, '1');
  } catch {
    /* best effort */
  }
}

/** Opened from the home screen (installed) rather than in a browser tab. */
export const isInstalled = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;
