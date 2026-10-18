import type { BalanceFinding } from './balance';

export interface TrackedIssue {
  key: string;
  finding: BalanceFinding;
}

export interface BalanceHistoryEntry {
  key: string;
  finding: BalanceFinding; // last seen version
  count: number; // times it was confirmed this session
  lastAt: number;
}

export interface BalanceSnapshot {
  current: TrackedIssue[]; // confirmed, worst first
  history: BalanceHistoryEntry[]; // cleared issues, most recent first
}

interface State {
  finding: BalanceFinding;
  streak: number;
  missing: number;
  confirmed: boolean;
}

// Coarse key so a bump drifting 250 → 315 Hz is still "the same" issue.
const keyOf = (f: BalanceFinding) => `${f.direction}:${f.region}`;

/**
 * Stops cards flickering: an issue must show up `confirmations` checks in a row before it's shown
 * (known room issues: immediately), and must be absent that many checks before it clears into history.
 */
export class BalanceTracker {
  private states = new Map<string, State>();
  private history = new Map<string, BalanceHistoryEntry>();

  update(findings: BalanceFinding[], now: number, confirmations: number): void {
    const seen = new Set<string>();
    for (const f of findings) {
      const key = keyOf(f);
      if (seen.has(key)) continue; // findings are sorted worst-first; keep the worst per key
      seen.add(key);
      const s = this.states.get(key) ?? { finding: f, streak: 0, missing: 0, confirmed: false };
      s.finding = f;
      s.streak++;
      s.missing = 0;
      if (!s.confirmed && (s.streak >= confirmations || f.knownRoomIssue)) {
        s.confirmed = true;
        this.record(key, f, now);
      }
      this.states.set(key, s);
    }

    for (const [key, s] of this.states) {
      if (seen.has(key)) continue;
      s.streak = 0;
      s.missing++;
      if (!s.confirmed || s.missing >= confirmations) this.states.delete(key);
    }
  }

  private record(key: string, finding: BalanceFinding, now: number): void {
    const h = this.history.get(key);
    this.history.set(key, { key, finding, count: (h?.count ?? 0) + 1, lastAt: now });
  }

  /** Mode switch (music ↔ speech): different content, start fresh but keep the log. */
  clearCurrent(): void {
    this.states.clear();
  }

  snapshot(): BalanceSnapshot {
    const current = [...this.states]
      .filter(([, s]) => s.confirmed)
      .map(([key, s]) => ({ key, finding: s.finding }))
      .sort((a, b) => b.finding.score - a.finding.score);
    const showing = new Set(current.map((c) => c.key));
    const history = [...this.history.values()]
      .filter((h) => !showing.has(h.key))
      .sort((a, b) => b.lastAt - a.lastAt);
    return { current, history };
  }
}
