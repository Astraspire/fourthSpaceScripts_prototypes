# Fourth Space MBC25 Scripts

This repository contains prototype scripts for the **MBC25** musical beat machine and the supporting systems that unlock and manage different machine variants.  All current machines use the generic scripts in the `MBC25/` folder, allowing any new sound pack to plug into the same core logic.  The code targets the Horizon Worlds scripting API and is written in TypeScript.

## Repository layout

```
InventorySystem/          Inventory management, soundwave economy and UI
MBC25/                    Generic logic for the MBC25 beat machine
MBC25-LUCKY/              Lucky machine prefab using the generic scripts
MBC25-SOMETA/             SoMeta machine prefab using the generic scripts
MBC25-PHONK-E-CHEESE/     Phonk‑E‑Cheese machine prefab using the generic scripts
```

The prefab folders contain audio assets and scene setups for each machine.  Most scripting lives in `InventorySystem/` and `MBC25/`.

## Inventory and soundwave system

The inventory keeps track of which sound packs each player owns, awards **soundwave** points while music plays, and provides UIs for activating machines or purchasing new packs.  The components communicate through events defined in [`shared-events-MBC25.ts`](InventorySystem/shared-events-MBC25.ts).

### `MBC25Inventory.ts`
Stores unlocked packs per player using a bitmask.  When an `unlockMBC25` event arrives the component updates persistent storage, broadcasts `inventoryUpdated`, and triggers `dropMBC` so the newly unlocked machine appears immediately.

### `InventorySystemUI.ts`
UI listing the player’s unlocked packs.  Selecting a pack sends `requestMBCActivation` to the manager; a separate button emits `relinquishMBC` to put away the active machine.  The UI refreshes itself when `inventoryUpdated` or `soundwaveBalanceChanged` broadcasts occur.

### `MBCManager.ts`
Coordinates which machine is active.  It grants control when `requestMBCActivation` is received from the UI, ensuring the player owns the pack, then broadcasts `changeActiveMBC` and `activePerformerChanged`.  When `relinquishMBC` fires or the performer goes AFK the manager clears the lock and hides the machine.

### `MBCDrop.ts`
Spawns or despawns prefabs based on `dropMBC` and `changeActiveMBC` events.  Each machine prefab has an `MBCDrop` instance configured with its pack ID so it can react when that pack becomes active.

### Soundwave economy
`SoundwaveManager.ts` listens for `machinePlayState` from the beat machine and for `activePerformerChanged` from the manager.  Every minute of active listening awards points, and performers earn a bonus for each listener.  The `soundwaveBalanceChanged` broadcast keeps UIs in sync.  Purchases from `SoundwaveStoreUI.ts` send `purchasePackWithSoundwaves` to the manager, which validates the balance and uses `unlockMBC25` to grant the pack.  `SoundwaveStoreTrigger.ts` raises `openSoundwaveStore` when a player enters a trigger volume to show the store UI.

### Unlock triggers
`unlockMBCTwo.ts` is a simple trigger component that emits `unlockMBC25` when a player leaves its volume.  It can be dropped anywhere in a world to hand out packs during gameplay.

## MBC25 machine scripts

The `MBC25/` folder holds the generic machine behavior shared by all prefabs.

### `shared-events.ts`
Defines machine‑internal events such as `loopTriggerEvent` and `stopRowEvent`, plus `machinePlayState` which tells external systems when music is audible.

### `SongManager.ts`
Central loop scheduler.  When a button trigger sends `loopTriggerEvent`, the manager starts or queues audio loops, keeps them in sync, and rebroadcasts `machinePlayState` whenever the machine starts or stops playing.

### `LoopButtonTrigger.ts` and `StopButtonTrigger.ts`
Attach these to button and stop trigger gizmos in a prefab.  Loop buttons update their colors and fire `loopTriggerEvent`; stop buttons emit `stopRowEvent` when a player steps off.

Because the scripts are generic, new machine prefabs only need their audio gizmos wired into `SongManager` and the inventory system will handle dropping and activation automatically.

## Event flow overview

1. **Unlocking** – Triggers or the store emit `unlockMBC25` → `MBC25Inventory` updates storage and broadcasts `inventoryUpdated` and `dropMBC`.
2. **Dropping machines** – `MBCDrop` instances listen for `dropMBC` and spawn the matching prefab.
3. **Activating a machine** – The inventory UI sends `requestMBCActivation` → `MBCManager` validates ownership and broadcasts `changeActiveMBC` and `activePerformerChanged`.
4. **Playing music** – The active prefab’s `SongManager` plays loops and emits `machinePlayState`.  `SoundwaveManager` awards soundwave points based on these events.
5. **Purchasing packs** – The store UI dispatches `purchasePackWithSoundwaves` → `SoundwaveManager` deducts points and reuses `unlockMBC25` so the new pack drops immediately.
6. **Relinquishing** – When `relinquishMBC` is raised, `MBCManager` clears control and broadcasts an empty `changeActiveMBC` so `MBCDrop` hides all machines.

## Next steps

* Add new sound packs by defining a pack ID in `PackIdBitmask.ts`, wiring a prefab to use the generic `MBC25` scripts, and adding the pack to the store list.
* Customize the UI layouts in `InventorySystemUI.ts` and `SoundwaveStoreUI.ts` to fit your world’s style.

Experiment with the scripts in Horizon Worlds to understand how the events connect and to build your own musical experiences.
