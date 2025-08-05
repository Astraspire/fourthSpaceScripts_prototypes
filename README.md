# fourthSpaceScripts_prototypes

This repository collects small TypeScript experiments for **Horizon Worlds**.  Each folder contains a self‑contained prototype such as an audio record player or the multi‑button **MBC25** beat machine.  The code is intentionally verbose and commented to help new scripters learn how Horizon components and events interact.

## Getting Started

1. Open a Horizon project and create an **Entity** for the system you want to try.
2. Copy the TypeScript files for that system into your world's script workspace.
3. Attach the components to entities in Horizon and set the exposed properties in the editor.
4. Use the reference tables below to locate files and understand what each script does.

No npm project or unit tests are included.  The scripts are meant to be pasted directly into Horizon's TypeScript editor.

## Reference: Systems and Key Files

### AudioPlayerRecordSystem
Plays one of three audio clips when an entity tagged as a record enters a trigger.

| File | Purpose |
| ---- | ------- |
| `AudioPlayer.ts` | Maintains a `songMap` of audio clips and triggers playback when a `RecordTag` enters. Includes a 30‑second cooldown and fades out the previous song when switching tracks【F:AudioPlayerRecordSystem/AudioPlayer.ts†L13-L76】 |
| `RecordTag.ts` | Lightweight component used to tag records with a `trackId` for lookup【F:AudioPlayerRecordSystem/RecordTag.ts†L1-L6】 |
| `DebugUtils.ts` | Utility to serialize components for console debugging【F:AudioPlayerRecordSystem/DebugUtils.ts†L1-L18】 |

### InventorySystem (MBC25)
Manages unlocking and selecting different versions of the **MBC25** beat machine.  These scripts demonstrate persistent storage, custom UI, and event‑based communication.

| File | Purpose |
| ---- | ------- |
| `InventorySystemUI.ts` | Builds a simple panel listing unlocked packs. Selecting a pack sends a `requestMBCActivation` event; another button relinquishes control of the active machine【F:InventorySystem/InventorySystemUI.ts†L56-L140】 |
| `MBC25Inventory.ts` | Stores unlocked packs per player and drops the corresponding machine when a new pack is unlocked【F:InventorySystem/MBC25Inventory.ts†L6-L143】 |
| `MBCManager.ts` | Ensures only one pack is active at a time and coordinates activation and relinquish requests【F:InventorySystem/MBCManager.ts†L10-L118】 |
| `MBCDrop.ts` | Spawns the correct machine asset when a pack becomes active by listening for `dropMBC` and `changeActiveMBC` events【F:InventorySystem/MBCDrop.ts†L15-L98】 |
| `SoundPackTypes.ts` | Defines the `Inventory` type used for persistent storage entries【F:InventorySystem/SoundPackTypes.ts†L1-L10】 |
| `shared-events-MBC25.ts` | Declares the local events used by the inventory and manager components (unlocking packs, changing the active machine, etc.)【F:InventorySystem/shared-events-MBC25.ts†L1-L66】 |
| `unlockMBCTwo.ts` | Example trigger script that unlocks a pack when a player exits a volume and forwards the event to `MBC25Inventory`【F:InventorySystem/unlockMBCTwo.ts†L1-L63】 |

### MBC25 / MBC25-LUCKY / MBC25-SOMETA
Each of these folders contains a variant of the **MBC25** beat machine.  The core pattern is the same:

* `LoopButtonTrigger.ts` – Dispatches events when a loop button is pressed and changes button colours.
* `SongManager.ts` – Maps all audio loops and starts/stops them in response to events from the buttons【F:MBC25/SongManager.ts†L1-L158】
* `StopButtonTrigger.ts` – Stops a row of loops.
* `shared-events.ts` – Defines the events exchanged between the above scripts.

### MBC01System
An earlier iteration of the beat machine system.  The file names mirror the MBC25 implementation but represent the first prototype.

### chatGPTInventoryEdit
An alternate experiment on the inventory system generated with ChatGPT.  It mirrors the `InventorySystem` folder with additional helpers and can be used for comparison or further experimentation.

## Tips for Beginners

- **Follow the events.** Most interactions are driven by custom events declared in the `shared-events` files. Search for the event name to see who sends and who listens.
- **Check `propsDefinition`.** Each component exposes configurable properties that appear in Horizon’s editor. The properties are documented in the code comments.
- **Use the console.** Many scripts log useful messages (e.g., which pack is active or which loop started). Opening the Horizon console helps trace what is happening.

Happy scripting!

