type SamplePackOptions = {
  mbcVariantId: string; // "SoMeta" or "Lucky"
};


import * as hz from 'horizon/core';
import { Component, CodeBlockEvents, Player } from "horizon/core";
import { changeActiveMBC, unlockMBC25 } from 'shared-events-MBC25';

class InventoryManager extends hz.Component<typeof InventoryManager> {
    static propsDefinition = {
        unlockTrigger: { type: hz.PropTypes.Entity },
    };

    const SAMPLE_PACKS_PPV = "MBC225Inventory:unlockedSoundPacks";

    override preStart() {
        // Example hook: unlock a demo pack on first join
        this.connectCodeBlockEvent(
            this.entity,
            CodeBlockEvents.OnPlayerEnterTrigger,
            (player: Player) => {
                if (!this.hasUnlocked(player, "SoMeta")) {
                    this.unlockPack(player, "SoMeta");
                }
            }
        );
    }

    /** Read the full array of unlocked packs (or [] if none yet) */
    private getInventory(player: Player): InventoryManager[] {
        return (
            this.world.persistentStorage.getPlayerVariable<[]>(
                player,
                this.SAMPLE_PACKS_PPV
            ) ?? []
        );
    }

    /** Persist an updated array of entries */
    private saveInventory(player: Player, inv: InventoryManager[]) {
        this.world.persistentStorage.setPlayerVariable(
            player,
            this.SAMPLE_PACKS_PPV,
            inv
        );
    }

    /** Check if a given packId is already unlocked */
    hasUnlocked(player: Player, packId: string): boolean {
        return this.getInventory(player).some((e) => e.mbcVariantId === packId);
    }

    /** Unlocks a new pack, stamping in the timestamp and default visuals */
    unlockPack(player: Player, packId: string) {
        const inv = this.getInventory(player);
        if (inv.some((e) => e.packId === packId)) return;  // already unlocked

        inv.push({
            packId,
            unlockedAt: Date.now(),
            options: {
                skinId: "default",
                colorScheme: "#ffffff",
            },
        });
        this.saveInventory(player, inv);
    }


    private registerInventoryAddition( newMbcVariant: string, playerName: string ) {
        console.log('need to add registerInventoryAddition method to InventoryManager script.');
        this.playerInventory = 

        console.log(`${this.playerInventory} in inventory and ${playerName} entered the trigger to do it.\n
        Soon they'll unlock the ${newMbcVariant}!'`);
    }

    override preStart() {
        this.connectNetworkEvent (
            this.props.unlockTrigger!,
            unlockMBC25,
            (incomingData) => {
                this.registerInventoryAddition(incomingData.mbcVariant, incomingData.playerName);
            }
        )
    }

    start() {

    }
}
hz.Component.register(InventoryManager);


