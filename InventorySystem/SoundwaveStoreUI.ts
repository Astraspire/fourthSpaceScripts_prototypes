import * as hz from 'horizon/core';
import { UIComponent, UINode, View, Text, Pressable } from 'horizon/ui';
import { Player } from 'horizon/core';
import { purchasePackWithSoundwaves, soundwaveBalanceChanged, inventoryUpdated } from './shared-events-MBC25';
import { addDefaultPacks, maskToPackList } from './PackIdBitmask';

/**
 * Simple UI panel that lets players spend soundwave points on additional
 * beat packs. Packs are presented in a scrollable list and can be purchased
 * if the player has enough balance.
 */
class SoundwaveStoreUI extends UIComponent<typeof SoundwaveStoreUI> {
    static propsDefinition = {
        managerEntity: { type: hz.PropTypes.Entity },
    };

    panelWidth = 500;
    panelHeight = 400;

    /** Tracks the player's current soundwave balance. */
    balance: number = 0;

    /** Current list of purchasable pack UI nodes. */
    private storeList: UINode[] = [];

    /** Trigger a rebuild of the UI using the latest state. */
    private rerender(): void {
        // Cast to any because setRootView isn't declared in the UIComponent
        // TypeScript typings even though it's available at runtime.
        (this as any).setRootView(this.initializeUI());
    }

    private readonly STORE_PACKS = [
        { packId: 'MBC25-SOMETA', cost: 0 },
        { packId: 'MBC25-LUCKY', cost: 5 },
        //  Test Machines to exercise the soundwave credit system
        { packId: 'MBC25-TEST-2', cost: 10 },
        { packId: 'MBC25-TEST-3', cost: 20 },
    ];

    private getCurrentPlayer(): Player | null {
        const players = this.world.getPlayers();
        return players.length > 0 ? players[0] : null;
    }

    private getBalance(player: Player | null): number {
        const key = 'SoundwaveManager:points';
        if (!player) return 0;
        const raw = this.world.persistentStorage.getPlayerVariable<number>(player, key);
        return raw ?? 0;
    }

    override preStart() {
        // Update balance when the manager notifies of changes.
        this.connectLocalBroadcastEvent(
            soundwaveBalanceChanged,
            (payload: { playerName: string; balance: number }) => {
                const player = this.getCurrentPlayer();
                if (player && player.name.get() === payload.playerName) {
                    this.balance = payload.balance;
                    // Rebuild the purchasable list in case a pack was bought.
                    this.refreshStoreList(true);
                }
            }
        );

        // Remove purchased packs once the inventory updates.
        this.connectLocalBroadcastEvent(
            inventoryUpdated,
            ({ playerName }) => {
                const player = this.getCurrentPlayer();
                if (player && player.name.get() === playerName) {
                    this.refreshStoreList(true);
                }
            }
        );
    }

    private getUnlockedPacks(player: Player | null): Array<{ packId: string }> {
        const key = 'MBC25Inventory:unlockedSoundPacks';
        if (!player) return [];
        let mask = this.world.persistentStorage.getPlayerVariable<number>(player, key) ?? 0;
        const updated = addDefaultPacks(mask);
        if (updated !== mask) {
            mask = updated;
            this.world.persistentStorage.setPlayerVariable(player, key, mask);
        }
        return maskToPackList(mask);
    }

    /**
     * Helper that rebuilds the list of purchasable packs and optionally
     * triggers a UI rerender so changes are shown immediately.
     */
    private refreshStoreList(triggerRerender: boolean = false): void {
        const player = this.getCurrentPlayer();
        const playerName = player ? player.name.get() : '';
        this.balance = this.getBalance(player);

        const owned = this.getUnlockedPacks(player).map(p => p.packId);
        const available = this.STORE_PACKS.filter(p => !owned.includes(p.packId));

        const packButtons: UINode[] = [];
        for (const pack of available) {
            packButtons.push(
                Pressable({
                    onPress: (_p: Player) => {
                        const manager: any = (this.props as any).managerEntity;
                        if (manager) {
                            this.sendLocalEvent(manager, purchasePackWithSoundwaves, {
                                playerName,
                                packId: pack.packId,
                                cost: pack.cost,
                            });
                        }
                    },
                    style: {
                        marginBottom: 8,
                        padding: 4,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                    children: Text({
                        text: `${pack.packId} - ${pack.cost} SW`,
                        style: { fontSize: 20, color: 'cyan' },
                    }),
                })
            );
        }

        if (packButtons.length > 0) {
            this.storeList = packButtons;
        } else {
            this.storeList = [
                Text({
                    text: 'No packs available for purchase.',
                    style: { fontSize: 20, color: 'gray' },
                }),
            ];
        }

        if (triggerRerender) {
            this.rerender();
        }
    }

    /** Build the initial root view for the store UI. */
    initializeUI(): UINode {
        // Populate the balance and list for the initial render.

        this.refreshStoreList();
        return View({
            children: [
                Text({
                    text: `Soundwaves: ${this.balance}`,
                    style: { fontSize: 22, color: 'white', marginBottom: 8 },
                }),
                View({ children: this.storeList, style: { flexGrow: 1 } }),
            ],
            style: {
                backgroundColor: 'black',
                padding: 12,
                width: this.panelWidth,
                height: this.panelHeight,
                justifyContent: 'flex-start',
            },
        });
    }
}

UIComponent.register(SoundwaveStoreUI);
