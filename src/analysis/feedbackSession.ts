export interface FeedbackAlert {
  id: number;
  freqHz: number;
  acknowledged: boolean; // "Got it": hidden until it clears and comes back
  lastSeen: number;
}

export interface FeedbackLogEntry {
  freqHz: number;
  count: number; // separate ringing episodes this session
  lastAt: number;
}

export interface FeedbackSnapshot {
  active: FeedbackAlert[]; // everything currently ringing (spectrum markers)
  visible: FeedbackAlert[]; // what the banner shows
  log: FeedbackLogEntry[]; // most frequent first
}

const SAME_OCTAVES = 1 / 12;
export const CLEAR_AFTER_MS = 3000;

const near = (a: number, b: number) => Math.abs(Math.log2(a / b)) < SAME_OCTAVES;

/**
 * Turns per-frame detections into alerts a human can act on: one alert per ringing episode,
 * auto-cleared once it stops, with a session log so recurring frequencies stand out.
 */
export class FeedbackSession {
  private alerts: FeedbackAlert[] = [];
  private entries: FeedbackLogEntry[] = [];
  private nextId = 1;

  /** Returns true when the snapshot changed (so the UI re-renders only when needed). */
  update(detections: readonly { freqHz: number }[], now: number): boolean {
    let changed = false;
    for (const d of detections) {
      const alert = this.alerts.find((a) => near(a.freqHz, d.freqHz));
      if (alert) {
        alert.lastSeen = now;
        continue;
      }
      this.alerts.push({ id: this.nextId++, freqHz: d.freqHz, acknowledged: false, lastSeen: now });
      const entry = this.entries.find((e) => near(e.freqHz, d.freqHz));
      if (entry) {
        entry.count++;
        entry.lastAt = now;
      } else {
        this.entries.push({ freqHz: d.freqHz, count: 1, lastAt: now });
      }
      changed = true;
    }
    const before = this.alerts.length;
    this.alerts = this.alerts.filter((a) => now - a.lastSeen <= CLEAR_AFTER_MS);
    return changed || this.alerts.length !== before;
  }

  acknowledge(id: number): boolean {
    const alert = this.alerts.find((a) => a.id === id);
    if (!alert || alert.acknowledged) return false;
    alert.acknowledged = true;
    return true;
  }

  /** "Not feedback": drop the alert and its log entry. */
  dismiss(id: number): FeedbackAlert | undefined {
    const alert = this.alerts.find((a) => a.id === id);
    if (!alert) return undefined;
    this.alerts = this.alerts.filter((a) => a !== alert);
    this.entries = this.entries.filter((e) => !near(e.freqHz, alert.freqHz));
    return alert;
  }

  snapshot(): FeedbackSnapshot {
    const active = this.alerts.map((a) => ({ ...a }));
    return {
      active,
      visible: active.filter((a) => !a.acknowledged),
      log: [...this.entries].sort((a, b) => b.count - a.count || b.lastAt - a.lastAt).map((e) => ({ ...e })),
    };
  }
}
