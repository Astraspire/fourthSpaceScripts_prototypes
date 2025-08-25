import { LocalEvent } from 'horizon/core';

/** Request to stop all loops on the specified channel. */
export const stopRowEventSoMeta = new LocalEvent<{ channelId: number }>(
    'sendStopCommandToRowSoMeta'
)
/** Trigger a loop section to begin playing on a channel. */
export const loopTriggerEventSoMeta = new LocalEvent<{ channelId: number, loopSectionId: number }>(
    'sendLoopTriggerEventSoMeta'
)

/** Reset a specific loop button back to its idle color. */
export const offlineColorChangeEventSoMeta = new LocalEvent<{ channel: number, loopId: number }>(
    'setColorDefaultEventSoMeta'
)

/** Force a loop button to idle color regardless of current state. */
export const hardOfflineColorChangeEventSoMeta = new LocalEvent<{ channel: number, loopId: number }>(
    'hardSetColorDefaultEventSoMeta'
)

/** Mark a loop button as currently playing. */
export const playingColorChangeEventSoMeta = new LocalEvent<{ channel: number, loopId: number }>(
    'setColorToNowPlayingSoMeta'
)

/** Highlight a loop button as queued to play on the next measure. */
export const upcomingLoopColorChangedEventSoMeta = new LocalEvent<{ channel: number, loopId: number }>(
    'setColorBackToUpcomingSoMeta'
)

// Broadcast when the machine transitions between idle and actively
// playing loops.  Other systems listen to know when music is audible.
export const machinePlayState = new LocalEvent<{ isPlaying: boolean }>(
    'mbc25MachinePlayState'
)
