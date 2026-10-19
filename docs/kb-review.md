# EQ Helper: knowledge base review

> Generated from the app's data by `npm run kb:review`. Don't edit by hand; send notes back
> and the source gets changed, then this file is regenerated.

**What to check:** Is each move a sensible *starting point* for a small worship room? Is the
"why" correct and understandable to a volunteer? Anything dangerous (feedback risk, too much
boost)? Tick ☐ → ☑ when a row looks right, and write changes in the Notes column.

Frequencies are starting points; the app tells users to try nearby within the "usually" range.
Where these values came from, and where the app deliberately differs from its sources, is in
[kb-sources.md](kb-sources.md).

## EQ advice (72 entries)

| OK | Source | Symptom | Move | Non-EQ fixes | Why | Notes |
|---|---|---|---|---|---|---|
| ☐ | Male vocal, Female vocal | Muddy | HPF at 100 Hz; Cut 300 Hz −4 dB, Q 1.4 (usually 200 Hz–400 Hz) | Female vocals can take the HPF higher, around 120–150 Hz. Have the singer back off the mic an inch. Singing very close boosts the lows (proximity effect). | Chest resonance and proximity effect pile up at 200–400 Hz, the same range as acoustic guitar body and keys. Cutting it lets the vocal sit on top instead of blending into the mush. |  |
| ☐ | Male vocal, Female vocal | Boxy | Cut 500 Hz −3 dB, Q 2 (usually 400 Hz–800 Hz) | Make sure the singer isn't cupping the mic grille with their hand. | A buildup around 400–800 Hz makes a voice sound like it's coming out of a box. A modest cut opens it up without thinning it. |  |
| ☐ | Male vocal, Female vocal, Speaker (headset), Speaker (handheld) | Nasal / honky | Cut 1 kHz −3 dB, Q 2 (usually 500 Hz–1.5 kHz) | n/a | Nasal honk usually lives around 1 kHz, but on some voices it's as low as 500 Hz. Pulling it back a little makes the voice sound more natural and less "telephone". |  |
| ☐ | Male vocal, Female vocal | Harsh | Cut 3 kHz −3 dB, Q 2 (usually 2.5 kHz–4 kHz) | Ask the singer to angle slightly off the mic on loud notes. | Ears are most sensitive at 2.5–4 kHz, so too much there gets tiring fast, especially on loud belted notes. A small cut keeps clarity without the sting. |  |
| ☐ | Male vocal, Female vocal | Harsh "S" sounds | Cut 6.5 kHz −3 dB, Q 4 (usually 5 kHz–10 kHz) | Angle the mic slightly off-axis from the mouth. | "S" and "T" sounds are concentrated in a narrow band somewhere in 5–10 kHz (higher voices sit higher). A narrow cut tames them without dulling the whole voice. |  |
| ☐ | Male vocal, Female vocal | Buried / can't hear it | Boost 3 kHz +2 dB, Q 1.4 (usually 1 kHz–5 kHz) | Better: cut 2–4 kHz by 2–3 dB on acoustic and keys to make room. That avoids raising feedback risk on the vocal mic. Check the singer is close to the mic. | Word clarity lives at 1–5 kHz, strongest around 2–4 kHz. If instruments fill that range, the vocal gets masked no matter how loud it is. Making room beats turning it up. |  |
| ☐ | Male vocal, Female vocal | Thin | Boost 200 Hz +2 dB, Q 1.4 (usually 120 Hz–300 Hz) | Check the HPF isn't set too high. Have the singer move a little closer to the mic. | Body and warmth sit around 120–300 Hz (lower for deep voices). A small boost restores weight. Go easy: too much here turns into mud. |  |
| ☐ | Male vocal, Female vocal | Dull | Boost 10 kHz +2 dB, Q 0.7 (usually 5 kHz–14 kHz) | Check the mic grille isn't covered or cupped. | "Air" and breathiness above 5 kHz adds openness and polish. A gentle, broad lift brightens without harshness. |  |
| ☐ | Male vocal, Female vocal, Speaker (handheld), Speaker (headset) | Pops on P/B | HPF at 120 Hz | Angle the mic so breath goes past it, not into it. A foam windscreen helps a lot. | P and B sounds are bursts of air hitting the mic, which shows up as low-frequency thumps. A high-pass filter removes most of it without touching the voice. |  |
| ☐ | Male vocal, Female vocal | Boomy | HPF at 100 Hz; Cut 150 Hz −3 dB, Q 1.4 (usually 100 Hz–200 Hz) | Have the singer back off the mic an inch or two. The closer they sing, the more bass the mic adds (proximity effect). | Below about 200 Hz a voice is mostly chest rumble and proximity boom, not words. Filtering and trimming it tightens the vocal and leaves the low end to bass and kick. |  |
| ☐ | Speaker (headset) | Muddy / Boomy | HPF at 150 Hz; Cut 250 Hz −4 dB, Q 1.4 (usually 150 Hz–300 Hz) | Check the mic element sits at the corner of the mouth, not against the cheek or in front of the lips. | Speech needs almost nothing below 150 Hz, and headsets pick up chest resonance. Cutting the lows makes the speaker clearer and lowers feedback risk. |  |
| ☐ | Speaker (headset) | Harsh / Thin | Cut 4 kHz −3 dB, Q 2 (usually 3 kHz–5 kHz) | n/a | Many headset mics have a built-in presence peak around 3–5 kHz. Taming it makes long sermons less fatiguing. |  |
| ☐ | Speaker (handheld) | Muddy / Boomy | HPF at 120 Hz; Cut 250 Hz −3 dB, Q 1.4 (usually 200 Hz–300 Hz) | Have them hold the mic about a fist-width from the mouth. | Talking close to a handheld boosts the lows (proximity effect). Speech intelligibility lives higher up, so trimming the lows only helps. |  |
| ☐ | Speaker (handheld) | Harsh | Cut 3 kHz −3 dB, Q 2 (usually 2.5 kHz–4 kHz) | If they get loud when excited, a little compression helps more than EQ. | Ears are most sensitive at 2.5–4 kHz. A raised speaking voice piles energy there, so a small cut keeps them clear without the sting. |  |
| ☐ | Speaker (handheld) | Thin | Boost 200 Hz +2 dB, Q 1.4 (usually 150 Hz–250 Hz) | Usually the mic is too far away. Ask them to hold it about a fist-width from the mouth, pointed at it. Check the HPF isn't set too high. | Holding a handheld at chest height loses the voice's body. Distance is the real fix, and a small boost at 150–250 Hz restores some warmth meanwhile. |  |
| ☐ | Speaker (headset), Speaker (handheld) | Harsh "S" sounds | Cut 7 kHz −3 dB, Q 4 (usually 5 kHz–9 kHz) | Headset: move the mic element a little further back toward the cheek, out of the direct breath stream. Handheld: hold the mic slightly below the chin, pointing up at the mouth, rather than straight in front of it. | "S" and "T" sounds sit in a narrow band around 5–9 kHz, and headsets placed right at the mouth exaggerate them. A narrow cut tames the hiss without dulling the voice. |  |
| ☐ | Speaker (headset), Speaker (handheld) | Dull / Buried / can't hear it | Cut 300 Hz −2 dB, Q 1.4 (usually 200 Hz–400 Hz); Boost 3 kHz +2 dB, Q 1.4 (usually 2 kHz–5 kHz) | Turn background music or pads down while they talk. Check the mic placement: a headset at the corner of the mouth, a handheld about a fist-width away. Headset tucked under hair, a scarf or a beard? Move it clear. Check the channel gain (trim) is set so normal talking shows a healthy level. Too little gain means pushing the fader and EQ to make up for it. | Words are carried by consonants at 2–5 kHz, and low-mid mud at 200–400 Hz covers them up. Trimming one and gently lifting the other makes speech easier to follow without just making it louder. |  |
| ☐ | Acoustic guitar | Boomy | HPF at 80 Hz; Cut 150 Hz −4 dB, Q 1.4 (usually 100 Hz–200 Hz) | If it has a mic, move it away from the soundhole. A soundhole cover tames body boom and feedback. Solo guitar with no bass player? Set the HPF lower (around 60 Hz) or leave it off, so the guitar keeps its bottom end. | The guitar body resonates around 100–200 Hz. The bass player already covers the low end, so cutting it cleans up the mix and lowers feedback risk. |  |
| ☐ | Acoustic guitar | Muddy | Cut 250 Hz −3 dB, Q 1.4 (usually 200 Hz–400 Hz) | n/a | Acoustic low-mids overlap directly with vocal body. Cutting here gives the singer room. |  |
| ☐ | Acoustic guitar | Quacky / plasticky | Cut 1.8 kHz −3 dB, Q 2 (usually 1 kHz–3 kHz) | n/a | Under-saddle piezo pickups have a "quack" somewhere in 1–3 kHz. Finding and cutting it makes the guitar sound more like a real acoustic. |  |
| ☐ | Acoustic guitar | Too much string noise | Cut 4 kHz −3 dB, Q 1.4 (usually 3 kHz–6 kHz); Cut 10 kHz −2 dB, Q 0.7 (usually 8 kHz–12 kHz) | A thinner pick, or strumming nearer the neck, softens attack. | Pick attack and string zing live at 3–6 kHz, where ears are most sensitive, so a little goes a long way. Taming it keeps the guitar present without competing with vocal clarity. |  |
| ☐ | Acoustic guitar | Buried / can't hear it | Boost 3.5 kHz +2 dB, Q 1.4 (usually 2 kHz–5 kHz) | Cut 200–300 Hz on the acoustic instead of turning it up. Less mud often reads as more presence. | Bite at 2–5 kHz cuts through a band better than volume does. Volume mostly adds low-mid mud. |  |
| ☐ | Acoustic guitar | Boxy | Cut 900 Hz −3 dB, Q 2 (usually 400 Hz–1.2 kHz) | Find the exact spot: Listen → Guided check walks you through boost, sweep, then cut. If it has a mic, aim it at where the neck meets the body (around the 12th–14th fret), not the soundhole. | Acoustics, especially plugged-in ones, often build up a hollow, boxy tone around 900 Hz–1 kHz, sometimes lower. A modest cut makes it sound more open and natural. |  |
| ☐ | Acoustic guitar | Thin | Boost 200 Hz +2 dB, Q 1.4 (usually 150 Hz–300 Hz) | Check the HPF isn't set too high (about 80 Hz is plenty). Piezo pickups often sound thin. If the guitar has a blend knob, add some of its internal mic. | An acoustic's warmth lives around 150–300 Hz. A small boost gives it body. Go easy: it's the same range that turns into mud with the vocals. |  |
| ☐ | Acoustic guitar | Dull | Boost 12 kHz +2 dB, Q 0.7 (usually 8 kHz–14 kHz) | Old strings sound dull and no EQ fully fixes that. Fresh strings make a big difference. | Shimmer and sparkle sit above 8 kHz, around 12 kHz. A gentle, broad lift brings it back without adding pick scratch. |  |
| ☐ | Electric guitar | Muddy / Boomy | HPF at 100 Hz; Cut 250 Hz −3 dB, Q 1.4 (usually 200 Hz–300 Hz) | n/a | Electric guitar low end fights the bass. Cutting it makes both clearer, and the HPF also removes amp hum (50–60 Hz). |  |
| ☐ | Electric guitar | Harsh | Cut 3.5 kHz −3 dB, Q 2 (usually 2.5 kHz–4.5 kHz) | Move the amp mic slightly off the center of the speaker cone. Tilt the amp so it points at the player, not the audience. | Amp "ice pick" sits around 2.5–4.5 kHz and is especially painful in small rooms. |  |
| ☐ | Electric guitar | Fizzy | Cut 8 kHz −4 dB, Q 0.7 (usually 6 kHz–10 kHz) | n/a | Amp and pedal fizz above 6 kHz adds nothing musical. Rolling it off smooths the guitar. |  |
| ☐ | Electric guitar | Nasal / honky | Cut 800 Hz −3 dB, Q 2 (usually 500 Hz–1.2 kHz) | n/a | Some amps and pedals pile up a honk around 500 Hz–1.2 kHz. A small cut keeps the guitar's character while taking off the megaphone edge. |  |
| ☐ | Electric guitar | Thin | Boost 250 Hz +2 dB, Q 1.4 (usually 150 Hz–300 Hz) | Move the amp mic a little toward the edge of the speaker cone for a warmer sound. Ask the guitarist to add some bass or mids on the amp itself. | Body and warmth sit around 250–300 Hz. A small boost fills the guitar out. Don't overdo it, or it starts fighting the bass. |  |
| ☐ | Electric guitar | Dull | Boost 12 kHz +2 dB, Q 0.7 (usually 8 kHz–14 kHz) | Check the amp mic is pointed at the speaker cone, not the edge of the cabinet. | Air and sheen above 8 kHz make a clean guitar shimmer. A gentle, broad lift brings it back. Skip this on heavily distorted tones, where it turns into fizz. |  |
| ☐ | Electric guitar | Buried / can't hear it | Boost 2.5 kHz +2 dB, Q 1.4 (usually 1 kHz–4 kHz) | Better: cut 1–3 kHz a little on keys or acoustic so the electric has its own space. | An electric guitar's bite and clarity live at 1–4 kHz. That's what lets it cut through, and volume alone mostly adds mud. |  |
| ☐ | Bass | Boomy | HPF at 35 Hz; Cut 100 Hz −3 dB, Q 1.4 (usually 80 Hz–150 Hz) | Get the bass amp off the floor and away from walls or corners. | Small rooms exaggerate certain low frequencies (room modes). A small cut evens out the notes so some don't jump out. |  |
| ☐ | Bass | Muddy | Cut 250 Hz −3 dB, Q 1.4 (usually 200 Hz–500 Hz) | n/a | Bass mud usually sits around 250 Hz, with boxiness up to 500 Hz. These low-mids overlap guitar and keys. Cutting here separates the bass from everything else. |  |
| ☐ | Bass | No definition / Buried / can't hear it | Boost 800 Hz +3 dB, Q 1.4 (usually 700 Hz–1 kHz); Boost 2.5 kHz +2 dB, Q 1.4 (usually 2 kHz–4 kHz) | n/a | Small PA speakers can't reproduce deep lows, so people actually hear bass through its growl around 700 Hz–1 kHz and its string attack around 2.5 kHz. |  |
| ☐ | Bass | Thin | Boost 80 Hz +3 dB, Q 1.4 (usually 40 Hz–120 Hz) | Walk to the middle of the room before boosting. The low end at the board can be very different. Check the bass channel's HPF is off. | A bass's weight lives at 60–120 Hz. If that's missing it feels weak. Small speakers can only do so much here, so check by ear in the room first. |  |
| ☐ | Bass | Too much string noise | Cut 3 kHz −3 dB, Q 1.4 (usually 2 kHz–5 kHz) | A bass plugged straight into the board picks up every fret buzz. Ask them to roll the tone knob back a little. | String and fret clank live at 2–5 kHz, right where ears are sensitive. A small cut keeps the growl and loses the clatter. |  |
| ☐ | Keys | Muddy / Boomy | HPF at 100 Hz; Cut 250 Hz −3 dB, Q 1.4 (usually 200 Hz–400 Hz) | When a bass player is present, ask keys to lighten the left hand. Find the exact spot: Listen → Guided check walks you through boost, sweep, then cut. It's often right around 250 Hz. | A piano's left hand doubles the bass, and keys mud usually sits right around 250 Hz. In a full band, trimming its lows clears space for bass and vocals. |  |
| ☐ | Keys | Overpowering others | Cut 3 kHz −2 dB, Q 1 (usually 2 kHz–4 kHz) | Ask for pads an octave higher or lower than the vocal melody. | Pads fill the same 2–4 kHz range as vocal clarity. A broad, gentle dip carves a pocket for the singer without making the pad disappear. |  |
| ☐ | Keys | Harsh | Cut 4 kHz −3 dB, Q 2 (usually 2.5 kHz–7.5 kHz) | n/a | Digital piano samples are often bright at 2.5–5 kHz and shrill up to 7.5 kHz. Softening this makes them sit back in the mix. |  |
| ☐ | Keys | Boxy | Cut 500 Hz −3 dB, Q 2 (usually 400 Hz–800 Hz) | n/a | Some piano and organ sounds build up a hollow tone around 400–800 Hz. A modest cut makes them sound bigger and more open. |  |
| ☐ | Keys | Thin | Boost 150 Hz +2 dB, Q 1.4 (usually 100 Hz–250 Hz) | Check you're getting the right output. One side of a stereo keyboard (L only) can sound thin, so use the mono output or both L and R. Check the keyboard's own EQ or patch isn't set thin. | Piano body sits around 100–250 Hz. A small boost restores weight. With a bass player present, keep it subtle so they don't clash. |  |
| ☐ | Keys | Dull | Boost 10 kHz +2 dB, Q 0.7 (usually 7.5 kHz–12 kHz) | Many keyboards have a brightness or tone control. Try that first. | Sheen and sparkle sit around 10 kHz, above the shrill range. A gentle, broad lift brings the keys forward without making them harsh. |  |
| ☐ | Cajón | Boomy | Cut 150 Hz −3 dB, Q 1.4 (usually 100 Hz–200 Hz) | n/a | Cajón low end can excite the room. A small cut keeps the thump tight. |  |
| ☐ | Cajón | Boxy | Cut 450 Hz −3 dB, Q 2 (usually 300 Hz–600 Hz) | n/a | A cajón is literally a box, and its resonance around 300–600 Hz can sound papery. Cutting it makes the bass tone and slap stand out. |  |
| ☐ | Cajón | No punch | Boost 80 Hz +3 dB, Q 1.4 (usually 60 Hz–100 Hz) | If mic'd from the back, try the mic closer to the port hole. | The cajón's "kick" lives around 60–100 Hz. A boost there gives the band a felt pulse. |  |
| ☐ | Kick drum | Boxy / Muddy | Cut 400 Hz −4 dB, Q 1.4 (usually 250 Hz–600 Hz) | Find the exact spot: Listen → Guided check walks you through boost, sweep, then cut. It's usually between 250 and 500 Hz. | The cardboard sound of a kick sits around 250–500 Hz. Scooping it leaves the thump and the click. |  |
| ☐ | Kick drum, Electronic kit | No punch | Boost 70 Hz +3 dB, Q 1.4 (usually 60 Hz–80 Hz); Boost 3.5 kHz +2 dB, Q 1.4 (usually 2 kHz–5 kHz) | n/a | Punch is two things: low thump (60–80 Hz) you feel and beater click (2–5 kHz) that lets you hear the kick on small speakers. |  |
| ☐ | Snare, Toms | Ringing | Cut 500 Hz −4 dB, Q 6 (usually 200 Hz–1 kHz) | A small piece of dampening gel on the drum head fixes this better than EQ. | Ring is one sustained overtone, so a narrow cut right on it removes the ring without dulling the drum. It can be anywhere in 200 Hz–1 kHz, so listen for where it lives. |  |
| ☐ | Toms | Boxy / Muddy | Cut 400 Hz −3 dB, Q 1.4 (usually 250 Hz–600 Hz) | Find the exact spot: Listen → Guided check walks you through boost, sweep, then cut. | Toms get boxy around 250–600 Hz. A cut leaves the body and attack. |  |
| ☐ | Overheads / cymbals | Harsh / Overpowering others | HPF at 300 Hz; Cut 3.5 kHz −3 dB, Q 1.4 (usually 2 kHz–6 kHz) | In small rooms, cymbals are often loud enough acoustically. Try the overheads much lower or off. | In small rooms the overheads are only needed for cymbals, so filtering their lows removes extra kit mud, and a cut at 2–5 kHz tames the harsh wash. |  |
| ☐ | Electronic kit | Harsh | Cut 4 kHz −3 dB, Q 1.4 (usually 3 kHz–5 kHz) | n/a | E-kit samples are often hyped at 3–5 kHz. Softening this makes them sound more natural in a room. |  |
| ☐ | Cajón | Dull | Boost 3 kHz +2 dB, Q 1.4 (usually 2 kHz–5 kHz) | If it's only mic'd at the back port, add a mic on the front (playing) face for the slap. | The cajón's slap and snare-wire buzz live at 2–5 kHz. A small lift brings back the "snare" half of the instrument. |  |
| ☐ | Kick drum | Boomy | Cut 100 Hz −3 dB, Q 1.4 (usually 80 Hz–150 Hz) | In a small room the kick often needs less low end than you'd think. Try the fader down first. A small pillow or blanket inside the drum tightens the boom. | Kick boom at 80–150 Hz excites small rooms and smears the groove. Trimming it leaves the deep thump (60–80 Hz) and the click. |  |
| ☐ | Kick drum | Too clicky | Cut 3.5 kHz −3 dB, Q 1.4 (usually 2 kHz–5 kHz) | A felt beater instead of a plastic or wood one softens the click. | Beater click lives at 2–5 kHz. A little helps the kick be heard on small speakers, but too much pokes out like a metronome. |  |
| ☐ | Snare | Boxy / Muddy | Cut 500 Hz −3 dB, Q 1.4 (usually 300 Hz–900 Hz) | n/a | Snares get a boxy, honky tone around 300–900 Hz. A cut there leaves the body (around 200 Hz) and the crack. |  |
| ☐ | Snare | Thin | Boost 200 Hz +2 dB, Q 1.4 (usually 120 Hz–250 Hz) | Angle the mic about 45° to the head, two fingers above the rim, pointed at the center. | A snare's body and fatness live around 120–250 Hz. A small boost gives it weight without making it boomy. |  |
| ☐ | Snare | Dull | Boost 3.5 kHz +2 dB, Q 1.4 (usually 2.5 kHz–6 kHz) | A snare that's over-dampened (lots of gel or tape) sounds dead. Take some off. | The snare's crack sits at 3–6 kHz. A small boost brings back the snap that makes the backbeat feel alive. |  |
| ☐ | Snare | Harsh | Cut 7 kHz −3 dB, Q 1.4 (usually 5 kHz–10 kHz) | Aim the snare mic so its back points at the hi-hat. Most mics reject sound from behind. | The hi-hat sits right next to the snare and bleeds into its mic above 5 kHz. Cutting there tames the wash without losing the snare's crack. |  |
| ☐ | Toms | Boomy | Cut 100 Hz −3 dB, Q 1.4 (usually 80 Hz–150 Hz) | If your mixer has gates, a gate on the tom channels stops them booming and picking up the kit between hits. | Floor toms especially boom at 80–150 Hz in small rooms. A small cut keeps them big without muddying the bass and kick. |  |
| ☐ | Toms | Thin | Boost 150 Hz +2 dB, Q 1.4 (usually 100 Hz–240 Hz) | Tuning matters more than EQ here. Very high-tuned toms sound small whatever you do. | Tom fullness lives around 120–240 Hz. A small boost gives fills some weight. Keep it gentle so the floor tom doesn't start to boom. |  |
| ☐ | Toms | Dull / No punch | Boost 4 kHz +2 dB, Q 1.4 (usually 2 kHz–6 kHz) | n/a | The snap and stick attack on toms is at 2–6 kHz. A small lift makes fills cut through without turning them up. |  |
| ☐ | Overheads / cymbals | Muddy / Boomy | HPF at 300 Hz; Cut 400 Hz −3 dB, Q 1.4 (usually 300 Hz–600 Hz) | Aim the overheads at the cymbals, not down at the drums. | The overheads mostly pick up the whole kit and the room below about 600 Hz. In a small room that's just extra mud, so let the close mics handle the drums. |  |
| ☐ | Overheads / cymbals | Dull | Boost 12 kHz +2 dB, Q 0.7 (usually 8 kHz–14 kHz) | Cymbals usually carry fine in a small room by themselves. Mute the overheads to compare before boosting. Barely any sound at all? Condenser mics need phantom power (48V) turned on for that channel. | Cymbal shimmer lives above 8 kHz. A broad, gentle lift adds sparkle without the clang at 2–5 kHz. |  |
| ☐ | Electronic kit | Boomy / Muddy | Cut 120 Hz −3 dB, Q 1.4 (usually 80 Hz–200 Hz) | E-kit kick samples are often made for headphones, with huge low end. Turn the kick down in the module's own mixer. | Sampled kicks and toms often carry far more 80–200 Hz than a real kit. Through a PA in a small room that booms, so a small cut tightens it. |  |
| ☐ | Electronic kit | Thin | Boost 200 Hz +2 dB, Q 1.4 (usually 150 Hz–300 Hz) | Check you're getting both module outputs (L and R) or the mono output. One side of a stereo kit can be missing drums. | Drum body lives around 150–300 Hz. If the kit sounds like a toy, a small boost there gives it some weight. |  |
| ☐ | Whole mix | Muddy | Cut 315 Hz −3 dB, Q 1.4 (usually 200 Hz–400 Hz) | First check each channel: HPF on everything except bass and kick. | Every instrument contributes some low-mids, and small rooms add their own buildup. A gentle dip on the mains clears the whole mix. |  |
| ☐ | Whole mix | Boomy | Cut 125 Hz −3 dB, Q 2 (usually 100 Hz–160 Hz) | Turn bass and kick down first. Low end builds up in small rooms. | Small rooms boost particular low frequencies (room modes). Cutting the one that booms evens out the low end for everyone. |  |
| ☐ | Whole mix | Harsh | Cut 2.5 kHz −2 dB, Q 1.4 (usually 2 kHz–4 kHz) | Often it's just too loud overall. Try the master down 3 dB first. | Ears are most sensitive at 2–4 kHz and fatigue quickly there. A small cut on the mains makes a loud mix feel more comfortable. |  |
| ☐ | Whole mix | Boxy / Nasal / honky | Cut 630 Hz −2 dB, Q 1.4 (usually 400 Hz–1 kHz) | Find the culprit by muting channels one at a time. Fixing that one channel beats EQing everything. | A buildup around 400 Hz–1 kHz makes the whole room sound like a cardboard box. A gentle dip on the mains opens it up. |  |
| ☐ | Whole mix | Thin | Boost 125 Hz +2 dB, Q 1.4 (usually 80 Hz–200 Hz) | Bring up the bass and kick faders first. Check the bass and kick channels don't have the HPF on. | Without enough 80–200 Hz the mix feels small and lacks a pulse. Usually it's a channel level, so fix that first, then nudge the mains. |  |
| ☐ | Whole mix | Dull | Boost 8 kHz +2 dB, Q 0.7 (usually 6 kHz–12 kHz) | Check the speakers aren't blocked, or pointed at the floor or the back wall. Check the HIGH knobs on the vocal channels aren't turned down. | Above 6 kHz is where crispness and "air" live. High frequencies are the first to get lost in a room, so a gentle lift on the mains brings back clarity. |  |

