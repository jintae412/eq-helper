import { useState } from 'react';
import type { FeedbackAlert } from '../analysis/feedbackSession';
import type { BandSetup } from '../advice/band';
import { feedbackSteps } from '../advice/feedbackAdvice';
import { formatHz, type RigOutputs } from '../advice/mixer';

interface Props {
  alerts: FeedbackAlert[];
  outputs: RigOutputs;
  band?: BandSetup;
  onAcknowledge: (id: number) => void;
  onDismiss: (id: number) => void;
}

const MAX_SHOWN = 2;

/** Sticky, non-modal: everything underneath stays usable. */
export function FeedbackBanner({ alerts, outputs, band, onAcknowledge, onDismiss }: Props) {
  if (alerts.length === 0) return null;
  return (
    <div className="banner" role="alert">
      {alerts.slice(0, MAX_SHOWN).map((a) => (
        <BannerItem key={a.id} alert={a} steps={feedbackSteps(a.freqHz, outputs, band)}
          onAcknowledge={() => onAcknowledge(a.id)} onDismiss={() => onDismiss(a.id)} />
      ))}
      {alerts.length > MAX_SHOWN && <p className="muted">+{alerts.length - MAX_SHOWN} more ringing</p>}
    </div>
  );
}

function BannerItem({ alert, steps, onAcknowledge, onDismiss }: {
  alert: FeedbackAlert; steps: string[]; onAcknowledge: () => void; onDismiss: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="banner-item">
      <strong>Feedback at {formatHz(alert.freqHz)}</strong>
      <p>{steps[0]}</p>
      {expanded && <ol>{steps.slice(1).map((s) => <li key={s}>{s}</li>)}</ol>}
      <div className="row">
        <button className="quiet" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>
          {expanded ? 'Fewer steps' : 'More steps'}
        </button>
        <button onClick={onAcknowledge}>Got it</button>
        <button className="quiet" onClick={onDismiss}>Not feedback</button>
      </div>
    </div>
  );
}
