import * as hz from "horizon/core";
import { Component, Player } from "horizon/core";
import { SamplePackEntry } from "./SoundPackTypes";
import { checkMBCInventory, unlockMBC25 } from "./shared-events-MBC25";

const SOUND_PACKS_PPV = "MBC25Inventory:unlockedSoundPacks";

export default class MBC25Inventory extends Component<typeof MBC25Inventory> {
    static propsDefinition = {
        luckyUnlockTrigger: { type: hz.PropTypes.Entity },
    }


    /** Read and parse the JSON-encoded array of pack IDs */
    private getUnlockedPacks(player: Player): string[] {
        const raw = this.world.persistentStorage.getPlayerVariable<string>(
            player,
            SOUND_PACKS_PPV
        );
        try {
            return raw ? (JSON.parse(raw) as string[]) : [];
        } catch {
            // Fallback on malformed data
            return [];
        }
    }

    /** Add a new pack ID and save back to PPV */
    private unlockSoundPack(playerName: string, packId: string): void {
        const player = this.findPlayerByName(playerName);

        const list = this.getUnlockedPacks(player!);
        if (!list.includes(packId)) {
            list.push(packId);
            this.world.persistentStorage.setPlayerVariable(
                player!,
                SOUND_PACKS_PPV,
                JSON.stringify(list)
            );
        }
        console.log(`${playerName} owns ${packId}? will check inventory...`);
        this.printUserInventory();
    }

    private findPlayerByName(playerName: string): Player | null {
        return (
            this.world
                .getPlayers()                               // get all human & NPC players :contentReference[oaicite:5]{index=5}
                .find(p => p.name.get() === playerName)     // compare to each p.name.get() :contentReference[oaicite:6]{index=6}
            ?? null
        );
    }

    /** Convert stored IDs into SamplePackEntry objects */
    private getFullInventory(player: Player): SamplePackEntry[] {
        return this.getUnlockedPacks(player).map((id) => ({ packId: id }));
    }

    private printUserInventory(): void {
        const inventory = this.getFullInventory
        console.log(`${inventory} is owned.`)
    }

    preStart() {
        this.connectLocalEvent(
            this.entity!,
            unlockMBC25,
            (unlockData) => {
                console.log(`${unlockData} hit the \'unlocked the LuckyMBC25 event!\''`);
                this.unlockSoundPack(unlockData.playerName, unlockData.packId)
            }
        );

    }

    // Required lifecycle hook (can be empty)
    override start(){ }

}

Component.register(MBC25Inventory);
