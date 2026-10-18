import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { renderKbReview } from './kbReview';
import { KB } from './knowledgeBase';

it('docs/kb-review.md is up to date (run `npm run kb:review` if this fails)', () => {
  const onDisk = readFileSync(new URL('../../docs/kb-review.md', import.meta.url), 'utf8');
  expect(onDisk).toBe(renderKbReview());
});

it('has one review row per knowledge base entry', () => {
  const rows = renderKbReview().split('\n').filter((l) => l.startsWith('| ☐'));
  expect(rows.length).toBeGreaterThan(KB.length); // EQ rows + compressor rows
});
