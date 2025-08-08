import { LocalEvent } from 'horizon/core';

export const stopRowEvent = new LocalEvent<{ channelId: number }>(
    'sendStopCommandToRow'
)
export const loopTriggerEvent = new LocalEvent<{ channelId: number, loopSectionId: number }>(
    'sendLoopTriggerEvent'
)

export const offlineColorChangeEvent = new LocalEvent<{ channel: number, loopId: number }>(
    'setColorDefaultEvent'
)

export const hardOfflineColorChangeEvent = new LocalEvent<{ channel: number, loopId: number }>(
    'hardSetColorDefaultEvent'
)

export const playingColorChangeEvent = new LocalEvent<{ channel: number, loopId: number }>(
    'setColorToNowPlaying'
) 

export const upcomingLoopColorChangedEvent = new LocalEvent<{ channel: number, loopId: number }>(
    'setColorBackToUpcoming'
)

// Broadcast when the machine transitions between idle and actively
// playing loops.  Other systems listen to know when music is audible.
export const machinePlayState = new LocalEvent<{ isPlaying: boolean }>(
    'mbc25MachinePlayState'
)