# CLIMBERS — LOCATION CANONICAL PROMPTS

14 locations. Paste one prompt per ChatGPT turn. Save the result into
`references/LOCATIONS/<TOKEN>/<filename>` under the **exact** filename given —
`npm run prompts` checks the filesystem for that string and a file named
anything else is invisible to the tooling.

---

## READ THIS ONCE BEFORE YOU START

**Attach `CLIMBERS_Pulp_SciFi_Illustration_Project_Guide_v2.md` to the
conversation first.** Every prompt below assumes the guide is loaded and
does not restate its rules.

**A location canonical is not a plate.** It is a production reference. Its job
is to make the *next* twelve images consistent, so it must show construction,
not mood. Guide §18: architecture clear, primary silhouette established,
structural materials readable, key colour relationships fixed, signature
landmarks present, spatial organization legible.

**Aspect ratio: 3:2 landscape.** Not square. The square/no-text/no-frame HARD
rules apply to *story plates* — a canonical wants the widest useful view. The
one exception is the two interiors flagged below.

**Every prompt ends with the same four lines.** They are in each block already;
do not delete them when you paste.

**The palette mode on each entry is the location's HOME mode** — the lighting
it is most often seen in, and the one that fixes its colour relationships.
A later scene can re-light it (guide §6, palette rotation). The canonical is
the authority for *material and geometry*, not for time of day.

**No characters** in any of these unless the entry says otherwise. Where scale
needs a human, the entry asks for anonymous silhouettes with no face and no
costume identity — never a roster character, because a canonical location
carrying a canonical character starts contaminating both.

---

## THE TOWER — read before the three Tower locations

`references/The Gate.png` and `references/The Tower.png` are existing site art
and they are the authority for what the Tower *is*: gold and faceted, stepped
back in ziggurat setbacks, a single vertical light seam running its full
height, an arched gate at the base built of receding arches, a mirror-polished
plaza floor at its feet, a city of pale glass towers around it.

They are **not** in Pulp SciFi language — they are glossy, airbrushed, and
photoreal-adjacent, exactly what guide §4 says to avoid. So TOWER_GATE and
TOWER_PLAZA below are **normalization** prompts: attach the source art, keep
the architecture, throw away the rendering.

---

# 1. PEAK_CHAMBER

**File:** `references/LOCATIONS/PEAK_CHAMBER/loc-peak-chamber.png`
**Home mode:** PS-3 SKYLINE DAY
**Feeds:** Prologue I spreads 1–4 and 8–11 — 8 plates, the most-used interior in the arc.
**Attach:** the Pulp SciFi guide. No source art.

> Create a CLIMBERS **location canonical** in the locked Pulp SciFi style.
> Palette mode: **PS-3 SKYLINE DAY**.
>
> Location: the chamber at the peak of the Tower. Interior. A crystalline
> space whose scale is deliberately unresolvable — it must read as vast and as
> impossibly small at the same time, the way a dream holds two contradictory
> facts without difficulty. Faceted crystal walls and outcrops in pale gold and
> cold white, angular and cut rather than organic. The floor is fully
> **transparent** and Haven City is visible far below through it: a street grid
> like a circuit board soldered onto the earth, a quarter of the city glowing
> faint blue, the wasteland running out to the horizon.
>
> Show the construction. I need to see how the crystal formations meet the
> floor, where the outcrops are that a person could brace against, and how the
> chamber closes overhead. Wide angle, eye level, from one edge of the chamber
> looking across and slightly down.
>
> Three value zones: dark anchor in the crystal masses at frame edge, midtone
> story field across the chamber floor, bright focal region where the light
> comes down through the peak. Bright and open — this is the relief-mode
> interior of the book, not a cave.
>
> NO figures. NO Seraph, no light-being, no geometry that reads as a presence —
> this is the empty room. NO text, NO border, NO frame, NO nameplate, NO caption,
> NO style label. Do not render photorealistically, do not use glossy 3D
> materials, do not apply overall bloom. 3:2 landscape.

**Authoritative for:** the transparent floor and what is under it, the crystal
geometry a figure can hold onto, the gold/white/cold-blue relationship.
**Deliberately not showing:** Seraph. Seraph is light and shape only, never a
face or a body, and belongs to the character locks, not to the room.

---

# 2. HAVEN_CITY_AERIAL

