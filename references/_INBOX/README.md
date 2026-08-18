# Drop new canonical images here

Drop them with whatever name ChatGPT gave them. Do not rename anything.

Claude looks at each image, identifies which reference it is, and files it into
the folder the tooling expects under the exact filename that folder's README
names — `npm run prompts` checks the filesystem for that literal string, and a
file named anything else is invisible to it.

This inbox exists because the destinations are five different folders with five
different required filenames, and looking that up per image is work the person
generating the art should not have to do.

## Currently expected — Prologue II, 5 canonicals

All thirteen Prologue II plates are blocked until these exist.

| what it is | ends up as |
| --- | --- |
| Cole Porter, character sheet | `CHARACTERS/COLE/char-cole-canonical.png` |
| Block 44, street level | `LOCATIONS/BLOCK_44_SURFACE/loc-block-44-surface.png` |
| Sub-level service gallery | `LOCATIONS/SUB_LEVEL_GALLERY/loc-sub-level-gallery.png` |
| The lost block | `LOCATIONS/THE_LOST_BLOCK/loc-the-lost-block.png` |
| The white room | `LOCATIONS/WHITE_ROOM/loc-white-room.png` |

Prompts are in `prompt-packages/p2-CANONICALS/`, one folder each.

## Notes

The image files here are gitignored, because a dropped file is a temporary copy
of something that gets committed at its real path a minute later. This README
is tracked; the drops are not.

A superseded canonical is not deleted — it moves to
`plate-sources/superseded/<name>-<why>.png`, so the record says what was
rejected and for what reason.
