import { useEffect, useRef, useState } from 'react';
import { buildAnswer } from '../advice/ask';
import {
  lookup, search, SOURCE_LABELS, SOURCE_TYPES, SYMPTOM_LABELS, symptomsFor,
  type KbEntry, type SourceType, type Symptom,
} from '../advice/knowledgeBase';
import type { MixerProfile } from '../advice/mixer';
import type { BandSetup } from '../advice/band';

interface Props {
  mixer: MixerProfile;
  band?: BandSetup;
  onGoToSetup: () => void;
}

interface SourceOption {
  key: string;
  label: string;
  type: SourceType;
}

export function AskScreen({ mixer, band, onGoToSetup }: Props) {
  const [sourceKey, setSourceKey] = useState<string | null>(null);
  const [symptom, setSymptom] = useState<Symptom | null>(null);
  const [query, setQuery] = useState('');
  const answersRef = useRef<HTMLDivElement>(null);

  // On a phone the answer lands below the fold; bring it into view after a chip tap.
  useEffect(() => {
    if (symptom) answersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [symptom]);

  const options: SourceOption[] = [
    ...(band?.sources.map((s) => ({ key: s.id, label: `${s.label || 'Unnamed'} · ${SOURCE_LABELS[s.type]}`, type: s.type })) ?? []),
    ...SOURCE_TYPES.map((t) => ({ key: t, label: SOURCE_LABELS[t], type: t })),
  ];
  const source = options.find((o) => o.key === sourceKey);
  const symptoms = source ? symptomsFor(source.type) : [];

  const entries: KbEntry[] = query.trim()
    ? search(query, source?.type).slice(0, 5)
    : source && symptom
      ? [lookup(source.type, symptom)].filter((e): e is KbEntry => e !== undefined)
      : [];

  function pickSource(key: string) {
    setSourceKey(key === sourceKey ? null : key);
    setSymptom(null);
  }

  return (
    <>
      <h1>Ask</h1>
      <p className="muted">
        Advice for <strong>{mixer.name || 'Untitled mixer'}</strong>{' '}
        <button className="link" onClick={onGoToSetup}>change</button>
      </p>

      <h2>What sounds off?</h2>
      <div className="chips" role="group" aria-label="Source">
        {options.map((o) => (
          <button key={o.key} className="chip" aria-pressed={o.key === sourceKey} onClick={() => pickSource(o.key)}>
            {o.label}
          </button>
        ))}
      </div>

      {source && (
        <>
          <h2>How does it sound?</h2>
          <div className="chips" role="group" aria-label="Symptom">
            {symptoms.map((s) => (
              <button key={s} className="chip" aria-pressed={s === symptom} onClick={() => setSymptom(s === symptom ? null : s)}>
                {SYMPTOM_LABELS[s]}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="row">
        <input
          type="search"
          placeholder={source ? `Or describe it, e.g. "sounds murky"` : 'Or describe it, e.g. "acoustic strings too loud"'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Describe the problem"
        />
      </div>

      {query.trim() && entries.length === 0 && (
        <p className="muted">No match. Try a simpler word like muddy, boomy, harsh, or thin, or pick from the buttons.</p>
      )}
      <div ref={answersRef}>
        {entries.map((e) => (
          <AnswerCard key={e.id} entry={e} source={source?.type ?? e.sources[0]} mixer={mixer} />
        ))}
      </div>
    </>
  );
}

function AnswerCard({ entry, source, mixer }: { entry: KbEntry; source: SourceType; mixer: MixerProfile }) {
  const a = buildAnswer(entry, source, mixer);
  const orTry = a.nonEqFixes.length > 0 && (
    <>
      <h3>Or try</h3>
      <ul>{a.nonEqFixes.map((f) => <li key={f}>{f}</li>)}</ul>
    </>
  );
  return (
    <article className="card">
      <h2>
        {SOURCE_LABELS[source]}: {entry.symptoms.map((s) => SYMPTOM_LABELS[s]).join(' / ')}
      </h2>
      {!a.reachable && orTry}
      <h3>Do this</h3>
      <ol>{a.steps.map((s) => <li key={s}>{s}</li>)}</ol>
      {a.ranges.map((r) => <p key={r} className="muted">{r}</p>)}
      {a.reachable && orTry}
      <h3>Why</h3>
      <p>{a.why}</p>
    </article>
  );
}