**File:** `references/LOCATIONS/HAVEN_CITY_AERIAL/loc-haven-city-aerial.png`
**Home mode:** PS-1 NIGHT NOIR
**Feeds:** Prologue I spreads 1 and 12.
**Attach:** the Pulp SciFi guide, plus `The Tower.png` for the Tower silhouette only.

> Create a CLIMBERS **location canonical** in the locked Pulp SciFi style.
> Palette mode: **PS-1 NIGHT NOIR**.
>
> Location: Haven City seen from very high above, at night. The street grid
> reads like a circuit board soldered onto the earth — orthogonal, dense,
> deliberate, not organic sprawl. Four zones must be separable at a glance:
> the **Valari Quarter** glowing a faint bioluminescent blue; the **industrial
> blocks**, dark and square and unlit; the **civic core** around the Tower; and
> the **wasteland** beyond the city walls, rust-coloured and running out to the
> horizon with nothing in it.
>
> The **Tower** goes up through the middle of the frame like a needle — gold,
> faceted, stepped back in setbacks, with a single vertical seam of light
> running its full height. Use the attached image as the authority for the
> Tower's shape and colour ONLY; ignore its rendering style entirely and
> re-render it in Pulp SciFi language.
>
> Very high angle, near-vertical but tilted enough that the Tower reads as
> vertical rather than as a dot. Deep navy and near-black city, dark structural
> masses, with the blue quarter and the Tower's gold seam as the bright focal
> regions. Do not crush every value together — the four zones must stay
> individually readable.
>
> NO figures. NO text, NO border, NO frame, NO nameplate, NO caption, NO style
> label. Do not render photorealistically, do not use glossy 3D materials, do
> not apply overall bloom. 3:2 landscape.

**Authoritative for:** the zone map of the city — where the Valari Quarter is
relative to the Tower, where the wall is, where the wasteland starts.
**Note:** Prologue I spread 12 puts exactly six flares on this grid. The
canonical has none. Do not add them here.

---

# 3. MARKET_DISTRICT

**File:** `references/LOCATIONS/MARKET_DISTRICT/loc-market-district.png`
**Home mode:** PS-3 SKYLINE DAY
**Feeds:** Prologue I spreads 5–7.

> Create a CLIMBERS **location canonical** in the locked Pulp SciFi style.
> Palette mode: **PS-3 SKYLINE DAY**.
>
> Location: the Market District of Haven City, early morning. This is the
> important thing about it: **it looks like abundance and functions like a
> clock.** Smooth, airless efficiency. Vendor rows set at identical intervals.
> Crowd-flow corridors measured to fractions, marked in the paving itself.
> Clean surfaces, uniform stall geometry, no clutter, no improvisation, no
> handmade signage, nothing crooked. Goods are plentiful and stacked with
> unsettling regularity.
>
> Street level, medium-wide, looking down a vendor row toward a cross-corridor,
> so I can see the interval spacing and how the corridors meet. Pale cyan
> morning sky above, cream and sand architecture, navy structural linework,
> orange accents in the goods and awnings.
>
> The scene should feel pleasant and slightly wrong. Do not make it dystopian
> or ruined — the discomfort comes from the regularity, not from decay.
>
> NO figures, or at most three anonymous distant silhouettes for scale with no
> faces and no costume identity. NO Bone Patrol, no officers, no uniforms. NO
> text on any signage or surface, NO border, NO frame, NO nameplate, NO caption,
> NO style label. Do not render photorealistically, do not use glossy 3D
> materials, do not apply overall bloom. 3:2 landscape.

**Authoritative for:** stall geometry, corridor spacing, the paving markings.
Prologue I spread 6 puts a child at an officer's knee here — the ground plane
and the sightline down the row have to already be established.

---

# 4. WASTELAND

**File:** `references/LOCATIONS/WASTELAND/loc-wasteland.png`
**Home mode:** PS-2 SUNSET EMBER
**Feeds:** the Prologue I opener and spread 13.
**Attach:** the guide, plus `The Tower.png` for the Tower silhouette only.

