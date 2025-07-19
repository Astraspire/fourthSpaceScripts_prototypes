import { LocalEvent, NetworkEvent, Player } from 'horizon/core';

export const changeActiveMBC = new LocalEvent<{ packId: string }>(
    'changeActiveMachine'
)

export const unlockMBC25 = new LocalEvent<{ playerName: string, packId: string }>(
    'playerUnlocksNewMBC25'
)

export const checkMBCInventory = new LocalEvent<{ playerName: Player }>(
    'checkPlayersInventoryOfMBCs'
)

export const dropMBC = new LocalEvent<{ packId: string }>(
    'drop correct MBC based on specification'
)