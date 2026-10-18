import { useEffect, useRef, useState, type ReactNode } from 'react';
import { saveRecording, startRecording, type Recording } from '../audio/recorder';
import { permanentFix } from '../advice/feedbackAdvice';
import { formatHz, type MixerProfile } from '../advice/mixer';
import { drawSpectrum } from '../spectrumView';
import type { Listening } from './useListening';

export type ListenView = 'mix' | 'guided';

interface Props {
  listening: Listening;
  mixer: MixerProfile;
  view: ListenView;
  onViewChange: (v: ListenView) => void;
  children?: ReactNode;
}

export function ListenScreen({ listening, mixer, view, onViewChange, children }: Props) {
  const { capture, error, feedback } = listening;
  const [recording, setRecording] = useState<Recording | null>(null);
  const [recordError, setRecordError] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const marksRef = useRef<number[]>([]);
  marksRef.current = feedback.active.map((a) => a.freqHz);

  useEffect(() => {
    if (!capture) return;
    let raf = 0;
    const tick = () => {
      if (canvasRef.current) drawSpectrum(canvasRef.current, capture.read(), capture.binHz, marksRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [capture]);

  function stop() {
    recording?.stop(); // discard an in-progress clip
    setRecording(null);
    listening.stop();
  }

  async function toggleRecording() {
    if (!capture) return;
    setRecordError(null);
    if (recording) {
      const blob = recording.stop(); // sync: share must happen inside this tap
      setRecording(null);
      await saveRecording(blob, label).catch((e: Error) => setRecordError(e.message));
      return;
    }
    try {
      setRecording(await startRecording(capture.ctx, capture.source));
    } catch (e) {
      setRecordError((e as Error).message);
    }
  }

  return (
    <>
      <h1>Listen</h1>
      <div className="row">
        {capture ? (
          <button className="quiet" onClick={stop}>Stop listening</button>
        ) : (
          <button onClick={listening.start}>Start listening</button>
        )}
      </div>
      {error && <p className="error">{error}</p>}

      <canvas ref={canvasRef} width={1000} height={400} />

      <div className="segmented wide" role="group" aria-label="Listen mode">
        <button aria-pressed={view === 'mix'} onClick={() => onViewChange('mix')}>Full mix</button>
        <button aria-pressed={view === 'guided'} onClick={() => onViewChange('guided')}>Guided check</button>
      </div>

      {children}

      {feedback.log.length > 0 && (
        <>
          <h2>Feedback this session</h2>
          <ul className="log">
            {feedback.log.map((e) => (
              <li key={e.freqHz}>
                <strong>{formatHz(e.freqHz)}</strong> rang {e.count}×
                {e.count >= 2 && <div className="muted">Keeps coming back. {permanentFix(e.freqHz, mixer.outputs)}</div>}
              </li>
            ))}
          </ul>
        </>
      )}

      {capture && (
        <>
          <h2>Record a test clip</h2>
          <div className="row">
            <input placeholder="Label, e.g. keys-pad or acoustic-boomy" value={label} onChange={(e) => setLabel(e.target.value)} />
            <button className={recording ? 'danger' : ''} onClick={toggleRecording}>
              {recording ? 'Stop & save' : 'Record'}
            </button>
          </div>
          {recordError && <p className="error">{recordError}</p>}

          <details>
            <summary>Mic settings the browser applied</summary>
            <p>
              Want <code>autoGainControl</code>, <code>echoCancellation</code> and <code>noiseSuppression</code> all
              false (or missing). <code>true</code> means the browser is still processing the mic.
            </p>
            <pre>{JSON.stringify(capture.settings, null, 2)}</pre>
          </details>
        </>
      )}
    </>
  );
}
