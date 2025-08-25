# Inventory System

Scripts in this folder manage which MBC25 machines a player has unlocked and
provide basic UIs for interacting with those machines.  The system relies on
Horizon Worlds' persistent storage to remember unlocked packs between sessions
and exposes events that other scripts can listen for.

## Key components

- **MBC25Inventory.ts** – Stores and retrieves the player's unlocked packs and
  handles unlock events.
- **InventorySystemUI.ts** – Simple list UI letting players spawn and put away
  machines they own.
- **MBCManager.ts** – Ensures only one machine is active at a time and tracks
  the current performer.
- **MBCDrop.ts** – Spawns the correct machine asset when it becomes active.
- **SoundwaveManager.ts / SoundwaveStoreUI.ts** – Optional point system allowing
  players to earn and spend "soundwaves" to unlock additional packs.

The accompanying `shared-events-MBC25.ts` file defines the local events used for
communication between these scripts.