> Create a CLIMBERS **location canonical** in the locked Pulp SciFi style.
> Palette mode: **PS-2 SUNSET EMBER**.
>
> Location: the wasteland outside Haven City's walls, at dusk. Rust and silence
> where the world ended and was never repaired. Not a desert and not a
> battlefield — a landscape of oxidised structure: collapsed infrastructure,
> half-buried machine forms, corroded spans, the bones of something that used
> to be maintained. Flat ground, long sightlines, nothing moving.
>
> Haven City's **wall** runs across the middle distance, and behind it the
> **Tower** rises and goes up out of the top of the frame — gold, faceted,
> stepped, with its vertical light seam. Use the attached image as the
> authority for the Tower's shape and colour ONLY; ignore its rendering style
> and re-render it in Pulp SciFi language.
>
> Low camera, near ground level, looking toward the city. Burnt orange and
> amber sky, warm ochre ground, deep navy structural silhouettes, the Tower's
> gold seam as the bright focal point. Graphic shadows, not muddy ones.
>
> NO figures. NO text, NO border, NO frame, NO nameplate, NO caption, NO style
> label. Do not render photorealistically, do not use glossy 3D materials, do
> not apply overall bloom. 3:2 landscape.

**Authoritative for:** the ground texture and the wall-to-Tower relationship
seen from outside. Spread 13 stands Grey on this floor facing the city with the
Tower behind him — the canonical must make that camera position possible.

---

# 5. COURIERS_EXCHANGE

**File:** `references/LOCATIONS/COURIERS_EXCHANGE/loc-couriers-exchange.png`
**Home mode:** PS-2 SUNSET EMBER
**Feeds:** The Delivery, spread 1.
**Interior — 4:3 is acceptable here if 3:2 crops the ceiling.**

> Create a CLIMBERS **location canonical** in the locked Pulp SciFi style.
> Palette mode: **PS-2 SUNSET EMBER**.
>
> Location: the Courier's Exchange in Haven City — the room where dispatch work
> is handed out. A working interior, not a lobby. Long sorting tables with worn
> surfaces, pigeonhole racks and dispatch slots along one wall, hanging task
> boards, stacked pouches and sealed packets, a counter where work is claimed.
> Municipal and utilitarian, built for throughput, lightly worn by use.
>
> A tall window on one side throws hard directional light across the nearest
> table — that light is the reason this location exists, because a sealed pouch
> gets tilted into it. Establish it clearly: direction, angle, the shape it
> throws on the tabletop.
>
> Interior wide, from the door looking in along the tables. Warm amber window
> light, cream highlights on the lit surfaces, deep navy and dark teal in the
> shadowed racks. Three value zones: dark racks as anchor, midtone room, the
> window-lit tabletop as the bright focal region.
>
> NO figures. NO text on the boards, racks, or packets — no readable prose, no
> labels, no numbers. NO border, NO frame, NO nameplate, NO caption, NO style
> label. Do not render photorealistically, do not use glossy 3D materials, do
> not apply overall bloom. 3:2 landscape.

**Authoritative for:** the window light — its direction and hardness — and the
tabletop surface a wax seal will be photographed against.

---

# 6. RECLAMATION_ALLEY

**File:** `references/LOCATIONS/RECLAMATION_ALLEY/loc-reclamation-alley.png`
**Home mode:** PS-1 NIGHT NOIR
**Feeds:** The Delivery opener and spread 2.

> Create a CLIMBERS **location canonical** in the locked Pulp SciFi style.
> Palette mode: **PS-1 NIGHT NOIR**.
>
> Location: the alley behind the water reclamation building, at night, in rain.
> Narrow enough that both walls are in frame. Wet throughout — standing water
> on the ground, runoff finding every gap, rain visibly falling in the air, not
> merely implied by wet surfaces. Reclamation infrastructure on the walls: bulk
> pipework, condensate lines, valve housings, grated drains, a vent stack.
> Industrial, dark, functional.
>
> Two blocks to the north the alley opens onto a cross street where a **Bone
> Patrol checkpoint** is running: its lights are cold and turn the falling rain
> **silver** at that end of the frame. That silver rain is the bright focal
> region and the whole reason for this composition — the alley is dark, the far
> end is lit, and the distance between is the story.
>
> Down-the-alley view, eye level, checkpoint glow at the far end. Deep navy and
> near-black walls, charcoal ground, small electric blue accents in the
> checkpoint light, limited cream in the wettest highlights. Dark, but the
> pipework must stay readable in the midtones — do not crush it all together.
>
> NO figures, and NO Bone Patrol officers in frame — only their light. NO text,
> NO border, NO frame, NO nameplate, NO caption, NO style label. Do not render
> photorealistically, do not use glossy 3D materials, do not apply overall
> bloom. 3:2 landscape.

**Authoritative for:** the silver-rain checkpoint glow. It recurs and it needs
to be the same colour temperature every time.

