import * as hz from 'horizon/core';
import { UIComponent, UINode, View, Text, Pressable } from 'horizon/ui';
import { Player } from 'horizon/core';
import { purchasePackWithSoundwaves, soundwaveBalanceChanged } from './shared-events-MBC25';

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

    balance: number = 0;

    /** Trigger a rebuild of the UI. Placeholder until framework support exists. */
    private rerender(): void {
        // In a full implementation this would refresh the component's view.
    }

    private readonly STORE_PACKS = [
        { packId: 'MBC25-LUCKY', cost: 10 },
        { packId: 'MBC25-SOMETA', cost: 20 },
        // Low-cost test machine to exercise the soundwave credit system
        { packId: 'MBC25-TEST', cost: 1 },
    ];

    private getCurrentPlayer(): Player | null {
        const players = this.world.getPlayers();
        return players.length > 0 ? players[0] : null;
    }

    private getBalance(player: Player | null): number {
        const key = 'SoundwaveManager:points';
        if (!player) return 0;
        const raw = this.world.persistentStorage.getPlayerVariable<string>(player, key);
        return raw ? parseInt(raw, 10) : 0;
    }

    override preStart() {
        // Update balance when the manager notifies of changes.
        this.connectLocalBroadcastEvent(
            soundwaveBalanceChanged,
            (payload: { playerName: string; balance: number }) => {
                const player = this.getCurrentPlayer();
                if (player && player.name.get() === payload.playerName) {
                    this.balance = payload.balance;
                    this.rerender();
                }
            }
        );
    }
     

    private getUnlockedPacks(player: Player | null): Array<{ packId: string }> {
        const key = 'MBC25Inventory:unlockedSoundPacks';
        if (!player) return [];
        const raw = this.world.persistentStorage.getPlayerVariable<string>(player, key);
        let list: Array<{ packId: string }> = [];
        let changed = false;

        if (raw) {
            try {
                list = JSON.parse(raw) as Array<{ packId: string }>;
            } catch {
                list = [];
                changed = true;
            }
        }

        const defaults = ['MBC25-LUCKY', 'MBC25-SOMETA'];
        for (const id of defaults) {
            if (!list.some(p => p.packId === id)) {
                list.push({ packId: id });
                changed = true;
            }
        }

        if (!raw || changed) {
            this.world.persistentStorage.setPlayerVariable(
                player,
                key,
                JSON.stringify(list)
            );
        }

        return list;
    }

    initializeUI(): UINode {
        const player = this.getCurrentPlayer();
        const playerName = player ? player.name.get() : '';
        this.balance = this.getBalance(player);
        const owned = this.getUnlockedPacks(player).map(p => p.packId);
        const available = this.STORE_PACKS.filter(p => !owned.includes(p.packId));

        const children: UINode[] = [];

        children.push(
            Text({
                text: `Soundwaves: ${this.balance}`,
                style: { fontSize: 22, color: 'white', marginBottom: 8 },
            })
        );

        if (available.length > 0) {
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

            children.push(
                View({
                    children: packButtons,
                    style: {
                        flexGrow: 1,
                        overflow: 'visible',
                        marginBottom: 8,
                    },
                })
            );
        } else {
            children.push(
                Text({
                    text: 'No packs available for purchase.',
                    style: { fontSize: 20, color: 'gray' },
                })
            );
        }

        return View({
            children,
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
