# Bubu Protocol

A five-chapter picture book for low-battery days, part of the Bhondu Protocol series. It's plain HTML, CSS and JS with no build step. The bears are hand-drawn SVG and every sound is synthesized live with Web Audio, so there are no image or audio files.

Run it locally with `python3 -m http.server 8777`, then open http://localhost:8777.

## Story, screens and cues

| Chapter | What happens | Interaction | Sound / motion |
|---|---|---|---|
| Cover | Bubu and Dudu bob side by side, heart floating | **Open the book** | Lo-fi bedtime loop fades in (soft pads + music-box notes), giggle |
| 1 · The heavy door | Bubu trudges in from the left, bag dragging. Bubble: *"mai coliz se aa gayiii… battery 0"* | Tap the glowing door knob | Door creak, door swings open on its hinge, Dudu appears holding tea: *"Welcome home, Bhondu. Tea's still warm."* Bubu walks inside, hearts rise, chime |
| 2 · The hammer room | Dudu: *"Who ruined my Bubu's mood? Name them."* | Type the annoyance → **Summon it** spawns a derpy cat holding a sign with that text → **Bonk!** | Pop on spawn. Whoosh, Dudu charges and swings the squeaky hammer, bonk + squeak, cat squashes into stars and hearts, giggle. Can repeat endlessly |
| 3 · The blanket fort | Bubu lying in bed, battery shows one tiny heart | Drag (or tap) duvet, lamp, warm drink onto Bubu | Duvet slides over her, room dims, tea appears. Each fills a heart cell with a rising note. When full, Bubu falls asleep: *"Resting without speaking is 100% allowed."* |
| 4 · Memory constellations | Fairy lights over six polaroids | Tap to flip | Paper flip, heart note, hearts float up |
| 5 · The cozy haven | Both bears asleep under a starry blanket | **Hold for a hug** (1.6s ring fills) | Rising notes while holding. On release-complete the bears squeeze together, burst of hearts, chime + giggle, the bedtime letter unfolds |

## Editing the words

- Polaroid jokes: the `MEMORIES` array in `app.js`.
- Bedtime letter: the `<article class="letter">` block in `index.html`.
- Dialogue bubbles and narration are inline in `index.html`. Chapters 1–2 also update their text from `app.js`.
