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

export const playingColorChangeEvent = new LocalEvent<{ channel: number, loopId: number }>(
    'setColorToNowPlaying'
) 

export const upcomingLoopColorChangedEvent = new LocalEvent<{ channel: number, loopId: number }>(
    'setColorBackToUpcoming'
)