# Canonical references

**Drop your canonical images into the folders here.** One folder per locked
entity, each holding the image and a README saying what that image is
authoritative for. Same shape as Millbrook's `patch-notes/reference-source/`.

Nothing here is served to readers — `references/` is outside `public/`, so it
is production material only.

**33 entities, 48 plates.** `npm run refs` prints the current list and what is
still missing — that command is the authority, not this file, because the
folders are generated from `content/roster.json`.

```
references/
  STYLE/          style-canonical.png              ← do this one first
  CHARACTERS/     19 folders, char-<name>-canonical.png
  LOCATIONS/      14 folders, loc-<name>.png
```

**The filenames are not suggestions.** Each folder's README names the exact file
it expects, because `npm run prompts` checks the filesystem for that name. A
file called `grey.png` or `char-grey-canonical (1).png` is invisible to the
tooling.

## The loop

1. **Generate the canonical image.** A reference sheet, not a plate: one
   figure, full body, neutral pose, plain ground, no story beat in frame.
   Locations get a clean establishing view.
2. **Save it in its folder** under the exact filename the README names.
3. **Write the description** into `block` for that token in
   `content/roster.json`, and set `locked: true`. The image and the description
   together are the lock — the image is the authority, the text is what carries
   continuity when a prompt has to describe something the image does not show.
4. **Record any deviations** in the folder's README. When the art comes back
   different from what you asked for and you keep it, the *description* is what
   has to change. Millbrook's reference folders do this and it is the most
   useful thing in them.
5. **`npm run prompts`** — the sheets in `prompt-sheets/` rebuild, and every
   prompt using that token starts attaching the file.

## Why the tooling checks the filesystem

Because a prompt that claims an authority it does not have is **worse** than one
that admits it has none.

Millbrook shipped 21 prompts all saying *"use the attached canonical reference
as the authority for face, build, hair and proportion, match it, do not
reinterpret it"* — while all 21 files were missing. Nothing was attached, the
generator fell back to the text description, and the description was stale. A
character came back with the wrong hair and no hat. The prompt had made the
description sound optional at the exact moment it was the only thing there.

So `npm run prompts` will not pretend. A token with its image on disk gets the
authority sentence and the attachment; a token without gets a loud `>>> NO
CANONICAL REFERENCE ON DISK <<<` and its description carries the weight. Every
sheet ends with a list of what is blocking it, and the run prints an
`n/24 plates ready` count.

## Writing a prompt

Prompts live in the `prompt:` field of each `::: image` block in
`content/specs/*.md`, and expand through the roster. Prologue I spread 6 is the
worked example. The shape:

```
{{STYLE}}                       always first — see below
{{LOC:MARKET_DISTRICT}}         setting
{{CHAR:BONE_PATROL}}            one line per figure, in order of importance
EXACTLY ONE OFFICER AND ONE SMALL CHILD AND NOBODY ELSE SHARP.
<the beat, in present tense, one paragraph>
THE CHILD is the subject and is doing <specific physical thing>.
THE OFFICER is doing <specific physical thing>.
<background, out of focus>
<camera: angle, height, distance>
<light: source, direction, time of day>
```

Five things that make the difference between a plate that lands and one that
has to be regenerated:

- **Cap the cast in capitals, at the top.** "EXACTLY THREE FIGURES AND NOBODY
  ELSE." Image models add people. This is the single most effective line.
- **Give every named figure a physical verb.** Not "Vex is confident" —
  "one boot planted on the bumper, leaning her weight onto that knee, head
  turned back over her shoulder." A mood is not a pose.
- **Say what must NOT be there**, and say it near the top rather than in a
  negative block at the foot. Hammers holstered. No text anywhere. Grey is not
  present in this vision.
- **Write the moment before or after, not during.** "The officer has just
  looked down. Nobody has moved yet." A frozen instant beats an action.
- **`spoilerCheck` is load-bearing.** Every plate is seen next to prose it
  must not get ahead of. Write down what the plate is deliberately not
  showing, and why that is correct.

The four `HARD RULES` — square, no text, no frame, keep the lower-right clear
for the folio — are appended automatically to every `{{STYLE}}` expansion. Do
not repeat them per prompt.

## Do STYLE first

Every prompt starts with `{{STYLE}}`, and until `styleApproved` is `true` in
the roster, every sheet says so in capitals. Millbrook found that a style clause
sitting in the negative block at the foot of a prompt gets ignored, and that
hoisting it to the **head** fixed it on one pass — so that is where it goes
here, and it is the first thing every prompt says.

## Order worth working in

The 48 plates need 33 locks, but they are not equally urgent:

| | |
|---|---|
| 1 | `STYLE` — everything depends on it |
| 2 | `RAINBOW`, `THE_PRISM` — 9 of Prologue III's 24 plates, and Rainbow is in most of the rest |
| 3 | `GREY`, `PEAK_CHAMBER`, `SERAPH` — 8 of Prologue I's 14 |
| 4 | `TOWER_PLAZA`, `UNIT_9911`, `QUESTRON` — the whole registration sequence, 8 plates |
| 5 | The six climbers: `MARCUS`, `SIGNAL`, `NYXARA`, `SPARK`, `KIMO`, `TAL_VOSS` |
| 6 | `BONE_PATROL`, `MARKET_DISTRICT`, `HAVEN_CITY_AERIAL`, `WASTELAND`, `TOWER_GATE` |
| 7 | The Tales: `PIXELS`, `SEVORAN`, `PHOENIX`, `RELMIA`, `SANDMAN` and their four locations |

The six climbers are the highest-leverage group after the style: Prologue III
introduces all of them, they carry the whole arc from here, and every one of
them appears in the plaza sequence as well as in The Prism — so a wrong lock
costs you two scenes, not one.

`GREY` also needs two wardrobe rows written, and the second one matters beyond
this prologue: `GREY_POST_OATH` is the state every future appearance of him has
to match — coat repaired but changed, no pocket watch, two fingers sitting
differently.
