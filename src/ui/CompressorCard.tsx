import { beforeAfter, type CompressorAdvice } from '../advice/compressorAdvice';

export function CompressorCard({ advice, previousSwingDb }: { advice: CompressorAdvice; previousSwingDb?: number }) {
  const compare = previousSwingDb !== undefined && <p><strong>{beforeAfter(previousSwingDb, advice.swingDb)}</strong></p>;
  if (!advice.needed) {
    return (
      <div className="muted">
        {compare}
        <p>Dynamics: fine (level swings about {Math.round(advice.swingDb)} dB). No compressor needed.</p>
      </div>
    );
  }
  return (
    <article className="card">
      <h3>{advice.title} <span className="muted">· swings about {Math.round(advice.swingDb)} dB</span></h3>
      {compare}
      {advice.notes.map((n) => <p key={n} className="note">{n}</p>)}
      <ol>{advice.steps.map((s) => <li key={s}>{s}</li>)}</ol>
      <details>
        <summary>Why</summary>
        <p>{advice.why}</p>
      </details>
    </article>
  );
}
