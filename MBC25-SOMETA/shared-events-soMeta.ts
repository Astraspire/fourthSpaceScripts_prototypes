import { LocalEvent } from 'horizon/core';

export const stopRowEventSoMeta = new LocalEvent<{ channelId: number }>(
    'sendStopCommandToRowSoMeta'
)
export const loopTriggerEventSoMeta = new LocalEvent<{ channelId: number, loopSectionId: number }>(
    'sendLoopTriggerEventSoMeta'
)

export const offlineColorChangeEventSoMeta = new LocalEvent<{ channel: number, loopId: number }>(
    'setColorDefaultEventSoMeta'
)

export const hardOfflineColorChangeEventSoMeta = new LocalEvent<{ channel: number, loopId: number }>(
    'hardSetColorDefaultEventSoMeta'
)

export const playingColorChangeEventSoMeta = new LocalEvent<{ channel: number, loopId: number }>(
    'setColorToNowPlayingSoMeta'
) 

export const upcomingLoopColorChangedEventSoMeta = new LocalEvent<{ channel: number, loopId: number }>(
    'setColorBackToUpcomingSoMeta'
)

// Broadcast when the machine transitions between idle and actively
// playing loops.  Other systems listen to know when music is audible.
export const machinePlayState = new LocalEvent<{ isPlaying: boolean }>(
    'mbc25MachinePlayState'
)