## Compressor starting points

The phone can't read the console's level scale, so the app never gives a threshold number. It
says "lower the threshold until the gain-reduction meter shows the target on the loudest parts."
Compression is only suggested when the measured level swing is above the "Suggest when" value.

| OK | Source | Ratio | Attack | Release | Target gain reduction | Suggest when swing | Why | Notes |
|---|---|---|---|---|---|---|---|---|
| ☐ | Male vocal | 3:1 (4:1 if very uneven), soft knee | 20–40 ms | 150–300 ms (or auto) | 3–6 dB | > 13 dB | Singers get much louder on big notes and softer on quiet lines. Gentle compression evens that out so you aren't riding the fader every phrase. Much faster release sounds pumpy; much slower attack lets the loud surges through. |  |
| ☐ | Female vocal | 3:1 (4:1 if very uneven), soft knee | 20–40 ms | 150–300 ms (or auto) | 3–6 dB | > 13 dB | Singers get much louder on big notes and softer on quiet lines. Gentle compression evens that out so you aren't riding the fader every phrase. Much faster release sounds pumpy; much slower attack lets the loud surges through. |  |
| ☐ | Speaker (headset) | 2.5:1, soft knee | 10–20 ms | about 150 ms | 3–6 dB | > 13 dB | Speakers drop their voice for emphasis and get loud when excited. Light compression keeps every word at a listenable level. |  |
| ☐ | Speaker (handheld) | 2.5:1, soft knee | 10–20 ms | about 150 ms | 3–6 dB | > 13 dB | Handheld mic distance changes a lot while talking. Light compression smooths out the near/far level jumps. |  |
| ☐ | Acoustic guitar | 2.5:1, soft knee | 25–50 ms (lets the strum through) | 150–300 ms | 2–4 dB | > 10 dB | Strumming hard vs. picking softly can jump 10+ dB. A gentle squeeze keeps the guitar steady under the vocals without killing the strum. |  |
| ☐ | Bass | 4:1, hard knee | about 25 ms | 200–500 ms | 3–6 dB | > 10 dB | Some bass notes and strings ring out much louder than others. Compression keeps the low end steady so the groove sits evenly. Slap bass may need 6:1 or more with a faster attack. |  |
| ☐ | Electric guitar | 3:1, hard knee | about 25 ms | about 500 ms | 2–4 dB | > 15 dB | Distorted guitar is already heavily compressed by the distortion itself, so leave it alone. Clean parts that jump from soft picking to loud strumming benefit from a light squeeze. |  |
| ☐ | Keys | 2:1 | 30–50 ms (lets the attack bite through) | auto | 2–3 dB | > 15 dB | Keys are usually even. Only very uneven playing (soft pads jumping to loud chords) benefits from a light touch. |  |
| ☐ | Kick drum | 4:1, hard knee | 20–30 ms (keeps the punch) | fast, 25–100 ms | 3–6 dB | > 12 dB | Evens out hit-to-hit level. The slower attack lets the initial thump through so it stays punchy. |  |
| ☐ | Snare | 4:1, hard knee | 20–30 ms (keeps the crack) | fast, 25–100 ms | 3–6 dB | > 12 dB | Ghost notes and rimshots vary wildly. Compression evens them out while the slow attack keeps the crack. |  |
| ☐ | Toms | 2:1 | 20–30 ms | auto | 2–3 dB | > 20 dB (usually none) | This usually sounds best uncompressed in a small room. The swing here is extreme, so a light touch helps. |  |
| ☐ | Cajón | 2:1 | 20–30 ms | auto | 2–3 dB | > 20 dB (usually none) | This usually sounds best uncompressed in a small room. The swing here is extreme, so a light touch helps. |  |
| ☐ | Electronic kit | 2:1 | 20–30 ms | auto | 2–3 dB | > 20 dB (usually none) | This usually sounds best uncompressed in a small room. The swing here is extreme, so a light touch helps. |  |
| ☐ | Overheads / cymbals | 2:1 | about 25 ms | slow, 1–2 s (lets cymbals ring) | 2–3 dB | > 20 dB (usually none) | Cymbals usually sound best uncompressed in a small room. The swing here is extreme, so a light touch with a slow release evens it out without choking the ring. |  |

