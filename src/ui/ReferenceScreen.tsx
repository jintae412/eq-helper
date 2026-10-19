import { Fragment, useState } from 'react';
import { SOURCE_LABELS, SOURCE_TYPES, type SourceType } from '../advice/knowledgeBase';
import { formatHz } from '../advice/mixer';
import { logPercent, REFERENCE } from '../advice/reference';

const AXIS_HZ = [20, 100, 1000, 10000, 20000];

export function ReferenceScreen() {
  const [source, setSource] = useState<SourceType>('male-vocal');

  return (
    <>
      <h1>Reference</h1>
      <p className="muted">Where each sound lives, and when to boost or cut there. These are starting points: every voice, instrument and room is different, so sweep nearby and trust your ears.</p>

      <details>
        <summary>EQ basics in 30 seconds</summary>
        <ul>
          <li><strong>Cut before you boost.</strong> Removing what's bad usually sounds better, and boosting a mic raises feedback risk.</li>
          <li><strong>Small moves.</strong> 2–3 dB is a noticeable change. Over 6 dB usually means something else is wrong (mic placement, level, the instrument itself).</li>
          <li><strong>Cut narrow, boost wide.</strong> A problem tone is often narrow, so a tight cut removes it cleanly. Boosts sound more natural when broad.</li>
          <li><strong>High-pass filter (HPF) almost everything</strong> except bass and kick. It removes rumble you can't hear but the speakers still have to play.</li>
          <li><strong>Hz</strong> is pitch (low numbers = bass, high = treble). <strong>dB</strong> is how much louder or quieter.</li>
        </ul>
      </details>

      <div className="chips" role="group" aria-label="Source">
        {SOURCE_TYPES.map((t) => (
          <button key={t} className="chip" aria-pressed={t === source} onClick={() => setSource(t)}>
            {SOURCE_LABELS[t]}
          </button>
        ))}
      </div>

      <h2>{SOURCE_LABELS[source]}</h2>
      <div className="card freq-chart" role="img"
        aria-label={`Frequency chart for ${SOURCE_LABELS[source]}: ${REFERENCE[source].map((r) => `${r.name} ${formatHz(r.hz[0])} to ${formatHz(r.hz[1])}`).join(', ')}.`}>
        <span />
        <div className="freq-axis">
          {AXIS_HZ.map((hz) => <span key={hz} style={{ left: `${logPercent(hz)}%` }}>{formatHz(hz)}</span>)}
        </div>
        {REFERENCE[source].map((r) => (
          <Fragment key={r.name}>
            <span className="freq-label">{r.name}</span>
            <div className="freq-bar">
              <span style={{ left: `${logPercent(r.hz[0])}%`, width: `${logPercent(r.hz[1]) - logPercent(r.hz[0])}%` }} />
            </div>
          </Fragment>
        ))}
      </div>
      {REFERENCE[source].map((r) => (
        <article key={r.name} className="card secondary ref-row">
          <h3>{formatHz(r.hz[0])}–{formatHz(r.hz[1])} <span className="muted">· {r.name}</span></h3>
          <p><strong className="boost">Boost</strong> {r.boost}</p>
          <p><strong className="cut">Cut</strong> {r.cut}</p>
        </article>
      ))}
    </>
  );
}