---

# 7. PATROL_STATION

**File:** `references/LOCATIONS/PATROL_STATION/loc-patrol-station.png`
**Home mode:** PS-1 NIGHT NOIR
**Feeds:** The Delivery, spread 3.
**Interior — 4:3 acceptable.**

> Create a CLIMBERS **location canonical** in the locked Pulp SciFi style.
> Palette mode: **PS-1 NIGHT NOIR**.
>
> Location: the vehicle and processing bay of Third Patrol Station, Sector Four
> — a Bone Patrol station interior. Hard municipal architecture: bare structural
> ribs, a high ceiling, a poured floor with lane markings, equipment lockers and
> rack frames along one wall, a processing counter, and a **wide exit doorway**
> at the far end opening onto the street.
>
> Composition is receding: camera inside the bay at eye level, looking down its
> length toward that exit. I need a clear, walkable path from the foreground to
> the door, and I need the **doorway flanks** established — the two positions
> either side of the exit where officers stand.
>
> Charcoal and deep navy structure, near-black in the racks, cold institutional
> overhead light in flat pools on the floor, small **red** accents from equipment
> indicators. The doorway is the bright focal region: street light spilling in.
>
> NO figures. NO Bone Patrol officers — establish where they will stand, do not
> draw them. NO text, NO signage, NO unit numbers, NO border, NO frame, NO
> nameplate, NO caption, NO style label. Do not render photorealistically, do
> not use glossy 3D materials, do not apply overall bloom. 3:2 landscape.

**Authoritative for:** the receding sightline to the exit and the two flanking
positions at the door.

---

# 8. RESIDENTIAL_BLOCK_14

**File:** `references/LOCATIONS/RESIDENTIAL_BLOCK_14/loc-residential-block-14.png`
**Home mode:** PS-1 NIGHT NOIR
**Feeds:** The Delivery, spread 4.
**Interior — 4:3 acceptable.**

> Create a CLIMBERS **location canonical** in the locked Pulp SciFi style.
> Palette mode: **PS-1 NIGHT NOIR**, warmed — this is a lived-in home corridor,
> not a threat space.
>
> Location: the third floor of Residential Block 14, Haven City — a working-class
> Valari residential building. Show two connected things in one frame: the
> **narrow stairwell** arriving at the landing, and the **third-floor hallway**
> running off it past apartment doors.
>
> The hallway details matter and are specific: a wall-mounted **radiator** with
> **dried protein strips laid across it** to cure, scuffed wall panelling, a low
> ceiling, doors with simple mechanical latches and **security chains**, and a
> single dim fixture. Cramped, warm, tired, and cared for — people live here and
> are getting by.
>
> Camera at the top of the stairs looking along the hallway, eye level, so both
> the stair arrival and the door line are readable. Charcoal and deep navy
> shadow, warm ochre and burnt orange in the fixture light, cream highlights on
> the radiator. Keep the midtones open enough that the panelling and the door
> hardware stay legible.
>
> NO figures. All doors closed. NO text, NO apartment numbers, NO border, NO
> frame, NO nameplate, NO caption, NO style label. Do not render
> photorealistically, do not use glossy 3D materials, do not apply overall bloom.
> 3:2 landscape.

**Authoritative for:** the radiator and its protein strips, the door hardware
including the chain, and the hallway width.

---

# 9. WELLNESS_CENTER

**File:** `references/LOCATIONS/WELLNESS_CENTER/loc-wellness-center.png`
**Home mode:** PS-3 SKYLINE DAY
**Feeds:** the Seven opener and all four spreads — the entire Tale.
**This one carries the most weight of the twelve. It is one location for a whole volume.**

