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