## Symptom glossary

Shown on the Ask tab so people new to mixing know what each word means.

| OK | Symptom | Description | Notes |
|---|---|---|---|
| ☐ | Muddy | Thick and unclear, like the sound is wrapped in a wool blanket. Voices and instruments blur together and words are hard to pick out. Usually too much 200–400 Hz. |  |
| ☐ | Boomy | Too much deep bass that rumbles and hangs around. Low notes sound like they're in a barrel and the low end feels flabby instead of tight. Usually 80–200 Hz. |  |
| ☐ | Boxy | Hollow and closed in, like it's playing from inside a cardboard box. Usually 400–800 Hz. |  |
| ☐ | Nasal / honky | Like someone holding their nose, or talking through a megaphone or an old telephone. Usually 500 Hz–1.5 kHz. |  |
| ☐ | Harsh | Piercing and edgy. It hurts your ears, especially on loud parts, and you want to turn it down even when it isn't that loud. Usually 2–5 kHz. |  |
| ☐ | Harsh "S" sounds | "S", "T" and "SH" sounds jump out with a hiss or whistle, louder than the rest of the word. Usually 5–10 kHz. |  |
| ☐ | Thin | Small, weak or tinny, like it's coming out of a phone speaker. It's missing body and warmth. Usually not enough 100–250 Hz. |  |
| ☐ | Dull | Muffled and dark, like there's a blanket over the speaker. No sparkle, crispness or "air". Usually not enough above 4 kHz. |  |
| ☐ | Buried / can't hear it | You can see them playing but can't really hear them, or you can hear the voice but can't make out the words. Turning it up barely helps because other sounds are covering it. |  |
| ☐ | Too much string noise | Pick scrapes, finger squeaks, fret clank or string zing are louder than the notes themselves. Sounds scratchy or jangly. |  |
| ☐ | Quacky / plasticky | A plastic, nasal, duck-like tone that doesn't sound like a real wooden guitar. Common with pickups plugged straight into the board. |  |
| ☐ | Fizzy | A buzzy, sizzling hiss on top of a distorted guitar, like bacon frying. Usually 6–10 kHz. |  |
| ☐ | No definition | You can feel the bass but can't tell which notes are being played. It's just a low rumble. |  |
| ☐ | No punch | Drum hits feel soft and polite. No thump you feel in your chest and no snap. |  |
| ☐ | Ringing | A drum hit leaves a "ping" or "boing" tone hanging after it, like a small bell. |  |
| ☐ | Pops on P/B | Loud thumps or pops on "P" and "B" sounds when a puff of breath hits the mic. |  |
| ☐ | Overpowering others | It covers everyone else. Other instruments and voices get lost behind it, even at a sensible volume. |  |
| ☐ | Too clicky | The kick is all slap and tick, like a pencil tapping a desk, and the click pokes out over the band. Usually 2–5 kHz. |  |