> Create a CLIMBERS **location canonical** in the locked Pulp SciFi style.
> Palette mode: **PS-3 SKYLINE DAY**, at dusk.
>
> Location: the Wellness and Optimization Center, Haven City. **It is designed
> to look like medicine.** That is the entire brief. Calm, clean, generously
> proportioned, quietly expensive, and completely reassuring — and it must be
> genuinely reassuring, not sinister. Nothing dripping, nothing clinical-cold,
> no restraints, no dark corners. The horror is that it is beautiful.
>
> Show three connected spaces in one composition, or in a clear layered
> foreground / midground / background:
> 1. the **facade** — a calm institutional frontage, horizontal, low and wide,
>    softly lit, approached across a clean forecourt;
> 2. the **atrium** behind it, tall and full of light, with a still
>    **reflecting pool** in the floor;
> 3. the **intake desk** at the far side of the atrium — a long counter with
>    terminal stations behind it.
>
> Wide establishing angle from the forecourt looking in through the facade.
> Pale cyan dusk sky, cream and warm paper tones through the interior, sand and
> pale stone, medium blue in the pool, navy structural linework, restrained
> orange accents in the interior lighting. Bright overall — this is the brightest
> image in its volume and the relief it offers is doing narrative work.
>
> NO figures, or at most two anonymous distant silhouettes in the forecourt for
> scale, no faces and no costume identity. NO Synthetics, no staff, no patients,
> no escort at the door. NO text, NO signage, NO institutional lettering, NO
> border, NO frame, NO nameplate, NO caption, NO style label. Do not render
> photorealistically, do not use glossy 3D materials, do not apply overall bloom.
> 3:2 landscape.

**Authoritative for:** the pool's position relative to the intake desk — a
character at that desk looks at the pool, so the sightline has to exist — and
for the desk's height and the terminal positions behind it.
**Also establish, even if only glimpsed:** where the **maintenance corridor**
leaves the atrium. The utility door at its end is the exit in spread 4.

---

# 10. SERVICE_LANE

**File:** `references/LOCATIONS/SERVICE_LANE/loc-service-lane.png`
**Home mode:** PS-1 NIGHT NOIR
**Feeds:** Seven, spread 4.

> Create a CLIMBERS **location canonical** in the locked Pulp SciFi style.
> Palette mode: **PS-1 NIGHT NOIR**.
>
> Location: the service lane behind the Wellness and Optimization Center, at
> night. The back of a building that has a beautiful front: extract ducting,
> plant housings, waste bays, conduit runs, a loading apron. Utilitarian and
> unlovely, and clearly the *same building* as the calm facade — same pale stone,
> same proportions, no decoration.
>
> A **utility door** sits in the near wall, at the end of a short maintenance
> corridor whose interior light spills out when it opens. From that door the lane
> runs away into darkness and, at the far end, meets the **eastern residential
> district** — modest low blocks with warm, ordinary, occupied windows.
>
> Camera in the lane, low and near the door, looking along it toward those distant
> warm windows. Near-black and deep navy walls, charcoal ground, burnt orange in
> the far residential windows and a small cold spill at the door. Those distant
> windows are the bright focal region: the lane is dark, somewhere to go is lit.
>
> NO figures. The door may be open or closed — establish it either way. NO text,
> NO border, NO frame, NO nameplate, NO caption, NO style label. Do not render
> photorealistically, do not use glossy 3D materials, do not apply overall bloom.
> 3:2 landscape.

**Authoritative for:** the door, its threshold height, and the sightline from it
to the warm district beyond. Spread 4 is shot from inside that doorway looking
out, so the view down the lane is the composition.

---

# 11. THE_PRISM

**File:** `references/LOCATIONS/THE_PRISM/loc-the-prism.png`
**Home mode:** PS-4 FESTIVAL NEON
**Feeds:** Prologue III spreads 1–6 and 21–23 — 9 plates, the most-used interior in the book.
**Interior — 4:3 acceptable.**

> Create a CLIMBERS **location canonical** in the locked Pulp SciFi style.
> Palette mode: **PS-4 FESTIVAL NEON**.
>
> Location: The Prism — a bar at the end of the approach road to the Tower gate.
> Not a dive and not a lounge: a serious working bar, dense with colour, run by
> someone with taste and a long memory.
>
> The layout is load-bearing and every element below must be present and
> placeable:
> - a **long bar** with **stools** along it, running most of the room's length;
> - a **back bar** behind it with bottles, and a **small screen mounted above
>   the back bar**;
> - a **front door**, and a separate **side entrance**;
> - **tables** at the back of the room;
> - **corner booths**, at least one clearly readable;
> - one **corner table** apart from the rest.
>
> Camera from the front door, eye level, looking down the length of the bar so
> the stool line, the back bar, the screen, the rear tables and a corner booth
> are all in one view. This is a floor plan disguised as an image.
>
> Magenta, violet and electric blue in the room's light; cyan and hot pink
> accents; amber warmth from the back bar; deep navy anchoring the structure.
> Keep a clear hierarchy — one dominant colour family, the others supporting.
> Do not turn it into rainbow noise and do not let the neon flatten the depth.
>
> NO figures. NO bartender. Glasses may be on the bar. NO text, NO signage, NO
> bottle labels with readable lettering, NO screen content — the screen is off
> and dark in this canonical. NO border, NO frame, NO nameplate, NO caption, NO
> style label. Do not render photorealistically, do not use glossy 3D materials,
> do not apply overall bloom. 3:2 landscape.

