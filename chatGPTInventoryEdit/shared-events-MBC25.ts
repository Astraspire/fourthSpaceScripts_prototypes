import { LocalEvent, NetworkEvent, Player } from 'horizon/core';

/**
 * Event raised to request a specific MBC25 machine to become active
 * (for example, when swapping between variants).  Listeners can
 * respond by dropping the corresponding machine.  Contains the
 * identifier of the pack to activate.
 */
export const changeActiveMBC = new LocalEvent<{ packId: string }>(
    'changeActiveMachine'
);

/**
 * Event sent from unlock triggers to the inventory manager.  Carries
 * the player's name and the identifier of the pack that was just
 * unlocked.  The inventory manager will update persistent storage and
 * broadcast a drop event so the machine appears immediately.
 */
export const unlockMBC25 = new LocalEvent<{ playerName: string; packId: string }>(
    'playerUnlocksNewMBC25'
);

/**
 * Event used by trigger zones to ask the inventory system which
 * machines a player currently owns.  The inventory manager will
 * respond by printing the inventory (for debugging) and broadcasting
 * drop events for each owned pack.
 */
export const checkMBCInventory = new LocalEvent<{ playerId: Player }>(
    'checkPlayersInventoryOfMBCs'
);

/**
 * Event broadcast by the inventory manager to tell all MBC machines to
 * drop if they correspond to the given pack ID.  Each MBCDrop
 * component listens for this event and triggers its drop animation
 * when the pack ID matches its own configured `packId` property.
 */
export const dropMBC = new LocalEvent<{ packId: string }>(
    'drop correct MBC based on specification'
);