## Reference charts

The Reference tab: where each source's sound lives and when to boost or cut there.

### Male vocal

| OK | Range | What lives here | Boost when | Cut when | Notes |
|---|---|---|---|---|---|
| ☐ | 20 Hz–100 Hz | Rumble | Almost never. | High-pass filter at 80–100 Hz removes handling noise, pops and stage rumble. |  |
| ☐ | 100 Hz–200 Hz | Fullness | Thin or weak voice (around 120 Hz). | Boomy or chesty, usually from singing very close to the mic. |  |
| ☐ | 150 Hz–300 Hz | Warmth / mud | Lacks warmth. | Muddy or cloudy, blending into guitars and keys. Key range, but the most common problem. |  |
| ☐ | 400 Hz–800 Hz | Boxiness | Rarely. | Boxy, hollow, "in a can" (often right at 500 Hz). |  |
| ☐ | 500 Hz–1.5 kHz | Nasal / honk | A touch helps a voice speak in a dense mix. | Nasal, honky or telephone-like. |  |
| ☐ | 1 kHz–5 kHz | Presence / clarity | Words hard to understand or vocal buried. | Harsh, piercing or shouty, especially on loud notes. |  |
| ☐ | 5 kHz–10 kHz | Sibilance / breath | Breathy, intimate sound (gently). | Narrow cut for harsh "S" and "T" sounds. |  |
| ☐ | 10 kHz–16 kHz | Air / sheen | Dull or lifeless. A broad lift around 12 kHz adds openness. | Hissy or brittle. |  |

