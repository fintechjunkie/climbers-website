# Unfiled canonical art

Images that are canonical for the world but have no assigned role yet. **Not
roster entities**, so `npm run refs` neither creates this folder nor audits it,
and nothing here counts toward the `n/33` ready count.

This folder exists so that art with no home does not get parked in a folder
that asserts something false about it. A wrong label is worse than no label:
it gets read as fact by whoever picks the file up next, and it ends up inside a
prompt.

## Unit-5947

`Unit-5947.png` — a Synthetic chassis. Deep blue armoured plating over black
underlayers, segmented limbs, cyan ring optics in both sockets, a cyan core at
the sternum and matching ring lights at every major joint. Humanoid proportion,
neutral standing pose.

**Not an Oath Lord.** It sat in `OATH_LORDS/` by mistake and was moved out.

Its role is not established. Note that it is not the same unit as either
Synthetic already in the specs — **Unit-9911**, who presides over the Oath of
Ascent in Prologue III, and **Unit-7845**, which was Grey's designation before
he took a name. Do not assume a relationship between the three from the
numbering.

When its role is decided, promote it the same way an Oath Lord is promoted:
add it to `content/roster.json`, run `npm run refs`, move the image into
`CHARACTERS/<TOKEN>/` under the filename that folder's README names, and write
its block **from the image**.
