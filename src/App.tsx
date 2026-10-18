import { useEffect, useRef, useState } from 'react';
import { startCapture, type Capture } from './audio/capture';
import { saveRecording, startRecording, type Recording } from './audio/recorder';
import { FeedbackDetector, type FeedbackDetection } from './analysis/feedback';
import { drawSpectrum } from './spectrumView';

const ANALYSIS_INTERVAL_MS = 100; // detector thresholds assume ~10 frames/s

export function App() {
  const [capture, setCapture] = useState<Capture | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackDetection[]>([]);
  const [recording, setRecording] = useState<Recording | null>(null);
  const [label, setLabel] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef(new FeedbackDetector());

  useEffect(() => {
    if (!capture) return;
    let raf = 0;
    let lastAnalysis = 0;
    let marks: number[] = [];
    const tick = (t: number) => {
      const db = capture.read();
      if (t - lastAnalysis >= ANALYSIS_INTERVAL_MS) {
        lastAnalysis = t;
        const found = detectorRef.current.update({ db, binHz: capture.binHz });
        marks = found.map((f) => f.freqHz);
        setFeedback(found);
      }
      if (canvasRef.current) drawSpectrum(canvasRef.current, db, capture.binHz, marks);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
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
    recording?.stop();
    setRecording(null);
    capture?.stop();
    setCapture(null);
    setFeedback([]);
    detectorRef.current = new FeedbackDetector();
  }

  async function toggleRecording() {
    if (!capture) return;
    if (recording) {
      const blob = recording.stop(); // sync: share must happen inside this tap
      setRecording(null);
      await saveRecording(blob, label).catch((e: Error) => setError(e.message));
      return;
    }
    try {
      setRecording(await startRecording(capture.ctx, capture.source));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <main>
      <h1>EQ Helper</h1>
      <p>Phase 0 test build: live spectrum, mic check, feedback detection, recorder.</p>

      <div className="row">
        {capture ? (
          <button className="quiet" onClick={stop}>Stop listening</button>
        ) : (
          <button onClick={start}>Start listening</button>
        )}
      </div>
      {error && <p className="error">{error}</p>}

      <canvas ref={canvasRef} width={1000} height={400} />

      {feedback.map((f) => (
        <div key={Math.round(f.freqHz)} className="row feedback">
          <strong>Possible feedback at {Math.round(f.freqHz)} Hz</strong>
          <span>confidence {Math.round(f.confidence * 100)}%</span>
          <button className="quiet" onClick={() => detectorRef.current.ignore(f.freqHz)}>
            That wasn't feedback
          </button>
        </div>
      ))}

      {capture && (
        <>
          <h2>Record a test clip</h2>
          <div className="row">
            <input placeholder="Label, e.g. keys-pad or acoustic-boomy" value={label} onChange={(e) => setLabel(e.target.value)} />
            <button className={recording ? 'danger' : ''} onClick={toggleRecording}>
              {recording ? 'Stop & save' : 'Record'}
            </button>
          </div>

          <h2>Mic settings the browser applied</h2>
          <p>
            Want <code>autoGainControl</code>, <code>echoCancellation</code> and <code>noiseSuppression</code> all
            false (or missing). <code>true</code> means the browser is still processing the mic.
          </p>
          <pre>{JSON.stringify(capture.settings, null, 2)}</pre>
        </>
      )}
    </main>
  );
}
