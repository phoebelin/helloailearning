# Asset Manifest — Module 3 (Pippy) Animal Sprites

**For:** `0003-prd-updating-understanding-activity.md` (v2 animal redesign) and `tasks-0003-prd-updating-understanding-activity.md`.

This manifest lists every animal sprite needed, its metadata (the prediction model's comparison attributes), and the art-style spec for generating them.

## Art style spec

Flat 2D **vector cartoon**, children's picture-book style:

- Bright, flat color fills; simple rounded shapes; thin or no outlines.
- Cute, friendly expression; single animal, full body, side or three-quarter view, centered.
- **Plain white (or transparent) background**, no text, no drop shadow, no scene/props.
- Consistent visual weight and framing across all animals (so they read as a set).

**Approved style reference (already generated and in repo):**

- `public/images/pippy/animals/lion.png` ✅ done
- `public/images/pippy/animals/dolphin.png` ✅ done

(Originals also at `~/.cursor/.../assets/sample-lion.png` and `sample-dolphin.png`.) Match these two for color saturation, line weight, and framing.

**Generation prompt template** (substitute `{ANIMAL}` and an optional `{POSE}`):

> "Flat 2D vector cartoon illustration of a single friendly **{ANIMAL}**, children's picture-book style, bright flat colors, simple rounded shapes, minimal thin outlines, cute happy expression, full body, {POSE}, centered, plain solid white background, no text, no drop shadow. Match the clean flat cartoon style of the reference set."

**Output:** one PNG per animal, ~1024px, consistent framing, saved to **`public/images/pippy/animals/<id>.png`** (filename = the `id` column below).

## Animal library

These attributes are the **model's internal comparison features** (k-nearest-neighbor). They are **not** shown as tags on cards (per design: rely on well-known animals + the up-front category). `body` = locomotion/limbs; values: legs / wings / fins / flippers.

| id | name | group | habitat | diet | activity | body | size | used in | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| lion | Lion | cat | savanna | carnivore | diurnal | legs | large | L1 YES | ✅ done |
| tiger | Tiger | cat | forest | carnivore | nocturnal | legs | large | L1 hook (YES) | ✅ done |
| cheetah | Cheetah | cat | savanna | carnivore | diurnal | legs | medium | L1 YES | ✅ done |
| leopard | Leopard | cat | forest | carnivore | nocturnal | legs | medium | **L1 bad egg (mislabeled NO)** | ✅ done |
| house-cat | House Cat | cat | home | carnivore | nocturnal | legs | small | L1 hook (YES) | ✅ done |
| dog | Dog | dog | home | omnivore | diurnal | legs | medium | L1 NO | ✅ done |
| wolf | Wolf | dog | forest | carnivore | nocturnal | legs | large | L1 check (NO) | ✅ done |
| elephant | Elephant | elephant | savanna | herbivore | diurnal | legs | large | L1/L2 NO | ✅ done |
| giraffe | Giraffe | giraffe | savanna | herbivore | diurnal | legs | large | L1 check (NO) | ✅ done |
| zebra | Zebra | zebra | savanna | herbivore | diurnal | legs | large | L1 NO | ✅ done |
| deer | Deer | deer | forest | herbivore | diurnal | legs | large | L3 NO | ✅ done |
| rabbit | Rabbit | rabbit | meadow | herbivore | diurnal | legs | small | L1 check (NO) | ✅ done |
| squirrel | Squirrel | rodent | forest | herbivore | diurnal | legs | small | L3 NO | ✅ done |
| raccoon | Raccoon | raccoon | forest | omnivore | nocturnal | legs | medium | L3 YES | ✅ done |
| hedgehog | Hedgehog | hedgehog | forest | carnivore | nocturnal | legs | small | L3 YES | ✅ done |
| bat | Bat | bat | cave | carnivore | nocturnal | wings | medium | **L3 hook (YES)** | ✅ done |
| owl | Owl | bird | forest | carnivore | nocturnal | wings | medium | L1/L2 NO; **L3 bad egg (mislabeled NO)** | ✅ done |
| parrot | Parrot | bird | jungle | herbivore | diurnal | wings | small | L2/L3 NO | ✅ done |
| butterfly | Butterfly | insect | meadow | herbivore | diurnal | wings | tiny | L3 NO | ✅ done |
| moth | Moth | insect | meadow | herbivore | nocturnal | wings | tiny | L3 YES | ✅ done |
| dolphin | Dolphin | marine-mammal | ocean | carnivore | diurnal | fins | large | L1 NO; L2 YES | ✅ done |
| seal | Seal | marine-mammal | ocean | carnivore | diurnal | flippers | large | **L2 bad egg (mislabeled NO)** | ✅ done |
| sea-lion | Sea Lion | marine-mammal | ocean | carnivore | diurnal | flippers | large | L2 hook (YES) | ✅ done |
| octopus | Octopus | mollusk | ocean | carnivore | nocturnal | fins | medium | L2 YES | ✅ done |
| swordfish | Swordfish | fish | ocean | carnivore | diurnal | fins | large | L2 YES | ✅ done |
| shark | Shark | fish | ocean | carnivore | diurnal | fins | large | L2 check (YES) | ✅ done |
| penguin | Penguin | bird | polar | carnivore | diurnal | flippers | medium | L2 check (NO — trap: swims but not "ocean" habitat) | ✅ done |

**Total: 27 animals — all 27 generated (transparent PNGs in `public/images/pippy/animals/`).**

## Notes for the implementing agent

- The exact training/check membership per level is in `lib/data/pippy-levels.ts` (authored from this library) and is **validated by `pippy-levels.test.ts`** (clean → 100%, bad egg → hook animals wrong, expected fix → 100%). If a validator fails, adjust membership and/or add a well-known animal to this library — do **not** weaken the model.
- **`bat.size = medium`** is intentional (it makes the mislabeled `owl` the unique nearest neighbor of `bat` in L3 so the hook fires). If you change bat's attributes, re-run the L3 validator.
- Keep the set visually consistent; if a generated sprite clashes in style/scale, regenerate with the template above before committing.
- Animals are reused across levels — generate each `id` once.