### Female vocal

| OK | Range | What lives here | Boost when | Cut when | Notes |
|---|---|---|---|---|---|
| ☐ | 20 Hz–150 Hz | Rumble | Almost never. | High-pass filter at 120–150 Hz. Female voices have little below this. |  |
| ☐ | 150 Hz–300 Hz | Body / warmth | Thin or weak voice. | Boomy, chesty or muddy. |  |
| ☐ | 400 Hz–800 Hz | Boxiness | Rarely. | Boxy or "in a can" (often around 500 Hz). |  |
| ☐ | 500 Hz–1.5 kHz | Nasal / honk | Rarely. | Nasal or honky. |  |
| ☐ | 1 kHz–5 kHz | Presence / clarity | Words hard to understand or vocal buried. | Harsh, shrill or piercing on loud notes. |  |
| ☐ | 7 kHz–10 kHz | Sibilance / breath | Breathy, intimate sound (gently). | Narrow cut for harsh "S" and "T" sounds. |  |
| ☐ | 12 kHz–16 kHz | Air / sheen | Dull or lifeless. A broad lift adds polish. | Hissy or brittle. |  |

### Speaker (headset)

| OK | Range | What lives here | Boost when | Cut when | Notes |
|---|---|---|---|---|---|
| ☐ | 20 Hz–150 Hz | Rumble / breath | Almost never. | High-pass filter at 120–150 Hz. Speech needs almost nothing below this. |  |
| ☐ | 125 Hz–300 Hz | Chest boom | Rarely. | Muddy, chesty or boomy. Also lowers feedback risk. |  |
| ☐ | 250 Hz–600 Hz | Muffle | Rarely. | Muffled or boxy (try 250 Hz, then 500 Hz). |  |
| ☐ | 500 Hz–1.5 kHz | Nasal / irritating mids | Rarely. | Nasal, honky or grating (try 1 kHz). |  |
| ☐ | 2 kHz–5 kHz | Intelligibility | Hard to understand. Many headsets already have a peak here, so go easy. | Harsh, tinny or tiring on long talks. |  |
| ☐ | 5 kHz–9 kHz | Sibilance | Rarely. | Narrow cut for hissy "S" sounds. |  |