**Authoritative for:** the seat map. Count the stools and keep the count. The
**third stool from the wall** is a named seat and someone sits in it every night.
The corner table and the corner booth are different places and are used in
different spreads.
**Worth generating as a second image once this is approved:** the same camera,
same room, **PS-3 SKYLINE DAY, morning, empty, door locked**. Spreads 21–23 are
daylight in a room built for night, and that wrongness is the point. Save it in
the same folder as `loc-the-prism-morning.png` — a note for the folder README,
not a tooling token.

---

# 12. TOWER_PLAZA

**File:** `references/LOCATIONS/TOWER_PLAZA/loc-tower-plaza.png`
**Home mode:** PS-3 SKYLINE DAY
**Feeds:** Prologue III spreads 7–18 — 12 plates, the largest single block in the book.
**Attach:** the guide, **plus `The Tower.png` and `The Gate.png`.**

> Create a CLIMBERS **location canonical** in the locked Pulp SciFi style.
> Palette mode: **PS-3 SKYLINE DAY**.
>
> Location: the Tower ground plaza, Haven City — the public square at the foot of
> the Tower. It holds three hundred people on a quiet week.
>
> **Use the two attached images as the authority for the architecture:** the
> Tower's gold faceted mass and stepped setbacks, its single vertical light seam,
> the arched gate of receding arches at its base, the mirror-polished plaza floor,
> and the ring of pale glass towers around the square. **Ignore their rendering
> style completely.** They are glossy and photoreal-adjacent; re-render all of it
> in Pulp SciFi language — graphic shadow masses, crisp ink-like edges, selective
> detail, screen-printed lithographic texture, strong silhouettes.
>
> Add what those images do not show and what this location needs:
> - the **registration wall** at the front of the plaza, facing the crowd — a
>   broad, flat, waist-to-head-height public surface at the base of the Tower,
>   plain and monumental, the thing people walk up to and put a palm against.
>   Establish its height, its material, and how far it stands from the gate.
> - **screens on every surrounding building face**, carrying a feed. Multiple
>   sizes at multiple heights, on every building in the ring.
> - one **small cracked display above a water station** at the plaza edge —
>   minor, easy to miss, and it must be there.
> - the **perimeter**, where a cordon would stand, and the **eastern streets**
>   entering the square.
>
> Very wide, slightly elevated, from the back of the plaza looking toward the wall
> and the gate, so crowd scale and the full depth of the square both read.
> Pale cyan sky, cream and sand stone, the Tower's gold, navy structural linework,
> medium blue in the glass towers.
>
> NO figures, or anonymous distant silhouettes for scale only — no faces, no
> costume identity, NO Bone Patrol, NO officers. NO text on any screen or surface
> — the screens carry abstract feed imagery, never readable words. NO border, NO
> frame, NO nameplate, NO caption, NO style label. Do not render
> photorealistically, do not use glossy 3D materials, do not apply overall bloom.
> 3:2 landscape.

**Authoritative for:** the registration wall — nothing else establishes it —
and the screen layout. Spread 13 turns **every screen in the plaza white at
once**, so the canonical has to make the full set countable and placed.
**Deliberately not showing:** the crowd. Twelve plates fill this square with
people and each one needs a different density.

---

# 13. TOWER_GATE

**File:** `references/LOCATIONS/TOWER_GATE/loc-tower-gate.png`
**Home mode:** PS-2 SUNSET EMBER
**Feeds:** the Prologue III opener and spread 18.
**Attach:** the guide, **plus `The Gate.png` — this is a normalization pass.**

