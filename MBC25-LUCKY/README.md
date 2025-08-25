# MBC25 Lucky Pack

This folder contains scripts specific to the **Lucky** variant of the MBC25
beat machine.  The logic mirrors the core `MBC25` behavior but references audio
assets unique to the Lucky sound pack.

## Scripts

- **SongManager-lucky.ts** – Coordinates loop playback and keeps active loops
  in sync.
- **LoopButtonTrigger-lucky.ts** – Handles button color changes and emits loop
  trigger events.
- **StopButtonTrigger-lucky.ts** – Sends a stop event for the entire channel.
- **shared-events-lucky.ts** – Local events used by the above scripts.

Drop these components onto the corresponding prefabs to create a functional
Lucky machine in your world.