### Speaker (handheld)

| OK | Range | What lives here | Boost when | Cut when | Notes |
|---|---|---|---|---|---|
| ☐ | 20 Hz–120 Hz | Rumble / pops | Almost never. | High-pass filter at 100–120 Hz removes handling noise and P/B pops. |  |
| ☐ | 125 Hz–300 Hz | Body / proximity | Thin, usually because the mic is held too far away. | Boomy or chesty from talking very close. |  |
| ☐ | 250 Hz–600 Hz | Muffle | Rarely. | Muffled or boxy (try 250 Hz, then 500 Hz). |  |
| ☐ | 500 Hz–1.5 kHz | Nasal / irritating mids | Rarely. | Nasal, honky or grating (try 1 kHz). |  |
| ☐ | 2 kHz–5 kHz | Intelligibility | Hard to understand. | Harsh or shouty when they get loud. |  |
| ☐ | 5 kHz–9 kHz | Sibilance | Rarely. | Narrow cut for hissy "S" sounds. |  |

### Acoustic guitar

| OK | Range | What lives here | Boost when | Cut when | Notes |
|---|---|---|---|---|---|
| ☐ | 20 Hz–80 Hz | Rumble / handling | Almost never. | High-pass filter at about 80 Hz (just under the low E) when there's a bass player. Solo guitar: lower or off. |  |
| ☐ | 80 Hz–120 Hz | Bottom | Only for a solo guitar with no bass. | Boomy, bassy, or feeding back. |  |
| ☐ | 200 Hz–400 Hz | Warmth / mud | Thin or tinny. | Muddy, or crowding the vocal (often around 200–250 Hz). |  |
| ☐ | 400 Hz–1.2 kHz | Boxiness | Rarely. | Boxy or hollow. Plugged-in guitars are often worst around 900 Hz–1 kHz: boost, sweep, then cut. |  |
| ☐ | 1 kHz–3 kHz | Piezo quack | Rarely. | Quacky or plasticky pickup sound. |  |
| ☐ | 2 kHz–5 kHz | Bite / pick attack | Buried in the band. | Too much pick or string noise. |  |
| ☐ | 8 kHz–14 kHz | Sparkle / sheen | Dull, dark, old strings (try 12 kHz). | Zingy or hissy. |  |

