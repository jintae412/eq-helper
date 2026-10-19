import { COMPRESSOR_STARTS, KB, SOURCE_LABELS, SYMPTOM_DESCRIPTIONS, SYMPTOM_LABELS, type KbMove, type SourceType, type Symptom } from './knowledgeBase';
import { formatHz } from './mixer';
import { REFERENCE } from './reference';

// Markdown table cells can't contain raw pipes or newlines.
const cell = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ');

function move(m: KbMove): string {
  if (m.kind === 'hpf') return `HPF at ${formatHz(m.freqHz)}`;
  const range = m.rangeHz ? ` (usually ${formatHz(m.rangeHz[0])}–${formatHz(m.rangeHz[1])})` : '';
  return `${m.gainDb > 0 ? 'Boost' : 'Cut'} ${formatHz(m.freqHz)} ${m.gainDb > 0 ? '+' : '−'}${Math.abs(m.gainDb)} dB, Q ${m.q}${range}`;
}

/** Human-readable review sheet for an experienced mixer, generated from the app's own data. */
export function renderKbReview(): string {
  const eqRows = KB.map((e) => [
    '☐',
    e.sources.map((s) => SOURCE_LABELS[s]).join(', '),
    e.symptoms.map((s) => SYMPTOM_LABELS[s]).join(' / '),
    e.moves.map(move).join('; '),
    e.nonEqFixes.join(' ') || 'n/a',
    e.why,
    '',
  ].map(cell).join(' | '));

  const compRows = (Object.entries(COMPRESSOR_STARTS) as [SourceType, NonNullable<(typeof COMPRESSOR_STARTS)[SourceType]>][]).map(([source, c]) => [
    '☐',
    SOURCE_LABELS[source],
    `${c.ratio}:1${c.strongRatio ? ` (${c.strongRatio}:1 if very uneven)` : ''}${c.knee ? `, ${c.knee} knee` : ''}`,
    c.attack,
    c.release,
    `${c.reductionDb[0]}–${c.reductionDb[1]} dB`,
    `> ${c.swingDb} dB${c.gentleOnly ? ' (usually none)' : ''}`,
    c.why,
    '',
  ].map(cell).join(' | '));

  const glossaryRows = (Object.entries(SYMPTOM_DESCRIPTIONS) as [Symptom, string][]).map(([s, d]) =>
    ['☐', SYMPTOM_LABELS[s], d, ''].map(cell).join(' | '));

  const referenceSections = (Object.entries(REFERENCE) as [SourceType, (typeof REFERENCE)[SourceType]][]).map(([source, rows]) =>
    `### ${SOURCE_LABELS[source]}

| OK | Range | What lives here | Boost when | Cut when | Notes |
|---|---|---|---|---|---|
${rows.map((r) => `| ${['☐', `${formatHz(r.hz[0])}–${formatHz(r.hz[1])}`, r.name, r.boost, r.cut, ''].map(cell).join(' | ')} |`).join('\n')}`).join('\n\n');

  return `# EQ Helper: knowledge base review

> Generated from the app's data by \`npm run kb:review\`. Don't edit by hand; send notes back
> and the source gets changed, then this file is regenerated.

**What to check:** Is each move a sensible *starting point* for a small worship room? Is the
"why" correct and understandable to a volunteer? Anything dangerous (feedback risk, too much
boost)? Tick ☐ → ☑ when a row looks right, and write changes in the Notes column.

Frequencies are starting points; the app tells users to try nearby within the "usually" range.
Where these values came from, and where the app deliberately differs from its sources, is in
[kb-sources.md](kb-sources.md).

## EQ advice (${KB.length} entries)

| OK | Source | Symptom | Move | Non-EQ fixes | Why | Notes |
|---|---|---|---|---|---|---|
${eqRows.map((r) => `| ${r} |`).join('\n')}

## Compressor starting points

The phone can't read the console's level scale, so the app never gives a threshold number. It
says "lower the threshold until the gain-reduction meter shows the target on the loudest parts."
Compression is only suggested when the measured level swing is above the "Suggest when" value.

| OK | Source | Ratio | Attack | Release | Target gain reduction | Suggest when swing | Why | Notes |
|---|---|---|---|---|---|---|---|---|
${compRows.map((r) => `| ${r} |`).join('\n')}

## Symptom glossary

Shown on the Ask tab so people new to mixing know what each word means.

| OK | Symptom | Description | Notes |
|---|---|---|---|
${glossaryRows.map((r) => `| ${r} |`).join('\n')}

## Reference charts

The Reference tab: where each source's sound lives and when to boost or cut there.

${referenceSections}
`;
}
