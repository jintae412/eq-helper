import type { SourceType } from './knowledgeBase';

export interface RefRow {
  hz: [number, number];
  name: string;
  boost: string; // when to boost here
  cut: string; // when to cut here
}

const NEVER = 'Almost never.';

// Same "rules of thumb" caveat as the knowledge base: every voice, instrument and room differs,
// so these are where to start looking, not settings. Calibrated against the guides listed in
// docs/kb-sources.md and reviewed alongside the KB (docs/kb-review.md).
export const REFERENCE: Record<SourceType, RefRow[]> = {
  'male-vocal': [
    { hz: [20, 100], name: 'Rumble', boost: NEVER, cut: 'High-pass filter at 80–100 Hz removes handling noise, pops and stage rumble.' },
    { hz: [100, 200], name: 'Fullness', boost: 'Thin or weak voice (around 120 Hz).', cut: 'Boomy or chesty, usually from singing very close to the mic.' },
    { hz: [150, 300], name: 'Warmth / mud', boost: 'Lacks warmth.', cut: 'Muddy or cloudy, blending into guitars and keys. Key range, but the most common problem.' },
    { hz: [400, 800], name: 'Boxiness', boost: 'Rarely.', cut: 'Boxy, hollow, "in a can" (often right at 500 Hz).' },
    { hz: [500, 1500], name: 'Nasal / honk', boost: 'A touch helps a voice speak in a dense mix.', cut: 'Nasal, honky or telephone-like.' },
    { hz: [1000, 5000], name: 'Presence / clarity', boost: 'Words hard to understand or vocal buried.', cut: 'Harsh, piercing or shouty, especially on loud notes.' },
    { hz: [5000, 10000], name: 'Sibilance / breath', boost: 'Breathy, intimate sound (gently).', cut: 'Narrow cut for harsh "S" and "T" sounds.' },
    { hz: [10000, 16000], name: 'Air / sheen', boost: 'Dull or lifeless. A broad lift around 12 kHz adds openness.', cut: 'Hissy or brittle.' },
  ],
  'female-vocal': [
    { hz: [20, 150], name: 'Rumble', boost: NEVER, cut: 'High-pass filter at 120–150 Hz. Female voices have little below this.' },
    { hz: [150, 300], name: 'Body / warmth', boost: 'Thin or weak voice.', cut: 'Boomy, chesty or muddy.' },
    { hz: [400, 800], name: 'Boxiness', boost: 'Rarely.', cut: 'Boxy or "in a can" (often around 500 Hz).' },
    { hz: [500, 1500], name: 'Nasal / honk', boost: 'Rarely.', cut: 'Nasal or honky.' },
    { hz: [1000, 5000], name: 'Presence / clarity', boost: 'Words hard to understand or vocal buried.', cut: 'Harsh, shrill or piercing on loud notes.' },
    { hz: [7000, 10000], name: 'Sibilance / breath', boost: 'Breathy, intimate sound (gently).', cut: 'Narrow cut for harsh "S" and "T" sounds.' },
    { hz: [12000, 16000], name: 'Air / sheen', boost: 'Dull or lifeless. A broad lift adds polish.', cut: 'Hissy or brittle.' },
  ],
  'speech-headset': [
    { hz: [20, 150], name: 'Rumble / breath', boost: NEVER, cut: 'High-pass filter at 120–150 Hz. Speech needs almost nothing below this.' },
    { hz: [125, 300], name: 'Chest boom', boost: 'Rarely.', cut: 'Muddy, chesty or boomy. Also lowers feedback risk.' },
    { hz: [250, 600], name: 'Muffle', boost: 'Rarely.', cut: 'Muffled or boxy (try 250 Hz, then 500 Hz).' },
    { hz: [500, 1500], name: 'Nasal / irritating mids', boost: 'Rarely.', cut: 'Nasal, honky or grating (try 1 kHz).' },
    { hz: [2000, 5000], name: 'Intelligibility', boost: 'Hard to understand. Many headsets already have a peak here, so go easy.', cut: 'Harsh, tinny or tiring on long talks.' },
    { hz: [5000, 9000], name: 'Sibilance', boost: 'Rarely.', cut: 'Narrow cut for hissy "S" sounds.' },
  ],
  'speech-handheld': [
    { hz: [20, 120], name: 'Rumble / pops', boost: NEVER, cut: 'High-pass filter at 100–120 Hz removes handling noise and P/B pops.' },
    { hz: [125, 300], name: 'Body / proximity', boost: 'Thin, usually because the mic is held too far away.', cut: 'Boomy or chesty from talking very close.' },
    { hz: [250, 600], name: 'Muffle', boost: 'Rarely.', cut: 'Muffled or boxy (try 250 Hz, then 500 Hz).' },
    { hz: [500, 1500], name: 'Nasal / irritating mids', boost: 'Rarely.', cut: 'Nasal, honky or grating (try 1 kHz).' },
    { hz: [2000, 5000], name: 'Intelligibility', boost: 'Hard to understand.', cut: 'Harsh or shouty when they get loud.' },
    { hz: [5000, 9000], name: 'Sibilance', boost: 'Rarely.', cut: 'Narrow cut for hissy "S" sounds.' },
  ],
  'acoustic-guitar': [
    { hz: [20, 80], name: 'Rumble / handling', boost: NEVER, cut: 'High-pass filter at about 80 Hz (just under the low E) when there\'s a bass player. Solo guitar: lower or off.' },
    { hz: [80, 120], name: 'Bottom', boost: 'Only for a solo guitar with no bass.', cut: 'Boomy, bassy, or feeding back.' },
    { hz: [200, 400], name: 'Warmth / mud', boost: 'Thin or tinny.', cut: 'Muddy, or crowding the vocal (often around 200–250 Hz).' },
    { hz: [400, 1200], name: 'Boxiness', boost: 'Rarely.', cut: 'Boxy or hollow. Plugged-in guitars are often worst around 900 Hz–1 kHz: boost, sweep, then cut.' },
    { hz: [1000, 3000], name: 'Piezo quack', boost: 'Rarely.', cut: 'Quacky or plasticky pickup sound.' },
    { hz: [2000, 5000], name: 'Bite / pick attack', boost: 'Buried in the band.', cut: 'Too much pick or string noise.' },
    { hz: [8000, 14000], name: 'Sparkle / sheen', boost: 'Dull, dark, old strings (try 12 kHz).', cut: 'Zingy or hissy.' },
  ],
  'electric-guitar': [
    { hz: [20, 100], name: 'Rumble / hum', boost: NEVER, cut: 'High-pass filter at 80–100 Hz stops it fighting the bass and removes amp hum (50–60 Hz).' },
    { hz: [150, 300], name: 'Warmth / body', boost: 'Thin or small (try 250–300 Hz).', cut: 'Muddy, woofy, boxy around 200 Hz.' },
    { hz: [500, 1200], name: 'Honk', boost: 'A little gives a solo more push.', cut: 'Nasal, honky or boxy.' },
    { hz: [1000, 4000], name: 'Bite / clarity', boost: 'Buried (try 2.5–3 kHz). This is where a guitar cuts through.', cut: 'Clashing with the vocal.' },
    { hz: [2500, 4500], name: 'Ice pick', boost: 'Rarely.', cut: 'Harsh, piercing, painful in small rooms.' },
    { hz: [5000, 10000], name: 'Distortion / fizz', boost: 'A touch more edge and grit on a distorted tone.', cut: 'Fizzy, buzzy or hissy distortion.' },
    { hz: [8000, 14000], name: 'Air / sheen', boost: 'Dull clean tones (try 12 kHz).', cut: 'Fizz on distorted tones.' },
  ],
  bass: [
    { hz: [20, 40], name: 'Sub rumble', boost: NEVER, cut: 'High-pass filter at 30–40 Hz in boomy rooms. Small speakers can\'t play it anyway.' },
    { hz: [40, 120], name: 'Bottom / weight', boost: 'Thin, weak, no low end (40–80 Hz on big speakers, nearer 80 Hz on small ones).', cut: 'Some notes boom louder than others (room modes).' },
    { hz: [120, 250], name: 'Boom', boost: 'Rarely.', cut: 'Boomy, flabby, woofy.' },
    { hz: [200, 500], name: 'Mud / boxiness', boost: 'Rarely.', cut: 'Muddy (usually 250 Hz), or boxy toward 500 Hz.' },
    { hz: [700, 1000], name: 'Growl / attack', boost: 'Can\'t hear the notes, especially on small speakers.', cut: 'Honky.' },
    { hz: [2000, 4000], name: 'Strings / clarity', boost: 'A little (around 2.5–3 kHz) for definition, slap or pick attack.', cut: 'Clanky, rattly fret noise.' },
  ],
  keys: [
    { hz: [20, 100], name: 'Pedal noise / left hand', boost: NEVER, cut: 'High-pass filter at 80–100 Hz removes sustain-pedal thumps (30–50 Hz) and left-hand mud when there\'s a bass player.' },
    { hz: [80, 120], name: 'Bottom', boost: 'Thin or small, with no bass player.', cut: 'Boomy, or the left hand doubling the bass.' },
    { hz: [200, 400], name: 'Warmth / mud', boost: 'Lacks warmth.', cut: 'Muddy or cloudy. The usual culprit is right around 250 Hz.' },
    { hz: [400, 800], name: 'Boxiness', boost: 'Rarely.', cut: 'Boxy or cheap-sounding (often 500 Hz).' },
    { hz: [2500, 5000], name: 'Presence', boost: 'Piano attack buried in the band.', cut: 'Pads covering the vocals, or harsh samples.' },
    { hz: [5000, 7500], name: 'Shrillness', boost: 'Rarely.', cut: 'Shrill, brittle or clangy.' },
    { hz: [8000, 12000], name: 'Sheen', boost: 'Dull or lifeless (around 10 kHz).', cut: 'Hissy.' },
  ],
  cajon: [
    { hz: [60, 100], name: 'Bass thump', boost: 'No punch, no felt pulse.', cut: 'Too much low end in a small room.' },
    { hz: [100, 200], name: 'Boom', boost: 'Rarely.', cut: 'Boomy or woofy.' },
    { hz: [300, 600], name: 'Box resonance', boost: 'Rarely.', cut: 'Boxy, papery or hollow.' },
    { hz: [2000, 5000], name: 'Slap / snare wires', boost: 'No slap, dull.', cut: 'Harsh or clicky slap.' },
  ],
  kick: [
    { hz: [20, 40], name: 'Sub', boost: 'Not in small rooms.', cut: 'Rumble the speakers can\'t play cleanly. Leave the HPF off a kick, though.' },
    { hz: [40, 80], name: 'Thump (felt)', boost: 'No punch (60–80 Hz on small speakers).', cut: 'Too much low end overall.' },
    { hz: [80, 150], name: 'Boom', boost: 'Rarely.', cut: 'Boomy, flabby, "basketball".' },
    { hz: [250, 600], name: 'Cardboard / boxiness', boost: NEVER, cut: 'Boxy, papery or thuddy. Usually 250 Hz, or sweep from 500 Hz up.' },
    { hz: [2000, 5000], name: 'Smack / beater click', boost: 'Kick disappears on small speakers (try 4 kHz).', cut: 'Too clicky or slappy.' },
    { hz: [8000, 12000], name: 'Air', boost: 'A touch (10 kHz) for a modern, clicky kick.', cut: 'Cymbal bleed.' },
  ],
  snare: [
    { hz: [20, 100], name: 'Kick bleed', boost: NEVER, cut: 'High-pass filter around 80–100 Hz removes kick bleed.' },
    { hz: [120, 250], name: 'Fatness / warmth', boost: 'Thin, no body (130–250 Hz).', cut: 'Boomy or thuddy.' },
    { hz: [300, 900], name: 'Boxiness / ring', boost: 'Rarely.', cut: 'Boxy or honky (often 300–500 Hz). Narrow cut for one ringing tone.' },
    { hz: [2500, 6000], name: 'Crack / snap', boost: 'Dull, no crack (try 3–4 kHz).', cut: 'Harsh or too aggressive.' },
    { hz: [6000, 12000], name: 'Sizzle / hi-hat bleed', boost: 'A touch of sizzle (8–10 kHz).', cut: 'Too much hi-hat in the snare mic.' },
  ],
  toms: [
    { hz: [80, 150], name: 'Boom', boost: 'Rarely in a small room.', cut: 'Floor tom boomy or rumbly.' },
    { hz: [120, 240], name: 'Fullness', boost: 'Small, papery toms.', cut: 'Muddy.' },
    { hz: [200, 1000], name: 'Ringing overtones', boost: NEVER, cut: 'Narrow cut right on the ring.' },
    { hz: [250, 600], name: 'Boxiness', boost: 'Rarely.', cut: 'Boxy or cardboard (try 250 Hz, then sweep from 500 Hz).' },
    { hz: [2000, 6000], name: 'Snap / stick', boost: 'Fills don\'t cut through (snap ~2 kHz, stick ~5 kHz).', cut: 'Clicky or harsh.' },
  ],
  overheads: [
    { hz: [20, 300], name: 'Kit / room wash', boost: NEVER, cut: 'High-pass filter around 300 Hz in small rooms (at least below 125 Hz on a hi-hat mic).' },
    { hz: [100, 600], name: 'Clank / mud', boost: 'Rarely.', cut: 'Muddy, washy or clanky kit.' },
    { hz: [2000, 6000], name: 'Overtones / clang', boost: 'Rarely.', cut: 'Harsh, piercing or trashy cymbals (often 3–4 kHz).' },
    { hz: [8000, 14000], name: 'Sizzle / shimmer', boost: 'Dull cymbals (around 12 kHz).', cut: 'Sizzly or hissy.' },
  ],
  'e-kit': [
    { hz: [50, 80], name: 'Kick weight', boost: 'No punch.', cut: 'Too much low end.' },
    { hz: [80, 200], name: 'Boom', boost: 'Rarely.', cut: 'Boomy samples made for headphones.' },
    { hz: [150, 300], name: 'Drum body', boost: 'Thin or toy-like.', cut: 'Muddy toms.' },
    { hz: [3000, 5000], name: 'Sample hype', boost: 'Kick or snare disappear.', cut: 'Harsh, clicky or fake-sounding.' },
    { hz: [8000, 14000], name: 'Cymbal sizzle', boost: 'Dull cymbals.', cut: 'Brittle cymbal samples.' },
  ],
  'full-mix': [
    { hz: [20, 40], name: 'Sub rumble', boost: NEVER, cut: 'Small speakers can\'t play it. Use a main high-pass filter if you have one.' },
    { hz: [63, 160], name: 'Room boom', boost: 'Mix feels thin. Check bass and kick faders first.', cut: 'The one slider that booms in this room.' },
    { hz: [200, 400], name: 'Mud buildup', boost: NEVER, cut: 'Muddy, cloudy mix. Gentle cut.' },
    { hz: [400, 1000], name: 'Boxy / honky room', boost: 'Rarely.', cut: 'Hollow, megaphone-like mix.' },
    { hz: [2000, 4000], name: 'Fatigue zone', boost: 'Rarely. Fix clarity on channels instead.', cut: 'Harsh, tiring, painful at volume.' },
    { hz: [6000, 12000], name: 'Brightness / air', boost: 'Dull, muffled mix.', cut: 'Brittle or hissy.' },
  ],
};

/**
 * Where the actual notes (fundamentals) are. Everything above is overtones, which is why an HPF
 * just below the bottom of this range is safe. Missing = not a pitched source.
 */
export const NOTE_RANGES: Partial<Record<SourceType, [number, number]>> = {
  'male-vocal': [100, 500], // baritone to tenor
  'female-vocal': [180, 1300], // alto to soprano
  'speech-headset': [85, 255],
  'speech-handheld': [85, 255],
  'acoustic-guitar': [82, 1200],
  'electric-guitar': [82, 1200],
  bass: [31, 500],
  keys: [27.5, 4186], // full piano
  kick: [60, 250],
  snare: [120, 1500],
  toms: [100, 1500],
};

const LOG_SPAN = Math.log10(20000 / 20);

/** Position of a frequency on a 20 Hz–20 kHz log axis, 0–100. */
export const logPercent = (hz: number) => (Math.log10(Math.min(20000, Math.max(20, hz)) / 20) / LOG_SPAN) * 100;
