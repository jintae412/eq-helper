import type { SourceType } from './knowledgeBase';

export interface RefRow {
  hz: [number, number];
  name: string;
  boost: string; // when to boost here
  cut: string; // when to cut here
}

const NEVER = 'Almost never.';

// Same "rules of thumb" caveat as the knowledge base: every voice, instrument and room differs,
// so these are where to start looking, not settings. Reviewed alongside the KB (docs/kb-review.md).
export const REFERENCE: Record<SourceType, RefRow[]> = {
  'male-vocal': [
    { hz: [20, 100], name: 'Rumble', boost: NEVER, cut: 'High-pass filter at 80–100 Hz removes handling noise, pops and stage rumble.' },
    { hz: [100, 250], name: 'Body / warmth', boost: 'Thin or weak voice.', cut: 'Boomy or chesty, usually from singing very close to the mic.' },
    { hz: [250, 500], name: 'Mud', boost: 'Rarely.', cut: 'Muddy or cloudy, blending into guitars and keys.' },
    { hz: [500, 1000], name: 'Boxiness', boost: 'Rarely.', cut: 'Boxy, hollow, "in a can".' },
    { hz: [1000, 2000], name: 'Nasal / honk', boost: 'A touch helps a voice speak in a dense mix.', cut: 'Nasal, honky or telephone-like.' },
    { hz: [2000, 5000], name: 'Presence / clarity', boost: 'Words hard to understand or vocal buried.', cut: 'Harsh, piercing or shouty, especially on loud notes.' },
    { hz: [5000, 8000], name: 'Sibilance', boost: 'Rarely.', cut: 'Narrow cut for harsh "S" and "T" sounds.' },
    { hz: [8000, 16000], name: 'Air', boost: 'Dull or lifeless. A broad lift adds openness.', cut: 'Hissy or brittle.' },
  ],
  'female-vocal': [
    { hz: [20, 150], name: 'Rumble', boost: NEVER, cut: 'High-pass filter at 120–150 Hz. Female voices have little below this.' },
    { hz: [150, 300], name: 'Body / warmth', boost: 'Thin or weak voice.', cut: 'Boomy or chesty from singing close.' },
    { hz: [300, 600], name: 'Mud / boxiness', boost: 'Rarely.', cut: 'Muddy, boxy or "in a can".' },
    { hz: [800, 1500], name: 'Nasal / honk', boost: 'Rarely.', cut: 'Nasal or honky.' },
    { hz: [2500, 5000], name: 'Presence / clarity', boost: 'Words hard to understand or vocal buried.', cut: 'Harsh, shrill or piercing on loud notes.' },
    { hz: [6000, 10000], name: 'Sibilance', boost: 'Rarely.', cut: 'Narrow cut for harsh "S" and "T" sounds.' },
    { hz: [10000, 16000], name: 'Air', boost: 'Dull or lifeless. A broad lift adds polish.', cut: 'Hissy or brittle.' },
  ],
  'speech-headset': [
    { hz: [20, 150], name: 'Rumble / breath', boost: NEVER, cut: 'High-pass filter at 120–150 Hz. Speech needs almost nothing below this.' },
    { hz: [150, 300], name: 'Chest boom', boost: 'Rarely.', cut: 'Muddy, chesty or boomy. Also lowers feedback risk.' },
    { hz: [300, 600], name: 'Muffle', boost: 'Rarely.', cut: 'Muffled or boxy.' },
    { hz: [800, 1500], name: 'Nasal', boost: 'Rarely.', cut: 'Nasal or telephone-like.' },
    { hz: [2000, 5000], name: 'Intelligibility', boost: 'Hard to understand. Many headsets already have a peak here, so go easy.', cut: 'Harsh, tinny or tiring on long talks.' },
    { hz: [5000, 9000], name: 'Sibilance', boost: 'Rarely.', cut: 'Narrow cut for hissy "S" sounds.' },
  ],
  'speech-handheld': [
    { hz: [20, 120], name: 'Rumble / pops', boost: NEVER, cut: 'High-pass filter at 100–120 Hz removes handling noise and P/B pops.' },
    { hz: [150, 300], name: 'Body / proximity', boost: 'Thin, usually because the mic is held too far away.', cut: 'Boomy or chesty from talking very close.' },
    { hz: [300, 600], name: 'Muffle', boost: 'Rarely.', cut: 'Muffled or boxy.' },
    { hz: [2000, 5000], name: 'Intelligibility', boost: 'Hard to understand.', cut: 'Harsh or shouty when they get loud.' },
    { hz: [5000, 9000], name: 'Sibilance', boost: 'Rarely.', cut: 'Narrow cut for hissy "S" sounds.' },
  ],
  'acoustic-guitar': [
    { hz: [20, 90], name: 'Rumble / handling', boost: NEVER, cut: 'High-pass filter at 80–90 Hz. The bass player covers this range.' },
    { hz: [90, 200], name: 'Body resonance / boom', boost: 'Only for a solo guitar with no bass.', cut: 'Boomy, bassy, or feeding back.' },
    { hz: [200, 400], name: 'Warmth / mud', boost: 'Thin or tinny.', cut: 'Muddy, or crowding the vocal.' },
    { hz: [400, 900], name: 'Boxiness', boost: 'Rarely.', cut: 'Boxy or hollow.' },
    { hz: [1000, 3000], name: 'Piezo quack', boost: 'Rarely.', cut: 'Quacky or plasticky pickup sound.' },
    { hz: [3000, 6000], name: 'Pick attack / clarity', boost: 'Buried in the band.', cut: 'Too much pick or string noise.' },
    { hz: [8000, 12000], name: 'Sparkle', boost: 'Dull, dark, old strings.', cut: 'Zingy or hissy.' },
  ],
  'electric-guitar': [
    { hz: [20, 100], name: 'Low rumble', boost: NEVER, cut: 'High-pass filter at 80–100 Hz so it stops fighting the bass.' },
    { hz: [100, 300], name: 'Body / chunk', boost: 'Thin or small.', cut: 'Muddy, woofy, fighting the bass.' },
    { hz: [500, 1200], name: 'Honk', boost: 'A little gives a solo more push.', cut: 'Nasal, honky or boxy.' },
    { hz: [1000, 3000], name: 'Bite', boost: 'Buried. This is where a guitar cuts through.', cut: 'Clashing with the vocal.' },
    { hz: [2500, 4500], name: 'Ice pick', boost: 'Rarely.', cut: 'Harsh, piercing, painful in small rooms.' },
    { hz: [6000, 10000], name: 'Fizz', boost: NEVER, cut: 'Fizzy, buzzy or hissy distortion.' },
  ],
  bass: [
    { hz: [20, 40], name: 'Sub rumble', boost: NEVER, cut: 'High-pass filter at 30–40 Hz in boomy rooms. Small speakers can\'t play it anyway.' },
    { hz: [40, 120], name: 'Weight / fundamental', boost: 'Thin, weak, no bottom.', cut: 'Some notes boom louder than others (room modes).' },
    { hz: [120, 250], name: 'Boom', boost: 'Rarely.', cut: 'Boomy, flabby, woofy.' },
    { hz: [200, 400], name: 'Mud', boost: 'Rarely.', cut: 'Muddy, blending into guitars and keys.' },
    { hz: [700, 1000], name: 'Growl / definition', boost: 'Can\'t hear the notes, especially on small speakers.', cut: 'Honky or clanky.' },
    { hz: [2000, 5000], name: 'String / fret clank', boost: 'A little for slap or pick attack.', cut: 'Clanky, rattly fret noise.' },
  ],
  keys: [
    { hz: [20, 100], name: 'Left-hand rumble', boost: NEVER, cut: 'High-pass filter at 80–100 Hz when there\'s a bass player.' },
    { hz: [100, 250], name: 'Body', boost: 'Thin or small.', cut: 'Boomy, or the left hand doubling the bass.' },
    { hz: [250, 500], name: 'Mud', boost: 'Rarely.', cut: 'Muddy or cloudy.' },
    { hz: [400, 800], name: 'Boxiness', boost: 'Rarely.', cut: 'Boxy or cheap-sounding.' },
    { hz: [2000, 4000], name: 'Presence', boost: 'Piano attack buried in the band.', cut: 'Pads covering the vocals.' },
    { hz: [3000, 5000], name: 'Digital brightness', boost: 'Rarely.', cut: 'Harsh, brittle or clangy samples.' },
    { hz: [5000, 10000], name: 'Sparkle', boost: 'Dull or lifeless.', cut: 'Hissy.' },
  ],
  cajon: [
    { hz: [60, 100], name: 'Bass thump', boost: 'No punch, no felt pulse.', cut: 'Too much low end in a small room.' },
    { hz: [100, 200], name: 'Boom', boost: 'Rarely.', cut: 'Boomy or woofy.' },
    { hz: [300, 600], name: 'Box resonance', boost: 'Rarely.', cut: 'Boxy, papery or hollow.' },
    { hz: [2000, 5000], name: 'Slap / snare wires', boost: 'No slap, dull.', cut: 'Harsh or clicky slap.' },
  ],
  kick: [
    { hz: [20, 50], name: 'Sub', boost: 'Not in small rooms.', cut: 'Rumble the speakers can\'t play cleanly.' },
    { hz: [50, 80], name: 'Thump (felt)', boost: 'No punch.', cut: 'Too much low end overall.' },
    { hz: [80, 150], name: 'Boom', boost: 'Rarely.', cut: 'Boomy, flabby, "basketball".' },
    { hz: [300, 500], name: 'Cardboard', boost: NEVER, cut: 'Boxy, papery or thuddy.' },
    { hz: [2000, 5000], name: 'Beater click', boost: 'Kick disappears on small speakers.', cut: 'Too clicky or slappy.' },
  ],
  snare: [
    { hz: [20, 100], name: 'Kick bleed', boost: NEVER, cut: 'High-pass filter around 80–100 Hz removes kick bleed.' },
    { hz: [150, 250], name: 'Body / fatness', boost: 'Thin, no body.', cut: 'Boomy or thuddy.' },
    { hz: [400, 900], name: 'Boxiness / ring', boost: 'Rarely.', cut: 'Boxy or honky. Narrow cut for one ringing tone.' },
    { hz: [3000, 6000], name: 'Crack / snap', boost: 'Dull, no crack.', cut: 'Harsh or too aggressive.' },
    { hz: [6000, 10000], name: 'Wires / hi-hat bleed', boost: 'A touch of sizzle.', cut: 'Too much hi-hat in the snare mic.' },
  ],
  toms: [
    { hz: [80, 150], name: 'Body / boom', boost: 'Rack toms sound small.', cut: 'Floor tom boomy or rumbly.' },
    { hz: [200, 1000], name: 'Ringing overtones', boost: NEVER, cut: 'Narrow cut right on the ring.' },
    { hz: [300, 600], name: 'Boxiness', boost: 'Rarely.', cut: 'Boxy or cardboard.' },
    { hz: [3000, 6000], name: 'Stick attack', boost: 'Fills don\'t cut through.', cut: 'Clicky or harsh.' },
  ],
  overheads: [
    { hz: [20, 300], name: 'Kit / room wash', boost: NEVER, cut: 'High-pass filter around 300 Hz in small rooms. Close mics handle the drums.' },
    { hz: [300, 600], name: 'Boxiness', boost: 'Rarely.', cut: 'Muddy, washy or boxy kit.' },
    { hz: [2000, 5000], name: 'Clang', boost: 'Rarely.', cut: 'Harsh, trashy or clangy cymbals.' },
    { hz: [8000, 14000], name: 'Shimmer', boost: 'Dull cymbals.', cut: 'Sizzly or hissy.' },
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

const LOG_SPAN = Math.log10(20000 / 20);

/** Position of a frequency on a 20 Hz–20 kHz log axis, 0–100. */
export const logPercent = (hz: number) => (Math.log10(Math.min(20000, Math.max(20, hz)) / 20) / LOG_SPAN) * 100;
