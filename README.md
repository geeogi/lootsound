# Loot sound

Community-operated [sounds](https://lootsound.com) for the Loot project.

## Overview

Loot sound is a collection of sounds for loot that are free to use and Creative Commons Licensed. Loot sound gives easy access to audio for anyone building on loot and provide a template for audio artists to add new sounds and alternative sounds for loot.

## Usage

You can download the entire set of loot sounds [here](`./public/wav.zip`). You can also access individual sounds via URL like so:

```
https://lootsound.com/mp3/weapons/Ghost-Wand.mp3
```

## Structure

### weapon `/mp3/weapons/{weapon}.mp3`

Warhammer, Quarterstaff, Maul, Mace, Club, Katana, Falchion, Scimitar, Long Sword, Short Sword, Ghost Wand, Grave Wand, Bone Wand, Wand, Grimoire, Chronicle, Tome, Book

### chestArmor `/mp3/chestArmor/{chestArmor}.mp3`

Robe, Armor, Husk, Shirt, Mail, Chestplate

### footArmor `/mp3/footArmor/{footArmor}[_1|_2].mp3`

Greaves, Boots, Shoes, Slippers

### misc. `/mp3/misc/{misc}.mp3`

Divine, Holy, Dragon, Demon

### suffixes `/mp3/suffixes/{suffix}.mp3`

Twins, Fox, Titans, Fury, Rage, Detection, Reflection, Giants, Protection, Enlightenment, Vitriol, Anger, Brilliance, Perfection, Power, Skill

## Contribute

- Add sounds to the standard soundpack at `/public/mp3/`
- Add a new soundpack at `/public/mp3/<soundpack-name>/`
- Add source sounds to `/public/wav/`

## License

This repository is MIT licensed. The sounds are Creative Commons Licensed, with attribution to freesound.org users THE_bizness, Jovica, ibm5155, ztrees1, ERH (flute trill f non-comercial), Soughtaftersounds, CosmisEmbers, oscillator, alexkandrell, dersuperanton, EminYILDIRIM, Dpoggioli, InspectorJ, Mega-X-stream, alixgaus (turn page book non-comercial), Coral_Island_Studios, Fewes, jamesrodavidson.

## Run locally

```bash
# Install dependencies
yarn

# Run
yarn start
```
