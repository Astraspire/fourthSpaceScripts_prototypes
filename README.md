# Fourth Space MBC25 Scripts

This repository contains prototype scripts for the **MBC25** musical beat machine and a small inventory system used to unlock and activate different machine variants. The code is written for the Horizon Worlds scripting API using TypeScript. This guide walks through the folders and explains how the pieces fit together so a new creator can navigate and extend the system.

## Repository layout

```
InventorySystem/     Inventory and user interface scripts
MBC25/               Core logic for the MBC25 beat machine
MBC25-LUCKY/         Example machine prefab (Lucky)
MBC25-SOMETA/        Example machine prefab (SoMeta)
```

The `MBC25-LUCKY` and `MBC25-SOMETA` folders contain example assets and are not covered in detail here. Most beginners only need to understand the `InventorySystem` and `MBC25` directories.

## InventorySystem

The inventory system keeps track of which MBC25 sound packs a player has unlocked and which machine is currently active. Key files include:

### `shared-events-MBC25.ts`
Defines local events used to communicate between inventory scripts and the machines. For example, `unlockMBC25` informs the inventory that a new pack was earned, and `changeActiveMBC` tells drop spawners which machine to show.

### `MBC25Inventory.ts`
Manages per-player storage of unlocked packs using Horizon's persistent key–value store. It saves a JSON array under the key `MBC25Inventory:unlockedSoundPacks` and exposes helpers to look up players, print their inventory, and unlock new packs. Every player now begins with the `MBC25-LUCKY` and `MBC25-SOMETA` packs unlocked by default.

### `InventorySystemUI.ts`
Provides a simple UI listing the player's unlocked packs. Each entry is a pressable row that requests activation of that pack; another row lets the player put away the currently active machine.

### `MBCManager.ts`
Ensures only one MBC25 machine is active at a time. It verifies that the requesting player owns the pack, drops the correct machine, and listens for relinquish events or AFK timeouts to free the machine for others.

### `MBCDrop.ts`
Controls spawning and visibility of the actual machine prefabs. When it receives a `dropMBC` or `changeActiveMBC` event with a matching pack ID, it spawns the corresponding asset and moves it into place.

### `unlockMBCTwo.ts`
A utility component for trigger zones. When a player exits the trigger it emits an `unlockMBC25` event to grant the configured pack and causes the machine to drop for that player.

### Soundwave system
The new soundwave point system rewards players for participating in music sessions. The `SoundwaveManager.ts` component tracks
points over time while a machine is playing and stores the balance in persistent player data. `SoundwaveStoreUI.ts` presents a
scrollable shop where players can spend their points to unlock additional beat packs. `SoundwaveStoreTrigger.ts` can be placed on
a trigger volume to pop open the store when a player approaches, hiding it again when they leave. A low-cost `MBC25-TEST` pack is
included for exercising the credit flow. UI toasts inform listeners and performers the first time they begin accumulating points.

## MBC25 scripts

The `MBC25` directory contains the behavior for the beat machine itself. Important files include:

### `shared-events.ts`
Event definitions used by the machine's subsystems. They coordinate loop playback, color changes, and row stops across components.

### `SongManager.ts`
Central controller that plays audio loops in sync. It listens for loop trigger events, cross-fades between loops, and replays active loops on a timed interval so they remain locked to the beat.

### `LoopButtonTrigger.ts`
Script placed on each loop button. It handles button color changes for idle/upcoming/playing states and broadcasts `loopTriggerEvent` when the player presses a button to queue a loop.

### `StopButtonTrigger.ts`
Simple component for stop buttons. When a player steps off the trigger volume it emits `stopRowEvent` to stop all loops on that channel.

## Next steps

* Add additional sound packs by extending the inventory and manager lists.
* Customize the UI in `InventorySystemUI.ts` to fit your world.
* Explore the example machines in `MBC25-LUCKY` and `MBC25-SOMETA` for asset setup.

This README gives only a tour of the scripts. The best way to learn is to open the files in your editor, place the components in a Horizon World, and experiment.