> Create a CLIMBERS **location canonical** in the locked Pulp SciFi style.
> Palette mode: **PS-2 SUNSET EMBER**.
>
> Location: the Tower gate. **The attached image is the authority for the
> architecture and for nothing else.** Preserve: the enormous scale, the gold
> light, the geometric lines layered back in receding arches the way a cathedral
> is layered, the vertical light seam rising out of the arch, the faceted gold
> mass around it, the mirror-polished approach floor.
>
> **Discard its rendering entirely.** The source is glossy, airbrushed and
> photoreal-adjacent. Re-render everything in Pulp SciFi language: bold shadow
> masses, crisp ink-like edges, selective detail instead of uniform micro-detail,
> visible screen-print and lithographic texture, strong graphic silhouettes,
> restrained highlights. No lens flare, no bloom, no soft cinematic haze.
>
> The single most important fact: **the gate simply stands open.** It has no
> doors. There is no mechanism to close it, no leaves, no hinges, no portcullis,
> nothing that could ever be shut. It has always been open and it lets you
> decide. Make that structurally obvious.
>
> Very wide, low camera, close enough that the arch dominates the frame and the
> gold light fills the opening like a curtain. Burnt orange and amber sky, deep
> navy in the gate's shadowed geometry, the gold opening as the bright focal
> region, dark navy stone as the anchor.
>
> NO figures. NO text, NO border, NO frame, NO nameplate, NO caption, NO style
> label. Do not render photorealistically, do not use glossy 3D materials, do not
> apply overall bloom. 3:2 landscape.

**Authoritative for:** the depth of the receding arches and the fact that the
opening cannot close. Spread 18 has six figures pass through as silhouettes
against the gold and the light close behind them **like a curtain** — an optical
effect, not a door.

---

# 14. APPROACH_ROAD

**File:** `references/LOCATIONS/APPROACH_ROAD/loc-approach-road.png`
**Home mode:** PS-2 SUNSET EMBER, morning
**Feeds:** Prologue III spreads 19–20.
**Attach:** the guide, plus `The Gate.png` for the gate at the far end.

> Create a CLIMBERS **location canonical** in the locked Pulp SciFi style.
> Palette mode: **PS-2 SUNSET EMBER**, at early morning rather than dusk.
>
> Location: the approach road to the Tower, Haven City. A broad street running
> from the **Tower gate** at one end — visible in the distance, gold-lit, open —
> down past **The Prism**, a bar with a front door and a side entrance on one
> side of the street. The road connects them and is the spine of the whole
> prologue.
>
> Across the street from The Prism is a **transit hub**, and this is the detail
> that matters most: mounted **above** the hub, on a bracket, is a **surveillance
> node** — a compact armoured housing on a **cable**, high enough that when it
> fails it will drop about eight feet and hang from that cable. Establish the
> mounting bracket, the housing, the cable, and the height clearly enough that a
> later image can show it hanging dead.
>
> Street level, eye level, standing in the road with The Prism and the transit
> hub in the mid-ground either side and the gate small and gold at the far end.
> Early morning: warm ochre and amber light low along the street, cream
> highlights, deep navy in the building shadows, the distant gate as the bright
> focal region.
>
> NO figures. The node is intact, powered and undamaged in this canonical — no
> smoke, no crack, no damage of any kind. NO text, NO signage, NO border, NO
> frame, NO nameplate, NO caption, NO style label. Do not render
> photorealistically, do not use glossy 3D materials, do not apply overall bloom.
> 3:2 landscape.

**Authoritative for:** the node's mounting height and its cable — spread 19 puts
a hairline crack through that bracket and spread 20 hangs the node from that
cable, and both only work if the undamaged version is on record first.

---

# AFTER EACH IMAGE COMES BACK

1. Save it under the exact filename at the top of its entry.
2. If the art came back different from what you asked for **and you are keeping
   it**, write the difference into that folder's `README.md`. The description is
   what has to change, not your memory of it — Millbrook's most useful artifact
   was its record of deviations.
3. Write the description into the location's `block` field in
   `content/roster.json` and set `locked: true`.
4. Run `npm run refs` to confirm the file is seen, then `npm run prompts` to
   rebuild the sheets.

## Suggested order

| | | |
|---|---|---|
| 1 | `THE_PRISM`, `TOWER_PLAZA` | 21 plates between them — more than the other twelve combined |
| 2 | `TOWER_GATE`, `APPROACH_ROAD` | finishes Prologue III's geography |
| 3 | `PEAK_CHAMBER`, `WASTELAND`, `HAVEN_CITY_AERIAL`, `MARKET_DISTRICT` | all of Prologue I |
| 4 | `WELLNESS_CENTER`, `SERVICE_LANE` | all of Seven |
| 5 | `COURIERS_EXCHANGE`, `RECLAMATION_ALLEY`, `PATROL_STATION`, `RESIDENTIAL_BLOCK_14` | all of The Delivery |
