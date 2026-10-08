# Bubu Protocol

A five-chapter picture book for low-battery days, part of the Bhondu Protocol series. It's plain HTML, CSS and JS with no build step. The bears are hand-drawn SVG and every sound is synthesized live with Web Audio, so there are no image or audio files.

Run it locally with `python3 -m http.server 8777`, then open http://localhost:8777.

## Story, screens and cues

| Chapter | What happens | Interaction | Sound / motion |
|---|---|---|---|
| Cover | Bubu and Dudu bob side by side, heart floating | **Open the book** | Lo-fi bedtime loop fades in (soft pads + music-box notes), giggle |
| 1 · The heavy door | Bubu trudges in from the left, bag dragging. Bubble: *"mai coliz se aa gayiii… battery 0"* | Tap the glowing door knob | Door creak, door swings open, Dudu (holding a pizza slice): *"BUBUUUUUUUUUUU my pyaari baby agayi! Ye dekh Laddu, Domino’s pizza!"* Pizza pops into Bubu’s paws, she hops with joy, giggle, then walks inside |
| 2 · The hammer room | Dudu: *"Who ruined my Bubu's mood? Name them."* | Type the annoyance → **Summon it** spawns a derpy cat holding a sign with that text → **Bonk!** | Pop on spawn. Whoosh, Dudu charges and swings the squeaky hammer, bonk + squeak, cat squashes into stars and hearts, giggle. Can repeat endlessly |
| 3 · The blanket fort | Bubu lying in bed, battery shows one tiny heart | Drag (or tap) duvet, lamp, warm drink, her plushies onto Bubu | Duvet slides over her, room dims, drink appears, mini Dudu + Bubu plushies tuck in beside her. Each fills a heart cell with a rising note. When full, Bubu falls asleep: *"Resting without speaking is 100% allowed."* |
| 4 · Memory constellations | Fairy lights over six polaroids | Tap to flip | Paper flip, heart note, hearts float up |
| 5 · The cozy haven | Both bears asleep under a starry blanket | **Hold for a hug** (1.6s ring fills) | Rising notes while holding. On release-complete the bears squeeze together, burst of hearts, chime + giggle, the bedtime letter unfolds |

## Editing the words

- Polaroid jokes: the `MEMORIES` array in `app.js`.
- Bedtime letter: the `<article class="letter">` block in `index.html`.
- Dialogue bubbles and narration are inline in `index.html`. Chapters 1–2 also update their text from `app.js`.

## Epilogue: Always

A storm cloud, two clashing speech bubbles and a rain cloud hang between the bears. Each tap answers one line (*"If we argue, I will still love you"*, *"If we disagree, I still love you"*, *"If we have a bad day, I will still love you"*). The weather melts into hearts, a Bubu voice clip plays, and the bears step closer. A bridge line follows (*"There is nothing in this world that will ever change my feelings for you, no matter the struggle."*), then *"At the end of the day, I will always love you."* The bears hug, a big heart beats in the sky, hearts float up, and a music-box lullaby plays.

## Silly book (for happy days)

The cover now asks how Bubu is feeling: **Battery low** opens the cozy book above, **Feeling happy!** opens a three-page silly book. The cozy epilogue ends with a link across.

| Page | What happens |
|---|---|
| 1 · The very serious quiz | Dudu with a mic: *"Who does Dudu love more?"* The **Domino’s pizza** button runs away every time it's touched (*nope → pizza is shy → can’t catch me → pizza has left the chat*). **Bubu** is correct. |
| 2 · Boop the Dudu | Tap Dudu; he protests harder each time. At 10 boops he faints from cuteness overload, then gets back up for round two. |
| 3 · Kiss please? | The Bubu Dudu clip (`media/kiss.mp4`, cropped to the bears) with timed speech bubbles: Bubu asks for a kiss, Dudu plays hard to get (*"Hmm. Let me think about it."*, *"Nope. Busy."*), then gives in. Music hushes while it plays; hearts on the kiss. Cues live in `KISS_CUES` in `app.js`. |

Reaction sounds `sounds/h01–h05.m4a` are cut from the clip's audio (`VOICE` in `app.js`). The background loop is now a gentle C-major I–V–vi–IV with a soft arpeggio (~72 bpm), still quiet.

## Deploying changes

`index.html` loads `style.css?v=…` and `app.js?v=…`. Bump both version stamps on every change, or phones that cached the old script will load it against the new page and break.
