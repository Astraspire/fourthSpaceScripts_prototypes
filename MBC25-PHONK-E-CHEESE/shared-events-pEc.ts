import { LocalEvent } from 'horizon/core';

export const stopRowEventpEc = new LocalEvent<{ channelId: number }>(
    'sendStopCommandToRow'
)
export const loopTriggerEventpEc = new LocalEvent<{ channelId: number, loopSectionId: number }>(
    'sendLoopTriggerEvent'
)

export const offlineColorChangeEventpEc = new LocalEvent<{ channel: number, loopId: number }>(
    'setColorDefaultEvent'
)

export const hardOfflineColorChangeEventpEc = new LocalEvent<{ channel: number, loopId: number }>(
    'hardSetColorDefaultEvent'
)

export const playingColorChangeEventpEc = new LocalEvent<{ channel: number, loopId: number }>(
    'setColorToNowPlaying'
)

export const upcomingLoopColorChangedEventpEc = new LocalEvent<{ channel: number, loopId: number }>(
    'setColorBackToUpcoming'
)

