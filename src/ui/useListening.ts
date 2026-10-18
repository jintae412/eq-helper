import { useEffect, useRef, useState } from 'react';
import { startCapture, type Capture } from '../audio/capture';
import { FeedbackDetector } from '../analysis/feedback';
import { FeedbackSession, type FeedbackSnapshot } from '../analysis/feedbackSession';

const ANALYSIS_INTERVAL_MS = 100; // detector thresholds assume ~10 frames/s
const EMPTY: FeedbackSnapshot = { active: [], visible: [], log: [] };

/** App-level mic + feedback detection, so alerts work on every tab. */
export function useListening() {
  const [capture, setCapture] = useState<Capture | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackSnapshot>(EMPTY);
  const detector = useRef(new FeedbackDetector());
  const session = useRef(new FeedbackSession());

  useEffect(() => {
    if (!capture) return;
    const id = setInterval(() => {
      const found = detector.current.update({ db: capture.read(), binHz: capture.binHz });
      if (session.current.update(found, performance.now())) setFeedback(session.current.snapshot());
    }, ANALYSIS_INTERVAL_MS);
    return () => clearInterval(id);
  }, [capture]);

  // Keep the screen awake while listening; a sleeping phone stops the mic.
  useEffect(() => {
    if (!capture || !('wakeLock' in navigator)) return;
    let lock: WakeLockSentinel | undefined;
    navigator.wakeLock.request('screen').then((l) => (lock = l), () => {});
    return () => void lock?.release();
  }, [capture]);

  async function start() {
    setError(null);
    try {
      setCapture(await startCapture());
    } catch (e) {
      const err = e as Error;
      setError(err.name === 'NotAllowedError' ? 'Microphone permission was denied. Allow it in Settings and try again.' : err.message);
    }
  }

  function stop() {
    capture?.stop();
    setCapture(null);
    detector.current = new FeedbackDetector();
    session.current = new FeedbackSession();
    setFeedback(EMPTY);
  }

  function acknowledge(id: number) {
    if (session.current.acknowledge(id)) setFeedback(session.current.snapshot());
  }

  function dismiss(id: number) {
    const alert = session.current.dismiss(id);
    if (!alert) return;
    detector.current.ignore(alert.freqHz);
    setFeedback(session.current.snapshot());
  }

  return { capture, error, start, stop, feedback, acknowledge, dismiss };
}

export type Listening = ReturnType<typeof useListening>;
