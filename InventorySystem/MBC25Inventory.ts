import * as hz from "horizon/core";
import { Component, Player } from "horizon/core";
import { Inventory } from "./SoundPackTypes";
import { changeActiveMBC, checkMBCInventory, dropMBC, unlockMBC25 } from "./shared-events-MBC25";

const SOUND_PACKS_PPV = "MBC25Inventory:unlockedSoundPacks";

export default class MBC25Inventory extends Component<typeof MBC25Inventory> {
    static propsDefinition = {
        luckyUnlockTrigger: { type: hz.PropTypes.Entity },
        luckyMBC: { type: hz.PropTypes.Entity },
        checkForLuckyTrigger: { type: hz.PropTypes.Entity },
    }


    /** Read and parse the JSON-encoded array of pack IDs */
    private getUnlockedPacks(player: Player): Inventory[] {
        const raw = this.world.persistentStorage.getPlayerVariable<string>(
            player,
            SOUND_PACKS_PPV
        );
        try {
            return raw
                ? (JSON.parse(raw) as Inventory[])
                : [];
        } catch {
            return [];
        }
    }

    /** Add a new { playerName, packId } and save back to PPV */
    private unlockSoundPack(playerName: string, packId: string): void {
        const player = this.findPlayerByName(playerName)!;
        const list = this.getUnlockedPacks(player);
        if (!list.some(e => e.packId === packId)) {
            list.push({ packId });
            this.world.persistentStorage.setPlayerVariable(
                player,
                SOUND_PACKS_PPV,
                JSON.stringify(list)
            );
            console.log(`${playerName} now unlocked the ${packId} pack!`)
        } else if (list.some(e => e.packId === packId)) {
            this.sendLocalBroadcastEvent(
                dropMBC,
                ({ packId })
            )
        }
    }

    // finds player based on name as string variable
    private findPlayerByName(playerName: string): Player | null {
        return (
            this.world
                .getPlayers()                               // get all human & NPC players :contentReference[oaicite:5]{index=5}
                .find(p => p.name.get() === playerName)     // compare to each p.name.get() :contentReference[oaicite:6]{index=6}
            ?? null
        );
    }

    // Convert stored IDs into SamplePackEntry objects
    private getFullInventory(playerInventory: Inventory) {
        console.log(`${playerInventory.packId} is unlocked in inventory.`);
    }

    private printUserInventory(player: Player): void {
        if (player) {
            const inventory = this.getUnlockedPacks(player);
            for (let item of inventory) {
                console.log(`NEW: ${item} is owned by ${player.name.get()}!!!`)
            }
            console.log(`OLD: ${inventory} is owned by ${player.name.get()}.`);
            return;
        } else {
            console.log(`Invalid user for inventory check.`);
        }

    }

   
    preStart() {
        // checks inventory when LuckyCheck trigger is entered
        this.connectLocalEvent(
            this.entity!,
            checkMBCInventory,
            ({ playerId }) => {
                console.log(`checkMBCInventory event is received.`);
                // prints user's inventory
                this.printUserInventory(playerId);
                
            }
        );

        // unlocks Lucky Machine into inventory
        this.connectLocalEvent(
            this.entity!,
            unlockMBC25,
            (unlockData) => {
                console.log(`${unlockData.playerName} hit the \'unlocked the ${unlockData.packId} LuckyMBC25 event!\''`);
                this.unlockSoundPack(unlockData.playerName, unlockData.packId);
            }
        );

    }

    // Required lifecycle hook (can be empty)
    override start() {

    }

}

Component.register(MBC25Inventory);
