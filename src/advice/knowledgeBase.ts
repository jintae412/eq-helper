import type { EqMove } from './mixer';

export const SOURCE_LABELS = {
  'male-vocal': 'Male vocal',
  'female-vocal': 'Female vocal',
  'speech-headset': 'Speaker (headset)',
  'speech-handheld': 'Speaker (handheld)',
  'acoustic-guitar': 'Acoustic guitar',
  'electric-guitar': 'Electric guitar',
  bass: 'Bass',
  keys: 'Keys',
  cajon: 'Cajón',
  kick: 'Kick drum',
  snare: 'Snare',
  toms: 'Toms',
  overheads: 'Overheads / cymbals',
  'e-kit': 'Electronic kit',
  'full-mix': 'Whole mix',
} as const;
export type SourceType = keyof typeof SOURCE_LABELS;
export const SOURCE_TYPES = Object.keys(SOURCE_LABELS) as SourceType[];

export const SYMPTOM_LABELS = {
  muddy: 'Muddy',
  boomy: 'Boomy',
  boxy: 'Boxy',
  nasal: 'Nasal / honky',
  harsh: 'Harsh',
  sibilant: 'Harsh "S" sounds',
  thin: 'Thin',
  dull: 'Dull',
  buried: 'Buried / can\'t hear it',
  'string-noise': 'Too much string noise',
  quacky: 'Quacky / plasticky',
  fizzy: 'Fizzy',
  'no-definition': 'No definition',
  'no-punch': 'No punch',
  ringing: 'Ringing',
  plosives: 'Pops on P/B',
  overpowering: 'Overpowering others',
} as const;
export type Symptom = keyof typeof SYMPTOM_LABELS;

/** An EQ move plus where that problem usually lives, so the user can hunt nearby. */
export type KbMove = EqMove & { rangeHz?: [number, number] };

export interface KbEntry {
  id: string;
  sources: SourceType[];
  symptoms: Symptom[];
  synonyms: string[]; // lowercase; matched by the search box
  moves: KbMove[];
  nonEqFixes: string[];
  why: string;
}

const eq = (lo: number, hi: number, freqHz: number, gainDb: number, q: number): KbMove => ({
  kind: 'eq', rangeHz: [lo, hi], freqHz, gainDb, q,
});
const hpf = (freqHz: number): KbMove => ({ kind: 'hpf', freqHz });

const VOCALS: SourceType[] = ['male-vocal', 'female-vocal'];

