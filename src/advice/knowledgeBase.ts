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
  clicky: 'Too clicky',
} as const;
export type Symptom = keyof typeof SYMPTOM_LABELS;

/** Plain-language "what does this word mean" for people new to mixing. */
export const SYMPTOM_DESCRIPTIONS: Record<Symptom, string> = {
  muddy: 'Thick and unclear, like the sound is wrapped in a wool blanket. Voices and instruments blur together and words are hard to pick out. Usually too much 200–400 Hz.',
  boomy: 'Too much deep bass that rumbles and hangs around. Low notes sound like they\'re in a barrel and the low end feels flabby instead of tight. Usually 80–200 Hz.',
  boxy: 'Hollow and closed in, like it\'s playing from inside a cardboard box. Usually 400–800 Hz.',
  nasal: 'Like someone holding their nose, or talking through a megaphone or an old telephone. Usually 500 Hz–1.5 kHz.',
  harsh: 'Piercing and edgy. It hurts your ears, especially on loud parts, and you want to turn it down even when it isn\'t that loud. Usually 2–5 kHz.',
  sibilant: '"S", "T" and "SH" sounds jump out with a hiss or whistle, louder than the rest of the word. Usually 5–10 kHz.',
  thin: 'Small, weak or tinny, like it\'s coming out of a phone speaker. It\'s missing body and warmth. Usually not enough 100–250 Hz.',
  dull: 'Muffled and dark, like there\'s a blanket over the speaker. No sparkle, crispness or "air". Usually not enough above 4 kHz.',
  buried: 'You can see them playing but can\'t really hear them, or you can hear the voice but can\'t make out the words. Turning it up barely helps because other sounds are covering it.',
  'string-noise': 'Pick scrapes, finger squeaks, fret clank or string zing are louder than the notes themselves. Sounds scratchy or jangly.',
  quacky: 'A plastic, nasal, duck-like tone that doesn\'t sound like a real wooden guitar. Common with pickups plugged straight into the board.',
  fizzy: 'A buzzy, sizzling hiss on top of a distorted guitar, like bacon frying. Usually 6–10 kHz.',
  'no-definition': 'You can feel the bass but can\'t tell which notes are being played. It\'s just a low rumble.',
  'no-punch': 'Drum hits feel soft and polite. No thump you feel in your chest and no snap.',
  ringing: 'A drum hit leaves a "ping" or "boing" tone hanging after it, like a small bell.',
  plosives: 'Loud thumps or pops on "P" and "B" sounds when a puff of breath hits the mic.',
  overpowering: 'It covers everyone else. Other instruments and voices get lost behind it, even at a sensible volume.',
  clicky: 'The kick is all slap and tick, like a pencil tapping a desk, and the click pokes out over the band. Usually 2–5 kHz.',
};

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
    id: 'vocal-nasal', sources: [...VOCALS, 'speech-headset', 'speech-handheld'], symptoms: ['nasal'],
    synonyms: ['honky', 'through the nose', 'pinched', 'telephone'],
    moves: [eq(500, 1500, 1000, -3, 2)],
    nonEqFixes: [],
    why: 'Nasal honk usually lives around 1 kHz, but on some voices it\'s as low as 500 Hz. Pulling it back a little makes the voice sound more natural and less "telephone".',
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
    moves: [eq(5000, 10000, 6500, -3, 4)],
    nonEqFixes: ['Angle the mic slightly off-axis from the mouth.'],
    why: '"S" and "T" sounds are concentrated in a narrow band somewhere in 5–10 kHz (higher voices sit higher). A narrow cut tames them without dulling the whole voice.',
  },
  {
    id: 'vocal-buried', sources: VOCALS, symptoms: ['buried'],
    synonyms: ['lost', 'can\'t hear', 'masked', 'behind the band', 'drowned', 'not cutting through'],
    moves: [eq(1000, 5000, 3000, 2, 1.4)],
    nonEqFixes: ['Better: cut 2–4 kHz by 2–3 dB on acoustic and keys to make room. That avoids raising feedback risk on the vocal mic.', 'Check the singer is close to the mic.'],
    why: 'Word clarity lives at 1–5 kHz, strongest around 2–4 kHz. If instruments fill that range, the vocal gets masked no matter how loud it is. Making room beats turning it up.',
  },
  {
    id: 'vocal-thin', sources: VOCALS, symptoms: ['thin'],
    synonyms: ['weak', 'small', 'tinny', 'no body', 'no warmth'],
    moves: [eq(120, 300, 200, 2, 1.4)],
    nonEqFixes: ['Check the HPF isn\'t set too high.', 'Have the singer move a little closer to the mic.'],
    why: 'Body and warmth sit around 120–300 Hz (lower for deep voices). A small boost restores weight. Go easy: too much here turns into mud.',
  },
  {
    id: 'vocal-dull', sources: VOCALS, symptoms: ['dull'],
    synonyms: ['dark', 'muffled', 'no air', 'flat', 'lifeless'],
    moves: [eq(5000, 14000, 10000, 2, 0.7)],
    nonEqFixes: ['Check the mic grille isn\'t covered or cupped.'],
    why: '"Air" and breathiness above 5 kHz adds openness and polish. A gentle, broad lift brightens without harshness.',
  },
  {
    id: 'vocal-plosives', sources: [...VOCALS, 'speech-handheld', 'speech-headset'], symptoms: ['plosives'],
    synonyms: ['pops', 'popping', 'p pops', 'thumps', 'b pops'],
    moves: [hpf(120)],
    nonEqFixes: ['Angle the mic so breath goes past it, not into it.', 'A foam windscreen helps a lot.'],
    why: 'P and B sounds are bursts of air hitting the mic, which shows up as low-frequency thumps. A high-pass filter removes most of it without touching the voice.',
  },
  {
    id: 'vocal-boomy', sources: VOCALS, symptoms: ['boomy'],
    synonyms: ['bassy', 'rumbly', 'woofy', 'too much low end', 'chesty', 'proximity'],
    moves: [hpf(100), eq(100, 200, 150, -3, 1.4)],
    nonEqFixes: ['Have the singer back off the mic an inch or two. The closer they sing, the more bass the mic adds (proximity effect).'],
    why: 'Below about 200 Hz a voice is mostly chest rumble and proximity boom, not words. Filtering and trimming it tightens the vocal and leaves the low end to bass and kick.',
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
  {
    id: 'handheld-speech-harsh', sources: ['speech-handheld'], symptoms: ['harsh'],
    synonyms: ['piercing', 'shrill', 'edgy', 'shouty', 'hurts'],
    moves: [eq(2500, 4000, 3000, -3, 2)],
    nonEqFixes: ['If they get loud when excited, a little compression helps more than EQ.'],
    why: 'Ears are most sensitive at 2.5–4 kHz. A raised speaking voice piles energy there, so a small cut keeps them clear without the sting.',
  },
  {
    id: 'handheld-speech-thin', sources: ['speech-handheld'], symptoms: ['thin'],
    synonyms: ['weak', 'small', 'tinny', 'far away', 'distant'],
    moves: [eq(150, 250, 200, 2, 1.4)],
    nonEqFixes: ['Usually the mic is too far away. Ask them to hold it about a fist-width from the mouth, pointed at it.', 'Check the HPF isn\'t set too high.'],
    why: 'Holding a handheld at chest height loses the voice\'s body. Distance is the real fix, and a small boost at 150–250 Hz restores some warmth meanwhile.',
  },
  {
    id: 'speech-sibilant', sources: ['speech-headset', 'speech-handheld'], symptoms: ['sibilant'],
    synonyms: ['s sounds', 'esses', 'hissy', 'spitty', 'whistly'],
    moves: [eq(5000, 9000, 7000, -3, 4)],
    nonEqFixes: [
      'Headset: move the mic element a little further back toward the cheek, out of the direct breath stream.',
      'Handheld: hold the mic slightly below the chin, pointing up at the mouth, rather than straight in front of it.',
    ],
    why: '"S" and "T" sounds sit in a narrow band around 5–9 kHz, and headsets placed right at the mouth exaggerate them. A narrow cut tames the hiss without dulling the voice.',
  },
  {
    id: 'speech-unclear', sources: ['speech-headset', 'speech-handheld'], symptoms: ['dull', 'buried'],
    synonyms: ['muffled', 'hard to understand', 'can\'t understand', 'mumbly', 'unclear words', 'lost words', 'not intelligible'],
    moves: [eq(200, 400, 300, -2, 1.4), eq(2000, 5000, 3000, 2, 1.4)],
    nonEqFixes: [
      'Turn background music or pads down while they talk.',
      'Check the mic placement: a headset at the corner of the mouth, a handheld about a fist-width away.',
      'Headset tucked under hair, a scarf or a beard? Move it clear.',
      'Check the channel gain (trim) is set so normal talking shows a healthy level. Too little gain means pushing the fader and EQ to make up for it.',
    ],
    why: 'Words are carried by consonants at 2–5 kHz, and low-mid mud at 200–400 Hz covers them up. Trimming one and gently lifting the other makes speech easier to follow without just making it louder.',
  },
  // ── Acoustic guitar ─────────────────────────────────────────────────────
  {
    id: 'acoustic-boomy', sources: ['acoustic-guitar'], symptoms: ['boomy'],
    synonyms: ['bassy', 'woofy', 'thumpy', 'resonant'],
    moves: [hpf(80), eq(100, 200, 150, -4, 1.4)],
    nonEqFixes: [
      'If it has a mic, move it away from the soundhole.',
      'A soundhole cover tames body boom and feedback.',
      'Solo guitar with no bass player? Set the HPF lower (around 60 Hz) or leave it off, so the guitar keeps its bottom end.',
    ],
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
    moves: [eq(2000, 5000, 3500, 2, 1.4)],
    nonEqFixes: ['Cut 200–300 Hz on the acoustic instead of turning it up. Less mud often reads as more presence.'],
    why: 'Bite at 2–5 kHz cuts through a band better than volume does. Volume mostly adds low-mid mud.',
  },
  {
    id: 'acoustic-boxy', sources: ['acoustic-guitar'], symptoms: ['boxy'],
    synonyms: ['cardboard', 'hollow', 'closed in', 'honky'],
    moves: [eq(400, 1200, 900, -3, 2)],
    nonEqFixes: [
      'Find the exact spot: Listen → Guided check walks you through boost, sweep, then cut.',
      'If it has a mic, aim it at where the neck meets the body (around the 12th–14th fret), not the soundhole.',
    ],
    why: 'Acoustics, especially plugged-in ones, often build up a hollow, boxy tone around 900 Hz–1 kHz, sometimes lower. A modest cut makes it sound more open and natural.',
  },
  {
    id: 'acoustic-thin', sources: ['acoustic-guitar'], symptoms: ['thin'],
    synonyms: ['tinny', 'small', 'no body', 'weak', 'brittle'],
    moves: [eq(150, 300, 200, 2, 1.4)],
    nonEqFixes: ['Check the HPF isn\'t set too high (about 80 Hz is plenty).', 'Piezo pickups often sound thin. If the guitar has a blend knob, add some of its internal mic.'],
    why: 'An acoustic\'s warmth lives around 150–300 Hz. A small boost gives it body. Go easy: it\'s the same range that turns into mud with the vocals.',
  },
  {
    id: 'acoustic-dull', sources: ['acoustic-guitar'], symptoms: ['dull'],
    synonyms: ['dark', 'muffled', 'dead strings', 'no sparkle', 'lifeless'],
    moves: [eq(8000, 14000, 12000, 2, 0.7)],
    nonEqFixes: ['Old strings sound dull and no EQ fully fixes that. Fresh strings make a big difference.'],
    why: 'Shimmer and sparkle sit above 8 kHz, around 12 kHz. A gentle, broad lift brings it back without adding pick scratch.',
  },
  // ── Electric guitar ─────────────────────────────────────────────────────
  {
    id: 'electric-muddy', sources: ['electric-guitar'], symptoms: ['muddy', 'boomy'],
    synonyms: ['murky', 'thick', 'fighting the bass', 'woofy'],
    moves: [hpf(100), eq(200, 300, 250, -3, 1.4)],
    nonEqFixes: [],
    why: 'Electric guitar low end fights the bass. Cutting it makes both clearer, and the HPF also removes amp hum (50–60 Hz).',
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
  {
    id: 'electric-nasal', sources: ['electric-guitar'], symptoms: ['nasal'],
    synonyms: ['honky', 'boxy', 'midrangy', 'cocked wah', 'telephone'],
    moves: [eq(500, 1200, 800, -3, 2)],
    nonEqFixes: [],
    why: 'Some amps and pedals pile up a honk around 500 Hz–1.2 kHz. A small cut keeps the guitar\'s character while taking off the megaphone edge.',
  },
  {
    id: 'electric-thin', sources: ['electric-guitar'], symptoms: ['thin'],
    synonyms: ['weak', 'small', 'tinny', 'no body', 'fizzy and thin'],
    moves: [eq(150, 300, 250, 2, 1.4)],
    nonEqFixes: ['Move the amp mic a little toward the edge of the speaker cone for a warmer sound.', 'Ask the guitarist to add some bass or mids on the amp itself.'],
    why: 'Body and warmth sit around 250–300 Hz. A small boost fills the guitar out. Don\'t overdo it, or it starts fighting the bass.',
  },
  {
    id: 'electric-dull', sources: ['electric-guitar'], symptoms: ['dull'],
    synonyms: ['dark', 'muffled', 'no air', 'woolly', 'no sparkle'],
    moves: [eq(8000, 14000, 12000, 2, 0.7)],
    nonEqFixes: ['Check the amp mic is pointed at the speaker cone, not the edge of the cabinet.'],
    why: 'Air and sheen above 8 kHz make a clean guitar shimmer. A gentle, broad lift brings it back. Skip this on heavily distorted tones, where it turns into fizz.',
  },
  {
    id: 'electric-buried', sources: ['electric-guitar'], symptoms: ['buried'],
    synonyms: ['lost', 'can\'t hear', 'masked', 'disappears'],
    moves: [eq(1000, 4000, 2500, 2, 1.4)],
    nonEqFixes: ['Better: cut 1–3 kHz a little on keys or acoustic so the electric has its own space.'],
    why: 'An electric guitar\'s bite and clarity live at 1–4 kHz. That\'s what lets it cut through, and volume alone mostly adds mud.',
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
    moves: [eq(200, 500, 250, -3, 1.4)],
    nonEqFixes: [],
    why: 'Bass mud usually sits around 250 Hz, with boxiness up to 500 Hz. These low-mids overlap guitar and keys. Cutting here separates the bass from everything else.',
  },
  {
    id: 'bass-no-definition', sources: ['bass'], symptoms: ['no-definition', 'buried'],
    synonyms: ['can\'t hear notes', 'undefined', 'just a rumble', 'lost'],
    moves: [eq(700, 1000, 800, 3, 1.4), eq(2000, 4000, 2500, 2, 1.4)],
    nonEqFixes: [],
    why: 'Small PA speakers can\'t reproduce deep lows, so people actually hear bass through its growl around 700 Hz–1 kHz and its string attack around 2.5 kHz.',
  },
  {
    id: 'bass-thin', sources: ['bass'], symptoms: ['thin'],
    synonyms: ['weak', 'no bottom', 'no low end', 'small'],
    moves: [eq(40, 120, 80, 3, 1.4)],
    nonEqFixes: ['Walk to the middle of the room before boosting. The low end at the board can be very different.', 'Check the bass channel\'s HPF is off.'],
    why: 'A bass\'s weight lives at 60–120 Hz. If that\'s missing it feels weak. Small speakers can only do so much here, so check by ear in the room first.',
  },
  {
    id: 'bass-string-noise', sources: ['bass'], symptoms: ['string-noise'],
    synonyms: ['clanky', 'clank', 'fret noise', 'clicky', 'twangy', 'rattle'],
    moves: [eq(2000, 5000, 3000, -3, 1.4)],
    nonEqFixes: ['A bass plugged straight into the board picks up every fret buzz. Ask them to roll the tone knob back a little.'],
    why: 'String and fret clank live at 2–5 kHz, right where ears are sensitive. A small cut keeps the growl and loses the clatter.',
  },
  // ── Keys ────────────────────────────────────────────────────────────────
  {
    id: 'keys-muddy', sources: ['keys'], symptoms: ['muddy', 'boomy'],
    synonyms: ['murky', 'thick', 'left hand', 'cloudy'],
    moves: [hpf(100), eq(200, 400, 250, -3, 1.4)],
    nonEqFixes: [
      'When a bass player is present, ask keys to lighten the left hand.',
      'Find the exact spot: Listen → Guided check walks you through boost, sweep, then cut. It\'s often right around 250 Hz.',
    ],
    why: 'A piano\'s left hand doubles the bass, and keys mud usually sits right around 250 Hz. In a full band, trimming its lows clears space for bass and vocals.',
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
    moves: [eq(2500, 7500, 4000, -3, 2)],
    nonEqFixes: [],
    why: 'Digital piano samples are often bright at 2.5–5 kHz and shrill up to 7.5 kHz. Softening this makes them sit back in the mix.',
  },
  {
    id: 'keys-boxy', sources: ['keys'], symptoms: ['boxy'],
    synonyms: ['cardboard', 'hollow', 'honky', 'cheap'],
    moves: [eq(400, 800, 500, -3, 2)],
    nonEqFixes: [],
    why: 'Some piano and organ sounds build up a hollow tone around 400–800 Hz. A modest cut makes them sound bigger and more open.',
  },
  {
    id: 'keys-thin', sources: ['keys'], symptoms: ['thin'],
    synonyms: ['weak', 'small', 'tinny', 'no body'],
    moves: [eq(100, 250, 150, 2, 1.4)],
    nonEqFixes: [
      'Check you\'re getting the right output. One side of a stereo keyboard (L only) can sound thin, so use the mono output or both L and R.',
      'Check the keyboard\'s own EQ or patch isn\'t set thin.',
    ],
    why: 'Piano body sits around 100–250 Hz. A small boost restores weight. With a bass player present, keep it subtle so they don\'t clash.',
  },
  {
    id: 'keys-dull', sources: ['keys'], symptoms: ['dull'],
    synonyms: ['dark', 'muffled', 'lifeless', 'no sparkle'],
    moves: [eq(7500, 12000, 10000, 2, 0.7)],
    nonEqFixes: ['Many keyboards have a brightness or tone control. Try that first.'],
    why: 'Sheen and sparkle sit around 10 kHz, above the shrill range. A gentle, broad lift brings the keys forward without making them harsh.',
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
    moves: [eq(250, 600, 400, -4, 1.4)],
    nonEqFixes: ['Find the exact spot: Listen → Guided check walks you through boost, sweep, then cut. It\'s usually between 250 and 500 Hz.'],
    why: 'The cardboard sound of a kick sits around 250–500 Hz. Scooping it leaves the thump and the click.',
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
    moves: [eq(250, 600, 400, -3, 1.4)],
    nonEqFixes: ['Find the exact spot: Listen → Guided check walks you through boost, sweep, then cut.'],
    why: 'Toms get boxy around 250–600 Hz. A cut leaves the body and attack.',
  },
  {
    id: 'overheads-harsh', sources: ['overheads'], symptoms: ['harsh', 'overpowering'],
    synonyms: ['too much cymbal', 'washy', 'trashy', 'piercing', 'clangy'],
    moves: [hpf(300), eq(2000, 6000, 3500, -3, 1.4)],
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
  {
    id: 'cajon-dull', sources: ['cajon'], symptoms: ['dull'],
    synonyms: ['no slap', 'no snap', 'no crack', 'dead', 'muffled'],
    moves: [eq(2000, 5000, 3000, 2, 1.4)],
    nonEqFixes: ['If it\'s only mic\'d at the back port, add a mic on the front (playing) face for the slap.'],
    why: 'The cajón\'s slap and snare-wire buzz live at 2–5 kHz. A small lift brings back the "snare" half of the instrument.',
  },
  {
    id: 'kick-boomy', sources: ['kick'], symptoms: ['boomy'],
    synonyms: ['woofy', 'too much low end', 'flabby', 'rumbly', 'basketball'],
    moves: [eq(80, 150, 100, -3, 1.4)],
    nonEqFixes: ['In a small room the kick often needs less low end than you\'d think. Try the fader down first.', 'A small pillow or blanket inside the drum tightens the boom.'],
    why: 'Kick boom at 80–150 Hz excites small rooms and smears the groove. Trimming it leaves the deep thump (60–80 Hz) and the click.',
  },
  {
    id: 'kick-clicky', sources: ['kick'], symptoms: ['clicky'],
    synonyms: ['too much click', 'slappy', 'ticky', 'pointy', 'clacky'],
    moves: [eq(2000, 5000, 3500, -3, 1.4)],
    nonEqFixes: ['A felt beater instead of a plastic or wood one softens the click.'],
    why: 'Beater click lives at 2–5 kHz. A little helps the kick be heard on small speakers, but too much pokes out like a metronome.',
  },
  {
    id: 'snare-boxy', sources: ['snare'], symptoms: ['boxy', 'muddy'],
    synonyms: ['cardboard', 'papery', 'hollow', 'honky'],
    moves: [eq(300, 900, 500, -3, 1.4)],
    nonEqFixes: [],
    why: 'Snares get a boxy, honky tone around 300–900 Hz. A cut there leaves the body (around 200 Hz) and the crack.',
  },
  {
    id: 'snare-thin', sources: ['snare'], symptoms: ['thin'],
    synonyms: ['no body', 'weak', 'small', 'tinny', 'no fat'],
    moves: [eq(120, 250, 200, 2, 1.4)],
    nonEqFixes: ['Angle the mic about 45° to the head, two fingers above the rim, pointed at the center.'],
    why: 'A snare\'s body and fatness live around 120–250 Hz. A small boost gives it weight without making it boomy.',
  },
  {
    id: 'snare-dull', sources: ['snare'], symptoms: ['dull'],
    synonyms: ['no crack', 'no snap', 'muffled', 'dead', 'flat'],
    moves: [eq(2500, 6000, 3500, 2, 1.4)],
    nonEqFixes: ['A snare that\'s over-dampened (lots of gel or tape) sounds dead. Take some off.'],
    why: 'The snare\'s crack sits at 3–6 kHz. A small boost brings back the snap that makes the backbeat feel alive.',
  },
  {
    id: 'snare-harsh', sources: ['snare'], symptoms: ['harsh'],
    synonyms: ['too much hi-hat', 'hat bleed', 'sizzly', 'trashy'],
    moves: [eq(5000, 10000, 7000, -3, 1.4)],
    nonEqFixes: ['Aim the snare mic so its back points at the hi-hat. Most mics reject sound from behind.'],
    why: 'The hi-hat sits right next to the snare and bleeds into its mic above 5 kHz. Cutting there tames the wash without losing the snare\'s crack.',
  },
  {
    id: 'toms-boomy', sources: ['toms'], symptoms: ['boomy'],
    synonyms: ['woofy', 'rumbly', 'too much low end', 'thuddy'],
    moves: [eq(80, 150, 100, -3, 1.4)],
    nonEqFixes: ['If your mixer has gates, a gate on the tom channels stops them booming and picking up the kit between hits.'],
    why: 'Floor toms especially boom at 80–150 Hz in small rooms. A small cut keeps them big without muddying the bass and kick.',
  },
  {
    id: 'toms-thin', sources: ['toms'], symptoms: ['thin'],
    synonyms: ['small', 'weak', 'papery', 'no body', 'no fullness'],
    moves: [eq(100, 240, 150, 2, 1.4)],
    nonEqFixes: ['Tuning matters more than EQ here. Very high-tuned toms sound small whatever you do.'],
    why: 'Tom fullness lives around 120–240 Hz. A small boost gives fills some weight. Keep it gentle so the floor tom doesn\'t start to boom.',
  },
  {
    id: 'toms-dull', sources: ['toms'], symptoms: ['dull', 'no-punch'],
    synonyms: ['no attack', 'no stick', 'soft', 'muffled', 'flat'],
    moves: [eq(2000, 6000, 4000, 2, 1.4)],
    nonEqFixes: [],
    why: 'The snap and stick attack on toms is at 2–6 kHz. A small lift makes fills cut through without turning them up.',
  },
  {
    id: 'overheads-muddy', sources: ['overheads'], symptoms: ['muddy', 'boomy'],
    synonyms: ['washy', 'cloudy', 'roomy', 'kit mud'],
    moves: [hpf(300), eq(300, 600, 400, -3, 1.4)],
    nonEqFixes: ['Aim the overheads at the cymbals, not down at the drums.'],
    why: 'The overheads mostly pick up the whole kit and the room below about 600 Hz. In a small room that\'s just extra mud, so let the close mics handle the drums.',
  },
  {
    id: 'overheads-dull', sources: ['overheads'], symptoms: ['dull'],
    synonyms: ['no shimmer', 'no sparkle', 'dark cymbals', 'muffled'],
    moves: [eq(8000, 14000, 12000, 2, 0.7)],
    nonEqFixes: [
      'Cymbals usually carry fine in a small room by themselves. Mute the overheads to compare before boosting.',
      'Barely any sound at all? Condenser mics need phantom power (48V) turned on for that channel.',
    ],
    why: 'Cymbal shimmer lives above 8 kHz. A broad, gentle lift adds sparkle without the clang at 2–5 kHz.',
  },
  {
    id: 'ekit-boomy', sources: ['e-kit'], symptoms: ['boomy', 'muddy'],
    synonyms: ['woofy', 'too much kick', 'rumbly', 'thuddy'],
    moves: [eq(80, 200, 120, -3, 1.4)],
    nonEqFixes: ['E-kit kick samples are often made for headphones, with huge low end. Turn the kick down in the module\'s own mixer.'],
    why: 'Sampled kicks and toms often carry far more 80–200 Hz than a real kit. Through a PA in a small room that booms, so a small cut tightens it.',
  },
  {
    id: 'ekit-thin', sources: ['e-kit'], symptoms: ['thin'],
    synonyms: ['weak', 'small', 'tinny', 'toy'],
    moves: [eq(150, 300, 200, 2, 1.4)],
    nonEqFixes: ['Check you\'re getting both module outputs (L and R) or the mono output. One side of a stereo kit can be missing drums.'],
    why: 'Drum body lives around 150–300 Hz. If the kit sounds like a toy, a small boost there gives it some weight.',
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
  {
    id: 'mix-boxy', sources: ['full-mix'], symptoms: ['boxy', 'nasal'],
    synonyms: ['hollow', 'honky', 'cardboard', 'megaphone', 'telephone'],
    moves: [eq(400, 1000, 630, -2, 1.4)],
    nonEqFixes: ['Find the culprit by muting channels one at a time. Fixing that one channel beats EQing everything.'],
    why: 'A buildup around 400 Hz–1 kHz makes the whole room sound like a cardboard box. A gentle dip on the mains opens it up.',
  },
  {
    id: 'mix-thin', sources: ['full-mix'], symptoms: ['thin'],
    synonyms: ['weak', 'no bass', 'no low end', 'tinny', 'small'],
    moves: [eq(80, 200, 125, 2, 1.4)],
    nonEqFixes: ['Bring up the bass and kick faders first.', 'Check the bass and kick channels don\'t have the HPF on.'],
    why: 'Without enough 80–200 Hz the mix feels small and lacks a pulse. Usually it\'s a channel level, so fix that first, then nudge the mains.',
  },
  {
    id: 'mix-dull', sources: ['full-mix'], symptoms: ['dull'],
    synonyms: ['muffled', 'dark', 'lifeless', 'no sparkle', 'flat'],
    moves: [eq(6000, 12000, 8000, 2, 0.7)],
    nonEqFixes: ['Check the speakers aren\'t blocked, or pointed at the floor or the back wall.', 'Check the HIGH knobs on the vocal channels aren\'t turned down.'],
    why: 'Above 6 kHz is where crispness and "air" live. High frequencies are the first to get lost in a room, so a gentle lift on the mains brings back clarity.',
  },
];

// ── Compressor starting points (part of the same review as the EQ entries) ──

export interface CompressorStart {
  ratio: number;
  strongRatio?: number; // when the swing is very large
  attack: string;
  release: string;
  reductionDb: [number, number]; // target gain reduction on the loudest passages
  swingDb: number; // recommend compression only above this swing
  gentleOnly?: boolean; // usually better uncompressed; only advise when the swing is extreme
  knee?: 'soft' | 'hard'; // only shown on compressors with full controls
  why: string;
}

const VOICE_START: CompressorStart = {
  ratio: 3, strongRatio: 4, attack: '20–40 ms', release: '150–300 ms (or auto)', reductionDb: [3, 6], swingDb: 13, knee: 'soft',
  why: 'Singers get much louder on big notes and softer on quiet lines. Gentle compression evens that out so you aren\'t riding the fader every phrase. Much faster release sounds pumpy; much slower attack lets the loud surges through.',
};

const GENTLE_START: CompressorStart = {
  ratio: 2, attack: '20–30 ms', release: 'auto', reductionDb: [2, 3], swingDb: 20, gentleOnly: true,
  why: 'This usually sounds best uncompressed in a small room. The swing here is extreme, so a light touch helps.',
};

export const COMPRESSOR_STARTS: Partial<Record<SourceType, CompressorStart>> = {
  'male-vocal': VOICE_START,
  'female-vocal': VOICE_START,
  'speech-headset': {
    ratio: 2.5, attack: '10–20 ms', release: 'about 150 ms', reductionDb: [3, 6], swingDb: 13, knee: 'soft',
    why: 'Speakers drop their voice for emphasis and get loud when excited. Light compression keeps every word at a listenable level.',
  },
  'speech-handheld': {
    ratio: 2.5, attack: '10–20 ms', release: 'about 150 ms', reductionDb: [3, 6], swingDb: 13, knee: 'soft',
    why: 'Handheld mic distance changes a lot while talking. Light compression smooths out the near/far level jumps.',
  },
  'acoustic-guitar': {
    ratio: 2.5, attack: '25–50 ms (lets the strum through)', release: '150–300 ms', reductionDb: [2, 4], swingDb: 10, knee: 'soft',
    why: 'Strumming hard vs. picking softly can jump 10+ dB. A gentle squeeze keeps the guitar steady under the vocals without killing the strum.',
  },
  bass: {
    ratio: 4, attack: 'about 25 ms', release: '200–500 ms', reductionDb: [3, 6], swingDb: 10, knee: 'hard',
    why: 'Some bass notes and strings ring out much louder than others. Compression keeps the low end steady so the groove sits evenly. Slap bass may need 6:1 or more with a faster attack.',
  },
  'electric-guitar': {
    ratio: 3, attack: 'about 25 ms', release: 'about 500 ms', reductionDb: [2, 4], swingDb: 15, knee: 'hard',
    why: 'Distorted guitar is already heavily compressed by the distortion itself, so leave it alone. Clean parts that jump from soft picking to loud strumming benefit from a light squeeze.',
  },
  keys: {
    ratio: 2, attack: '30–50 ms (lets the attack bite through)', release: 'auto', reductionDb: [2, 3], swingDb: 15,
    why: 'Keys are usually even. Only very uneven playing (soft pads jumping to loud chords) benefits from a light touch.',
  },
  kick: {
    ratio: 4, attack: '20–30 ms (keeps the punch)', release: 'fast, 25–100 ms', reductionDb: [3, 6], swingDb: 12, knee: 'hard',
    why: 'Evens out hit-to-hit level. The slower attack lets the initial thump through so it stays punchy.',
  },
  snare: {
    ratio: 4, attack: '20–30 ms (keeps the crack)', release: 'fast, 25–100 ms', reductionDb: [3, 6], swingDb: 12, knee: 'hard',
    why: 'Ghost notes and rimshots vary wildly. Compression evens them out while the slow attack keeps the crack.',
  },
  toms: GENTLE_START,
  cajon: GENTLE_START,
  'e-kit': GENTLE_START,
  overheads: {
    ...GENTLE_START, attack: 'about 25 ms', release: 'slow, 1–2 s (lets cymbals ring)',
    why: 'Cymbals usually sound best uncompressed in a small room. The swing here is extreme, so a light touch with a slow release evens it out without choking the ring.',
  },
};

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
