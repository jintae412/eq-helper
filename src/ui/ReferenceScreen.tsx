import { Fragment, useState } from 'react';
import { SOURCE_LABELS, SOURCE_TYPES, type SourceType } from '../advice/knowledgeBase';
import { formatHz } from '../advice/mixer';
import { logPercent, NOTE_RANGES, REFERENCE } from '../advice/reference';

// 1-2-5 steps per decade: dense enough to read a range off, sparse enough to fit on a phone.
// No 20k label: it would collide with 10k, and the chart's right edge is 20 kHz anyway.
const TICKS_HZ = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
const isDecade = (hz: number) => Number.isInteger(Math.log10(hz));
const tickLabel = (hz: number) => (hz >= 1000 ? `${hz / 1000}k` : `${hz}`);

const Axis = () => (
  <>
    <span className="freq-spacer" />
    <div className="freq-axis">
      {TICKS_HZ.map((hz) => (
        <span key={hz} className={isDecade(hz) ? 'major' : undefined} style={{ left: `${logPercent(hz)}%` }}>{tickLabel(hz)}</span>
      ))}
    </div>
  </>
);

const Bar = ({ hz, className }: { hz: [number, number]; className?: string }) => (
  <div className="freq-bar">
    <span className={`fill${className ? ` ${className}` : ''}`}
      style={{ left: `${logPercent(hz[0])}%`, width: `${logPercent(hz[1]) - logPercent(hz[0])}%` }} />
    {TICKS_HZ.slice(1).map((t) => (
      <i key={t} className={isDecade(t) ? 'tick major' : 'tick'} style={{ left: `${logPercent(t)}%` }} />
    ))}
  </div>
);

export function ReferenceScreen() {
  const [source, setSource] = useState<SourceType>('male-vocal');
  const notes = NOTE_RANGES[source];

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
        <Axis />
        {notes && (
          <>
            <span className="freq-label"><strong>Notes played</strong></span>
            <Bar hz={notes} className="notes" />
          </>
        )}
        {REFERENCE[source].map((r) => (
          <Fragment key={r.name}>
            <span className="freq-label">{r.name}</span>
            <Bar hz={r.hz} />
          </Fragment>
        ))}
        <Axis />
      </div>
      <p className="muted">Frequencies in Hz, from 20 Hz on the left to 20 kHz on the right (k = thousand, so 2k = 2,000 Hz). Brighter lines mark 100 Hz, 1k and 10k.</p>
      {notes && (
        <p className="muted">
          <strong>Notes played</strong> ({formatHz(notes[0])}–{formatHz(notes[1])}) is where the actual pitches are. Everything above
          that is overtones, which carry the character. A high-pass filter just under the lowest note is safe.
        </p>
      )}
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
