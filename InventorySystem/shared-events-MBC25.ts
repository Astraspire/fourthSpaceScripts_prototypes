import { LocalEvent, NetworkEvent, Player } from 'horizon/core';

export const changeActiveMBC = new LocalEvent<{ mbcId: string }>(
    'changeActiveMachine'
)

export const unlockMBC25 = new NetworkEvent<{ mbcVariant: string, playerName: string }>(
    'playerUnlocksNewMBC25'
)