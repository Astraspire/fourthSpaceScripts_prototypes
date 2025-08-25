import * as hz from 'horizon/core';
import { UIComponent, UINode, View, Text, Pressable, DynamicList, Binding } from 'horizon/ui';
import { Player } from 'horizon/core';
import {
    purchasePackWithSoundwaves,
    soundwaveBalanceChanged,
    inventoryUpdated,
    openSoundwaveStore,
} from './shared-events-MBC25';
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
    private balance: number = 0;

    /** Binding used to display the player's balance. */
    private balanceText = new Binding<string>('Soundwaves: 0');

    /** Binding containing the list of purchasable packs. */
    private storeData = new Binding<Array<{ packId: string; cost: number }>>([]);

    /** Message shown when no packs are available. */
    private emptyMessage = new Binding<string>('');

    /** stores the active player controlling the UI. */
    private uiOwner: string = "";

    private readonly STORE_PACKS = [
        { packId: 'MBC25-SOMETA', cost: 0 },
        { packId: 'MBC25-LUCKY', cost: 5 },
        //  Test Machines to exercise the soundwave credit system
        { packId: 'MBC25-TEST-2', cost: 10 },
        { packId: 'MBC25-TEST-3', cost: 20 },
    ];

    /** Return the first connected player as the shopper interacting with the store. */
    private getCurrentPlayer(): Player | null {
        const players = this.world.getPlayers();
        return players.length > 0 ? players[0] : null;
    }

    /** Look up a player's current soundwave balance from persistent storage. */
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
                    this.refreshStoreList(player.name.get());
                }
            }
        );

        // Remove purchased packs once the inventory updates.
        this.connectLocalBroadcastEvent(
            inventoryUpdated,
            ({ playerName }) => {
                const player = this.getCurrentPlayer();
                if (player && player.name.get() === playerName) {
                    this.refreshStoreList(playerName);
                }
            }
        );

        // Show the store UI when a player triggers it.
        this.connectLocalEvent(
            this.entity!,
            openSoundwaveStore,
            ({ player }: { player: Player }) => {
                const playerName = player.name.get();
                // Ensure the latest balance and inventory are displayed.
                this.refreshStoreList(playerName);
            }
        );

        // Populate the initial balance and store list once the component starts.
        this.refreshStoreList(this.uiOwner);
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
     * Helper that rebuilds the list of purchasable packs and updates bindings
     * so changes are shown immediately.
     */
    private refreshStoreList(playerName: string): void {
        if (!(playerName === "")) {
            const player = this.world.getPlayers().find(p => p.name.get() === playerName) ?? null;
            this.balance = this.getBalance(player);

            this.balanceText.set(`${playerName} has ` + `${this.balance} soundwaves`);

            const owned = this.getUnlockedPacks(player).map(p => p.packId);
            const available = this.STORE_PACKS.filter(p => !owned.includes(p.packId));

            if (available.length > 0) {
                this.storeData.set(available);
                this.emptyMessage.set('');
            } else {
                this.storeData.set([]);
                this.emptyMessage.set('No packs available for purchase.');
            }
        } else if (playerName === null) {
            this.balanceText.set(`No player in the world`);
            this.storeData.set([]);
            this.emptyMessage.set('No packs available for purchase.');
        }
        
    }

    /** Build the initial root view for the store UI. */
    initializeUI(): UINode {
        // Ensure the bindings reflect the current balance and available packs
        // before constructing the view so the panel shows up populated.
        this.refreshStoreList(this.uiOwner);
        return View({
            children: [
                Text({
                    text: this.balanceText,
                    style: { fontSize: 22, color: 'white', marginBottom: 8 },
                }),
                // Allow manual refresh in case automatic events fail to fire
                Pressable({
                    onPress: (_p: Player) => {
                        const playerName = _p.name.get();
                        this.refreshStoreList(playerName);
                    },
                        style: {
                        marginBottom: 8,
                        padding: 4,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        alignSelf: 'flex-start',
                    },
                    children: Text({
                        text: 'Refresh Store',
                        style: { fontSize: 18, color: 'white' },
                    }),
                }),
                DynamicList({
                    data: this.storeData,
                    renderItem: (pack) => {
                        const playerName = this.getCurrentPlayer()?.name.get() ?? '';
                        return Pressable({
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
                        });
                    },
                    style: { flexGrow: 1 },
                }),
                Text({
                    text: this.emptyMessage,
                    style: { fontSize: 20, color: 'gray' },
                }),
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
