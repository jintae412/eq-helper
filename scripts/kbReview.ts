// Regenerates docs/kb-review.md from the knowledge base. Run: npm run kb:review
import { writeFileSync } from 'node:fs';
import { renderKbReview } from '../src/advice/kbReview';

const out = new URL('../docs/kb-review.md', import.meta.url);
writeFileSync(out, renderKbReview());
console.log(`Wrote ${out.pathname}`);
