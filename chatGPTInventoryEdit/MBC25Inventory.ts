import * as hz from "horizon/core";
import { Component, Player } from "horizon/core";
import { Inventory } from "./SoundPackTypes";
import { changeActiveMBC, checkMBCInventory, dropMBC, unlockMBC25 } from "./shared-events-MBC25";

/**
 * The key used to store per‑player state in persistent storage.
 *
 * Horizon Worlds provides a per‑player persistent key‑value store that
 * persists across sessions.  We save an array of pack IDs under this
 * key.  Each entry in the array is an object conforming to the
 * {@link Inventory} interface (currently just a packId string).
 */
const SOUND_PACKS_PPV = "MBC25Inventory:unlockedSoundPacks";

export default class MBC25Inventory extends Component<typeof MBC25Inventory> {
    static propsDefinition = {
        luckyUnlockTrigger: { type: hz.PropTypes.Entity },
        luckyMBC: { type: hz.PropTypes.Entity },
        checkForLuckyTrigger: { type: hz.PropTypes.Entity },
    }

    /** 
     * Read and parse the JSON‑encoded array of pack IDs stored for a
     * particular player.
     *
     * The persistent storage returns strings.  We parse the stored
     * JSON; if parsing fails (for example, corrupted data), we fall
     * back to an empty array.
     *
     * @param player The player whose inventory we are reading.
     * @returns An array of {@link Inventory} records representing
     *          unlocked packs.
     */
    private getUnlockedPacks(player: Player): Inventory[] {
        const raw = this.world.persistentStorage.getPlayerVariable<string>(
            player,
            SOUND_PACKS_PPV
        );
        try {
            return raw ? (JSON.parse(raw) as Inventory[]) : [];
        } catch {
            // If JSON parsing fails we reset to an empty list.  This
            // prevents runtime errors and gives players a chance to
            // rebuild their inventory.
            return [];
        }
    }

    /**
     * Look up a Player object from a provided name string.
     *
     * A number of events pass player names as strings.  This helper
     * iterates over all current players (both human and NPC) and
     * returns the matching Player object if found.
     *
     * @param playerName The name to search for.
     * @returns The matching Player or null if no match is found.
     */
    private findPlayerByName(playerName: string): Player | null {
        return (
            this.world
                .getPlayers()
                .find(p => p.name.get() === playerName)
            ?? null
        );
    }

    /**
     * Optional helper to log that a given pack ID exists in the
     * player's inventory.  In a more feature‑complete implementation
     * this might convert simple IDs into richer data about each pack.
     *
     * @param playerInventory An inventory record containing the packId.
     */
    private getFullInventory(playerInventory: Inventory) {
        console.log(`${playerInventory.packId} is unlocked in inventory.`);
    }

    /**
     * Diagnostic helper to print the contents of a player's inventory
     * to the console.  This is particularly useful during testing.
     *
     * @param player The Player whose inventory will be printed.
     */
    private printUserInventory(player: Player): void {
        if (player) {
            const inventory = this.getUnlockedPacks(player);
            for (const item of inventory) {
                console.log(`NEW: ${JSON.stringify(item)} is owned by ${player.name.get()}!!!`);
            }
            console.log(`OLD: ${JSON.stringify(inventory)} is owned by ${player.name.get()}.`);
        } else {
            console.log(`Invalid user for inventory check.`);
        }
    }

    /**
     * Persistently unlock a new sound pack for a player.
     *
     * When a player triggers an unlock event (for example by walking
     * through a trigger volume), we need to store that they own the
     * corresponding MBC.  This method does the following:
     *  - Look up the player's current list of unlocked packs from
     *    persistent storage.  If the list does not exist or cannot be
     *    parsed, we treat it as an empty array.
     *  - If the pack is not already in the list, we add it and write
     *    the updated array back to persistent storage.
     *  - Regardless of whether the pack was newly unlocked or already
     *    owned, we broadcast a {@link dropMBC} event so that any
     *    listening MBC machines can drop down and appear for the
     *    player.  Without this call, newly unlocked machines would not
     *    become visible until the next inventory check.
     *
     * @param playerName The human‑readable name of the player who
     *                   unlocked the pack.
     * @param packId     The identifier of the pack being unlocked.
     */
    private unlockSoundPack(playerName: string, packId: string): void {
        const player = this.findPlayerByName(playerName);
        if (!player) return;

        const list = this.getUnlockedPacks(player);

        if (!list.some(e => e.packId === packId)) {
            list.push({ packId });
            this.world.persistentStorage.setPlayerVariable(
                player,
                SOUND_PACKS_PPV,
                JSON.stringify(list)
            );
            console.log(`${playerName} now unlocked the ${packId} pack!`);
        } else {
            console.log(`${playerName} already owns the ${packId} pack.`);
        }

        // Broadcast a drop event whether or not the pack was new.
        this.sendLocalBroadcastEvent(dropMBC, { packId });
    }

    preStart() {
        // checks inventory when LuckyCheck trigger is entered
        this.connectLocalEvent(
            this.entity!,
            checkMBCInventory,
            ({ playerId }) => {
                console.log(`checkMBCInventory event is received.`);
                // Print the player's inventory for debugging purposes.
                this.printUserInventory(playerId);

                // For each pack the player owns, broadcast a drop event.
                const unlocked = this.getUnlockedPacks(playerId);
                for (const item of unlocked) {
                    this.sendLocalBroadcastEvent(dropMBC, { packId: item.packId });
                }
            }
        );

        // unlocks Lucky Machine into inventory
        this.connectLocalEvent(
            this.entity!,
            unlockMBC25,
            (unlockData) => {
                console.log(`${unlockData.playerName} triggered an unlock for the '${unlockData.packId}' pack!`);
                this.unlockSoundPack(unlockData.playerName, unlockData.packId);
            }
        );
    }

    start() {
        // No additional initialization required
    }
}

Component.register(MBC25Inventory);