// Rules of thumb from standard live-sound practice. Every voice/instrument differs, so ranges
// matter more than starting points. ponytail: needs review by an experienced mixer before v1.
export const KB: KbEntry[] = [
  // ── Vocals ──────────────────────────────────────────────────────────────
  {
    id: 'vocal-muddy', sources: VOCALS, symptoms: ['muddy'],
    synonyms: ['murky', 'cloudy', 'thick', 'wooly', 'unclear', 'mushy'],
    moves: [hpf(100), eq(200, 400, 300, -4, 1.4)],
    nonEqFixes: ['Female vocals can take the HPF higher, around 120–150 Hz.', 'Have the singer back off the mic an inch. Singing very close boosts the lows (proximity effect).'],
    why: 'Chest resonance and proximity effect pile up at 200–400 Hz, the same range as acoustic guitar body and keys. Cutting it lets the vocal sit on top instead of blending into the mush.',
  },
  {
    id: 'vocal-boxy', sources: VOCALS, symptoms: ['boxy'],
    synonyms: ['cardboard', 'hollow', 'in a can', 'closed in', 'cupped'],
    moves: [eq(400, 800, 500, -3, 2)],
    nonEqFixes: ['Make sure the singer isn\'t cupping the mic grille with their hand.'],
    why: 'A buildup around 400–800 Hz makes a voice sound like it\'s coming out of a box. A modest cut opens it up without thinning it.',
  },
  {
    id: 'vocal-nasal', sources: VOCALS, symptoms: ['nasal'],
    synonyms: ['honky', 'through the nose', 'pinched', 'telephone'],
    moves: [eq(800, 1500, 1000, -3, 2)],
    nonEqFixes: [],
    why: 'Nasal honk lives around 1 kHz. Pulling it back a little makes the voice sound more natural and less "telephone".',
  },
  {
    id: 'vocal-harsh', sources: VOCALS, symptoms: ['harsh'],
    synonyms: ['piercing', 'shrill', 'edgy', 'hurts', 'strident', 'shouty', 'brittle'],
    moves: [eq(2500, 4000, 3000, -3, 2)],
    nonEqFixes: ['Ask the singer to angle slightly off the mic on loud notes.'],
    why: 'Ears are most sensitive at 2.5–4 kHz, so too much there gets tiring fast, especially on loud belted notes. A small cut keeps clarity without the sting.',
  },
  {
    id: 'vocal-sibilant', sources: VOCALS, symptoms: ['sibilant'],
    synonyms: ['s sounds', 'esses', 'hissy', 'spitty', 'lispy'],
    moves: [eq(5000, 8000, 6500, -3, 4)],
    nonEqFixes: ['Angle the mic slightly off-axis from the mouth.'],
    why: '"S" and "T" sounds are concentrated in a narrow band around 5–8 kHz. A narrow cut tames them without dulling the whole voice.',
  },
  {
    id: 'vocal-buried', sources: VOCALS, symptoms: ['buried'],
    synonyms: ['lost', 'can\'t hear', 'masked', 'behind the band', 'drowned', 'not cutting through'],
    moves: [eq(2000, 4000, 3000, 2, 1.4)],
    nonEqFixes: ['Better: cut 2–4 kHz by 2–3 dB on acoustic and keys to make room. That avoids raising feedback risk on the vocal mic.', 'Check the singer is close to the mic.'],
    why: 'Word clarity lives at 2–4 kHz. If instruments fill that range, the vocal gets masked no matter how loud it is. Making room beats turning it up.',
  },
  {
    id: 'vocal-thin', sources: VOCALS, symptoms: ['thin'],
    synonyms: ['weak', 'small', 'tinny', 'no body', 'no warmth'],
    moves: [eq(150, 250, 200, 2, 1.4)],
    nonEqFixes: ['Check the HPF isn\'t set too high.', 'Have the singer move a little closer to the mic.'],
    why: 'Body and warmth sit around 150–250 Hz. A small boost restores weight. Go easy: too much here turns into mud.',
  },
  {
    id: 'vocal-dull', sources: VOCALS, symptoms: ['dull'],
    synonyms: ['dark', 'muffled', 'no air', 'flat', 'lifeless'],
    moves: [eq(8000, 14000, 10000, 2, 0.7)],
    nonEqFixes: ['Check the mic grille isn\'t covered or cupped.'],
    why: '"Air" above 8 kHz adds openness and polish. A gentle, broad lift brightens without harshness.',
  },
  {
    id: 'vocal-plosives', sources: [...VOCALS, 'speech-handheld', 'speech-headset'], symptoms: ['plosives'],
    synonyms: ['pops', 'popping', 'p pops', 'thumps', 'b pops'],
    moves: [hpf(120)],
    nonEqFixes: ['Angle the mic so breath goes past it, not into it.', 'A foam windscreen helps a lot.'],
    why: 'P and B sounds are bursts of air hitting the mic, which shows up as low-frequency thumps. A high-pass filter removes most of it without touching the voice.',
  },
  // ── Speech ──────────────────────────────────────────────────────────────
  {
    id: 'headset-muddy', sources: ['speech-headset'], symptoms: ['muddy', 'boomy'],
    synonyms: ['thick', 'chesty', 'muffled', 'woofy'],
    moves: [hpf(150), eq(150, 300, 250, -4, 1.4)],
    nonEqFixes: ['Check the mic element sits at the corner of the mouth, not against the cheek or in front of the lips.'],
    why: 'Speech needs almost nothing below 150 Hz, and headsets pick up chest resonance. Cutting the lows makes the speaker clearer and lowers feedback risk.',
  },
  {
    id: 'headset-harsh', sources: ['speech-headset'], symptoms: ['harsh', 'thin'],
    synonyms: ['tinny', 'piercing', 'shrill', 'nasal'],
    moves: [eq(3000, 5000, 4000, -3, 2)],
    nonEqFixes: [],
    why: 'Many headset mics have a built-in presence peak around 3–5 kHz. Taming it makes long sermons less fatiguing.',
  },
  {
    id: 'handheld-speech-muddy', sources: ['speech-handheld'], symptoms: ['muddy', 'boomy'],
    synonyms: ['thick', 'chesty', 'muffled'],
    moves: [hpf(120), eq(200, 300, 250, -3, 1.4)],
    nonEqFixes: ['Have them hold the mic about a fist-width from the mouth.'],
    why: 'Talking close to a handheld boosts the lows (proximity effect). Speech intelligibility lives higher up, so trimming the lows only helps.',
  },
  // ── Acoustic guitar ─────────────────────────────────────────────────────
  {
    id: 'acoustic-boomy', sources: ['acoustic-guitar'], symptoms: ['boomy'],
    synonyms: ['bassy', 'woofy', 'thumpy', 'resonant'],
    moves: [hpf(90), eq(100, 200, 150, -4, 1.4)],
    nonEqFixes: ['If it has a mic, move it away from the soundhole.', 'A soundhole cover tames body boom and feedback.'],
    why: 'The guitar body resonates around 100–200 Hz. The bass player already covers the low end, so cutting it cleans up the mix and lowers feedback risk.',
  },
  {
    id: 'acoustic-muddy', sources: ['acoustic-guitar'], symptoms: ['muddy'],
    synonyms: ['murky', 'cloudy', 'thick', 'unclear'],
    moves: [eq(200, 400, 250, -3, 1.4)],
    nonEqFixes: [],
    why: 'Acoustic low-mids overlap directly with vocal body. Cutting here gives the singer room.',
  },
  {
    id: 'acoustic-quacky', sources: ['acoustic-guitar'], symptoms: ['quacky'],
    synonyms: ['plasticky', 'piezo', 'nasal', 'honky', 'fake'],
    moves: [eq(1000, 3000, 1800, -3, 2)],
    nonEqFixes: [],
    why: 'Under-saddle piezo pickups have a "quack" somewhere in 1–3 kHz. Finding and cutting it makes the guitar sound more like a real acoustic.',
  },
  {
    id: 'acoustic-string-noise', sources: ['acoustic-guitar'], symptoms: ['string-noise'],
    synonyms: ['too much strings', 'pick noise', 'scratchy', 'jangly', 'finger squeak', 'clicky', 'zingy'],
    moves: [eq(3000, 6000, 4000, -3, 1.4), eq(8000, 12000, 10000, -2, 0.7)],
    nonEqFixes: ['A thinner pick, or strumming nearer the neck, softens attack.'],
    why: 'Pick attack and string zing live at 3–6 kHz, where ears are most sensitive, so a little goes a long way. Taming it keeps the guitar present without competing with vocal clarity.',
  },
  {
    id: 'acoustic-buried', sources: ['acoustic-guitar'], symptoms: ['buried'],
    synonyms: ['lost', 'can\'t hear', 'masked', 'disappears'],
    moves: [eq(3000, 5000, 4000, 2, 1.4)],
    nonEqFixes: ['Cut 200–300 Hz on the acoustic instead of turning it up. Less mud often reads as more presence.'],
    why: 'Sparkle at 3–5 kHz cuts through a band better than volume does. Volume mostly adds low-mid mud.',
  },
  // ── Electric guitar ─────────────────────────────────────────────────────
  {
    id: 'electric-muddy', sources: ['electric-guitar'], symptoms: ['muddy', 'boomy'],
    synonyms: ['murky', 'thick', 'fighting the bass', 'woofy'],
    moves: [hpf(100), eq(200, 300, 250, -3, 1.4)],
    nonEqFixes: [],
    why: 'Electric guitar low end fights the bass. Cutting it makes both clearer.',
  },
  {
    id: 'electric-harsh', sources: ['electric-guitar'], symptoms: ['harsh'],
    synonyms: ['ice pick', 'piercing', 'shrill', 'biting'],
    moves: [eq(2500, 4500, 3500, -3, 2)],
    nonEqFixes: ['Move the amp mic slightly off the center of the speaker cone.', 'Tilt the amp so it points at the player, not the audience.'],
    why: 'Amp "ice pick" sits around 2.5–4.5 kHz and is especially painful in small rooms.',
  },
  {
    id: 'electric-fizzy', sources: ['electric-guitar'], symptoms: ['fizzy'],
    synonyms: ['buzzy', 'hissy', 'sizzly', 'harsh top'],
    moves: [eq(6000, 10000, 8000, -4, 0.7)],
    nonEqFixes: [],
    why: 'Amp and pedal fizz above 6 kHz adds nothing musical. Rolling it off smooths the guitar.',
  },
  // ── Bass ────────────────────────────────────────────────────────────────
  {
    id: 'bass-boomy', sources: ['bass'], symptoms: ['boomy'],
    synonyms: ['woofy', 'too much low end', 'rumbly', 'flabby'],
    moves: [hpf(35), eq(80, 150, 100, -3, 1.4)],
    nonEqFixes: ['Get the bass amp off the floor and away from walls or corners.'],
    why: 'Small rooms exaggerate certain low frequencies (room modes). A small cut evens out the notes so some don\'t jump out.',
  },
  {
    id: 'bass-muddy', sources: ['bass'], symptoms: ['muddy'],
    synonyms: ['murky', 'thick', 'cloudy'],
    moves: [eq(200, 300, 250, -3, 1.4)],
    nonEqFixes: [],
    why: 'Bass low-mids overlap guitar and keys. Cutting here separates the bass from everything else.',
  },
  {
    id: 'bass-no-definition', sources: ['bass'], symptoms: ['no-definition', 'buried'],
    synonyms: ['can\'t hear notes', 'undefined', 'just a rumble', 'lost'],
    moves: [eq(700, 1000, 800, 3, 1.4)],
    nonEqFixes: [],
    why: 'Small PA speakers can\'t reproduce deep lows, so people actually hear bass through its growl and attack around 700 Hz–1 kHz.',
  },
  // ── Keys ────────────────────────────────────────────────────────────────
  {
    id: 'keys-muddy', sources: ['keys'], symptoms: ['muddy', 'boomy'],
    synonyms: ['murky', 'thick', 'left hand', 'cloudy'],
    moves: [hpf(100), eq(200, 400, 300, -3, 1.4)],
    nonEqFixes: ['When a bass player is present, ask keys to lighten the left hand.'],
    why: 'A piano\'s left hand doubles the bass. In a full band, trimming its lows clears space for bass and vocals.',
  },
  {
    id: 'keys-overpowering', sources: ['keys'], symptoms: ['overpowering'],
    synonyms: ['pads too loud', 'washing', 'covers vocals', 'wall of sound', 'smeared'],
    moves: [eq(2000, 4000, 3000, -2, 1)],
    nonEqFixes: ['Ask for pads an octave higher or lower than the vocal melody.'],
    why: 'Pads fill the same 2–4 kHz range as vocal clarity. A broad, gentle dip carves a pocket for the singer without making the pad disappear.',
  },
  {
    id: 'keys-harsh', sources: ['keys'], symptoms: ['harsh'],
    synonyms: ['brittle', 'tinny', 'digital', 'clangy'],
    moves: [eq(3000, 5000, 4000, -3, 2)],
    nonEqFixes: [],
    why: 'Digital piano samples are often bright at 3–5 kHz. Softening this makes them sit back in the mix.',
  },
  // ── Drums ───────────────────────────────────────────────────────────────
  {
    id: 'cajon-boomy', sources: ['cajon'], symptoms: ['boomy'],
    synonyms: ['woofy', 'too much low end', 'thuddy'],
    moves: [eq(100, 200, 150, -3, 1.4)],
    nonEqFixes: [],
    why: 'Cajón low end can excite the room. A small cut keeps the thump tight.',
  },
  {
    id: 'cajon-boxy', sources: ['cajon'], symptoms: ['boxy'],
    synonyms: ['cardboard', 'hollow', 'wooden'],
    moves: [eq(300, 600, 450, -3, 2)],
    nonEqFixes: [],
    why: 'A cajón is literally a box, and its resonance around 300–600 Hz can sound papery. Cutting it makes the bass tone and slap stand out.',
  },
  {
    id: 'cajon-no-punch', sources: ['cajon'], symptoms: ['no-punch'],
    synonyms: ['weak', 'no thump', 'thin'],
    moves: [eq(60, 100, 80, 3, 1.4)],
    nonEqFixes: ['If mic\'d from the back, try the mic closer to the port hole.'],
    why: 'The cajón\'s "kick" lives around 60–100 Hz. A boost there gives the band a felt pulse.',
  },
  {
    id: 'kick-boxy', sources: ['kick'], symptoms: ['boxy', 'muddy'],
    synonyms: ['cardboard', 'papery', 'pillowy', 'thuddy'],
    moves: [eq(300, 500, 400, -4, 1.4)],
    nonEqFixes: [],
    why: 'The cardboard sound of a kick sits around 300–500 Hz. Scooping it leaves the thump and the click.',
  },
  {
    id: 'kick-no-punch', sources: ['kick', 'e-kit'], symptoms: ['no-punch'],
    synonyms: ['weak', 'no click', 'no thump', 'soft'],
    moves: [eq(60, 80, 70, 3, 1.4), eq(2000, 5000, 3500, 2, 1.4)],
    nonEqFixes: [],
    why: 'Punch is two things: low thump (60–80 Hz) you feel and beater click (2–5 kHz) that lets you hear the kick on small speakers.',
  },
  {
    id: 'drum-ringing', sources: ['snare', 'toms'], symptoms: ['ringing'],
    synonyms: ['ring', 'overtone', 'pingy', 'boingy', 'sustain'],
    moves: [eq(200, 1000, 500, -4, 6)],
    nonEqFixes: ['A small piece of dampening gel on the drum head fixes this better than EQ.'],
    why: 'Ring is one sustained overtone, so a narrow cut right on it removes the ring without dulling the drum. It can be anywhere in 200 Hz–1 kHz, so listen for where it lives.',
  },
  {
    id: 'toms-boxy', sources: ['toms'], symptoms: ['boxy', 'muddy'],
    synonyms: ['cardboard', 'papery', 'hollow'],
    moves: [eq(300, 600, 400, -3, 1.4)],
    nonEqFixes: [],
    why: 'Toms get boxy around 300–600 Hz. A cut leaves the body and attack.',
  },
  {
    id: 'overheads-harsh', sources: ['overheads'], symptoms: ['harsh', 'overpowering'],
    synonyms: ['too much cymbal', 'washy', 'trashy', 'piercing', 'clangy'],
    moves: [hpf(300), eq(2000, 5000, 3500, -3, 1.4)],
    nonEqFixes: ['In small rooms, cymbals are often loud enough acoustically. Try the overheads much lower or off.'],
    why: 'In small rooms the overheads are only needed for cymbals, so filtering their lows removes extra kit mud, and a cut at 2–5 kHz tames the harsh wash.',
  },
  {
    id: 'ekit-harsh', sources: ['e-kit'], symptoms: ['harsh'],
    synonyms: ['fake', 'brittle', 'clicky', 'plasticky'],
    moves: [eq(3000, 5000, 4000, -3, 1.4)],
    nonEqFixes: [],
    why: 'E-kit samples are often hyped at 3–5 kHz. Softening this makes them sound more natural in a room.',
  },
  // ── Whole mix (main graphic EQ) ─────────────────────────────────────────
  {
    id: 'mix-muddy', sources: ['full-mix'], symptoms: ['muddy'],
    synonyms: ['murky', 'cloudy', 'thick', 'everything blends'],
    moves: [eq(200, 400, 315, -3, 1.4)],
    nonEqFixes: ['First check each channel: HPF on everything except bass and kick.'],
    why: 'Every instrument contributes some low-mids, and small rooms add their own buildup. A gentle dip on the mains clears the whole mix.',
  },
  {
    id: 'mix-boomy', sources: ['full-mix'], symptoms: ['boomy'],
    synonyms: ['room boom', 'bass too much', 'rumbly', 'woofy'],
    moves: [eq(100, 160, 125, -3, 2)],
    nonEqFixes: ['Turn bass and kick down first. Low end builds up in small rooms.'],
    why: 'Small rooms boost particular low frequencies (room modes). Cutting the one that booms evens out the low end for everyone.',
  },
  {
    id: 'mix-harsh', sources: ['full-mix'], symptoms: ['harsh'],
    synonyms: ['piercing', 'tiring', 'shrill', 'loud', 'painful'],
    moves: [eq(2000, 4000, 2500, -2, 1.4)],
    nonEqFixes: ['Often it\'s just too loud overall. Try the master down 3 dB first.'],
    why: 'Ears are most sensitive at 2–4 kHz and fatigue quickly there. A small cut on the mains makes a loud mix feel more comfortable.',
  },
];

export function lookup(source: SourceType, symptom: Symptom): KbEntry | undefined {
  return KB.find((e) => e.sources.includes(source) && e.symptoms.includes(symptom));
}

export function symptomsFor(source: SourceType): Symptom[] {
  return [...new Set(KB.filter((e) => e.sources.includes(source)).flatMap((e) => e.symptoms))];
}

// ponytail: substring matching; upgrade to token scoring if users' wording keeps missing
export function search(query: string, source?: SourceType): KbEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return KB.filter(
    (e) =>
      (!source || e.sources.includes(source)) &&
      [...e.symptoms.map((s) => SYMPTOM_LABELS[s].toLowerCase()), ...e.synonyms].some(
        (term) => q.includes(term) || (q.length >= 3 && term.includes(q)),
      ),
  );
}
