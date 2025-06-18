import { LocalEvent } from 'horizon/core';

export const stopRowEvent = new LocalEvent <{ channelId: number }>(
    'sendStopCommandToRow'
)
export const loopTriggerEvent = new LocalEvent<{ channelId: number, loopSectionId: number }>(
    'sendLoopTriggerEvent'
)