### Electric guitar

| OK | Range | What lives here | Boost when | Cut when | Notes |
|---|---|---|---|---|---|
| ☐ | 20 Hz–100 Hz | Rumble / hum | Almost never. | High-pass filter at 80–100 Hz stops it fighting the bass and removes amp hum (50–60 Hz). |  |
| ☐ | 150 Hz–300 Hz | Warmth / body | Thin or small (try 250–300 Hz). | Muddy, woofy, boxy around 200 Hz. |  |
| ☐ | 500 Hz–1.2 kHz | Honk | A little gives a solo more push. | Nasal, honky or boxy. |  |
| ☐ | 1 kHz–4 kHz | Bite / clarity | Buried (try 2.5–3 kHz). This is where a guitar cuts through. | Clashing with the vocal. |  |
| ☐ | 2.5 kHz–4.5 kHz | Ice pick | Rarely. | Harsh, piercing, painful in small rooms. |  |
| ☐ | 5 kHz–10 kHz | Distortion / fizz | A touch more edge and grit on a distorted tone. | Fizzy, buzzy or hissy distortion. |  |
| ☐ | 8 kHz–14 kHz | Air / sheen | Dull clean tones (try 12 kHz). | Fizz on distorted tones. |  |

### Bass

| OK | Range | What lives here | Boost when | Cut when | Notes |
|---|---|---|---|---|---|
| ☐ | 20 Hz–40 Hz | Sub rumble | Almost never. | High-pass filter at 30–40 Hz in boomy rooms. Small speakers can't play it anyway. |  |
| ☐ | 40 Hz–120 Hz | Bottom / weight | Thin, weak, no low end (40–80 Hz on big speakers, nearer 80 Hz on small ones). | Some notes boom louder than others (room modes). |  |
| ☐ | 120 Hz–250 Hz | Boom | Rarely. | Boomy, flabby, woofy. |  |
| ☐ | 200 Hz–500 Hz | Mud / boxiness | Rarely. | Muddy (usually 250 Hz), or boxy toward 500 Hz. |  |
| ☐ | 700 Hz–1 kHz | Growl / attack | Can't hear the notes, especially on small speakers. | Honky. |  |
| ☐ | 2 kHz–4 kHz | Strings / clarity | A little (around 2.5–3 kHz) for definition, slap or pick attack. | Clanky, rattly fret noise. |  |

### Keys

| OK | Range | What lives here | Boost when | Cut when | Notes |
|---|---|---|---|---|---|
| ☐ | 20 Hz–100 Hz | Pedal noise / left hand | Almost never. | High-pass filter at 80–100 Hz removes sustain-pedal thumps (30–50 Hz) and left-hand mud when there's a bass player. |  |
| ☐ | 80 Hz–120 Hz | Bottom | Thin or small, with no bass player. | Boomy, or the left hand doubling the bass. |  |
| ☐ | 200 Hz–400 Hz | Warmth / mud | Lacks warmth. | Muddy or cloudy. The usual culprit is right around 250 Hz. |  |
| ☐ | 400 Hz–800 Hz | Boxiness | Rarely. | Boxy or cheap-sounding (often 500 Hz). |  |
| ☐ | 2.5 kHz–5 kHz | Presence | Piano attack buried in the band. | Pads covering the vocals, or harsh samples. |  |
| ☐ | 5 kHz–7.5 kHz | Shrillness | Rarely. | Shrill, brittle or clangy. |  |
| ☐ | 8 kHz–12 kHz | Sheen | Dull or lifeless (around 10 kHz). | Hissy. |  |

