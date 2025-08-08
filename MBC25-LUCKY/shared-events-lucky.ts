import { LocalEvent } from 'horizon/core';

export const stopRowEventLucky = new LocalEvent<{ channelId: number }>(
    'sendStopCommandToRow'
)
export const loopTriggerEventLucky = new LocalEvent<{ channelId: number, loopSectionId: number }>(
    'sendLoopTriggerEvent'
)

export const offlineColorChangeEventLucky = new LocalEvent<{ channel: number, loopId: number }>(
    'setColorDefaultEvent'
)

export const hardOfflineColorChangeEventLucky = new LocalEvent<{ channel: number, loopId: number }>(
    'hardSetColorDefaultEvent'
)

export const playingColorChangeEventLucky = new LocalEvent<{ channel: number, loopId: number }>(
    'setColorToNowPlaying'
) 

export const upcomingLoopColorChangedEventLucky = new LocalEvent<{ channel: number, loopId: number }>(
    'setColorBackToUpcoming'
)

// Broadcast when the machine transitions between idle and actively
// playing loops.  Other systems listen to know when music is audible.
export const machinePlayState = new LocalEvent<{ isPlaying: boolean }>(
    'mbc25MachinePlayState'
)

