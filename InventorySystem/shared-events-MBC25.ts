import { LocalEvent, NetworkEvent, Player } from 'horizon/core';

export const changeActiveMBC = new LocalEvent<{ mbcId: string }>(
    'changeActiveMachine'
)

export const unlockMBC25 = new NetworkEvent<{ playerName: Player, packId: string }>(
    'playerUnlocksNewMBC25'
)

export const checkMBCInventory = new LocalEvent<{ playerName: string }>(
    'checkPlayersInventoryOfMBCs'
)