### Cajón

| OK | Range | What lives here | Boost when | Cut when | Notes |
|---|---|---|---|---|---|
| ☐ | 60 Hz–100 Hz | Bass thump | No punch, no felt pulse. | Too much low end in a small room. |  |
| ☐ | 100 Hz–200 Hz | Boom | Rarely. | Boomy or woofy. |  |
| ☐ | 300 Hz–600 Hz | Box resonance | Rarely. | Boxy, papery or hollow. |  |
| ☐ | 2 kHz–5 kHz | Slap / snare wires | No slap, dull. | Harsh or clicky slap. |  |

### Kick drum

| OK | Range | What lives here | Boost when | Cut when | Notes |
|---|---|---|---|---|---|
| ☐ | 20 Hz–40 Hz | Sub | Not in small rooms. | Rumble the speakers can't play cleanly. Leave the HPF off a kick, though. |  |
| ☐ | 40 Hz–80 Hz | Thump (felt) | No punch (60–80 Hz on small speakers). | Too much low end overall. |  |
| ☐ | 80 Hz–150 Hz | Boom | Rarely. | Boomy, flabby, "basketball". |  |
| ☐ | 250 Hz–600 Hz | Cardboard / boxiness | Almost never. | Boxy, papery or thuddy. Usually 250 Hz, or sweep from 500 Hz up. |  |
| ☐ | 2 kHz–5 kHz | Smack / beater click | Kick disappears on small speakers (try 4 kHz). | Too clicky or slappy. |  |
| ☐ | 8 kHz–12 kHz | Air | A touch (10 kHz) for a modern, clicky kick. | Cymbal bleed. |  |

### Snare

| OK | Range | What lives here | Boost when | Cut when | Notes |
|---|---|---|---|---|---|
| ☐ | 20 Hz–100 Hz | Kick bleed | Almost never. | High-pass filter around 80–100 Hz removes kick bleed. |  |
| ☐ | 120 Hz–250 Hz | Fatness / warmth | Thin, no body (130–250 Hz). | Boomy or thuddy. |  |
| ☐ | 300 Hz–900 Hz | Boxiness / ring | Rarely. | Boxy or honky (often 300–500 Hz). Narrow cut for one ringing tone. |  |
| ☐ | 2.5 kHz–6 kHz | Crack / snap | Dull, no crack (try 3–4 kHz). | Harsh or too aggressive. |  |
| ☐ | 6 kHz–12 kHz | Sizzle / hi-hat bleed | A touch of sizzle (8–10 kHz). | Too much hi-hat in the snare mic. |  |

### Toms

| OK | Range | What lives here | Boost when | Cut when | Notes |
|---|---|---|---|---|---|
| ☐ | 80 Hz–150 Hz | Boom | Rarely in a small room. | Floor tom boomy or rumbly. |  |
| ☐ | 120 Hz–240 Hz | Fullness | Small, papery toms. | Muddy. |  |
| ☐ | 200 Hz–1 kHz | Ringing overtones | Almost never. | Narrow cut right on the ring. |  |
| ☐ | 250 Hz–600 Hz | Boxiness | Rarely. | Boxy or cardboard (try 250 Hz, then sweep from 500 Hz). |  |
| ☐ | 2 kHz–6 kHz | Snap / stick | Fills don't cut through (snap ~2 kHz, stick ~5 kHz). | Clicky or harsh. |  |

### Overheads / cymbals

| OK | Range | What lives here | Boost when | Cut when | Notes |
|---|---|---|---|---|---|
| ☐ | 20 Hz–300 Hz | Kit / room wash | Almost never. | High-pass filter around 300 Hz in small rooms (at least below 125 Hz on a hi-hat mic). |  |
| ☐ | 100 Hz–600 Hz | Clank / mud | Rarely. | Muddy, washy or clanky kit. |  |
| ☐ | 2 kHz–6 kHz | Overtones / clang | Rarely. | Harsh, piercing or trashy cymbals (often 3–4 kHz). |  |
| ☐ | 8 kHz–14 kHz | Sizzle / shimmer | Dull cymbals (around 12 kHz). | Sizzly or hissy. |  |

### Electronic kit

| OK | Range | What lives here | Boost when | Cut when | Notes |
|---|---|---|---|---|---|
| ☐ | 50 Hz–80 Hz | Kick weight | No punch. | Too much low end. |  |
| ☐ | 80 Hz–200 Hz | Boom | Rarely. | Boomy samples made for headphones. |  |
| ☐ | 150 Hz–300 Hz | Drum body | Thin or toy-like. | Muddy toms. |  |
| ☐ | 3 kHz–5 kHz | Sample hype | Kick or snare disappear. | Harsh, clicky or fake-sounding. |  |
| ☐ | 8 kHz–14 kHz | Cymbal sizzle | Dull cymbals. | Brittle cymbal samples. |  |

### Whole mix

| OK | Range | What lives here | Boost when | Cut when | Notes |
|---|---|---|---|---|---|
| ☐ | 20 Hz–40 Hz | Sub rumble | Almost never. | Small speakers can't play it. Use a main high-pass filter if you have one. |  |
| ☐ | 63 Hz–160 Hz | Room boom | Mix feels thin. Check bass and kick faders first. | The one slider that booms in this room. |  |
| ☐ | 200 Hz–400 Hz | Mud buildup | Almost never. | Muddy, cloudy mix. Gentle cut. |  |
| ☐ | 400 Hz–1 kHz | Boxy / honky room | Rarely. | Hollow, megaphone-like mix. |  |
| ☐ | 2 kHz–4 kHz | Fatigue zone | Rarely. Fix clarity on channels instead. | Harsh, tiring, painful at volume. |  |
| ☐ | 6 kHz–12 kHz | Brightness / air | Dull, muffled mix. | Brittle or hissy. |  |
