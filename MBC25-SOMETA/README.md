# MBC25 SoMeta Pack

Scripts in this directory implement the **SoMeta** sound pack for the MBC25
machine.  They are functionally identical to the Lucky pack but use a different
set of audio assets.

## Scripts

- **SongManagerSoMeta.ts** – Coordinates loop playback and synchronizes active
  loops.
- **LoopButtonTriggerSoMeta.ts** – Manages button color state and dispatches
  loop trigger events.
- **StopButtonTriggerSoMeta.ts** – Emits stop events for whole channels.
- **shared-events-soMeta.ts** – Local events shared by the SoMeta scripts.

Attach these components to the SoMeta prefabs to enable the pack in your world.
