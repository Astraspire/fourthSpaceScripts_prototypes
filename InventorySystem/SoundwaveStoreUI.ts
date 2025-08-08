import * as hz from 'horizon/core';
import { UIComponent, UINode, View, Text, Pressable } from 'horizon/ui';
import { Player } from 'horizon/core';
import { purchasePackWithSoundwaves, soundwaveBalanceChanged } from './shared-events-MBC25';

/**
 * Minimal placeholder text input component. In a full Horizon environment
 * this would provide an editable field; here we simply render static text
 * so the module type-checks without depending on a specific UI widget.
 */
function TextInput(props: {
    text: string;
    placeholder?: string;
    onTextChanged?: (player: Player, text: string) => void;
    style?: any;
}): UINode {
    return View({
        children: Text({ text: props.text || props.placeholder || '' }),
        style: props.style,
    });
}

/**
 * Simple UI panel that lets players spend soundwave points on additional
 * beat packs.  The player can search available packs and purchase them if
 * they have enough balance.
 */
class SoundwaveStoreUI extends UIComponent<typeof SoundwaveStoreUI> {
    static propsDefinition = {
        managerEntity: { type: hz.PropTypes.Entity },
    };

    protected panelWidth: number = 500;
    protected panelHeight: number = 400;

    private searchTerm: string = '';
    private balance: number = 0;

    private readonly STORE_PACKS = [
        { packId: 'MBC25-LUCKY', cost: 10 },
        { packId: 'MBC25-SOMETA', cost: 20 },
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

    /** Placeholder to satisfy calls to rerender when state changes. */
    private rerender(): void {
        // In an actual UI environment this would refresh the displayed UI.
    }

    initializeUI(): UINode {
        const player = this.getCurrentPlayer();
        const playerName = player ? player.name.get() : '';
        this.balance = this.getBalance(player);

        const filtered = this.STORE_PACKS.filter(p =>
            p.packId.toLowerCase().includes(this.searchTerm.toLowerCase())
        );

        const children: UINode[] = [];

        children.push(
            Text({
                text: `Soundwaves: ${this.balance}`,
                style: { fontSize: 22, color: 'white', marginBottom: 8 },
            })
        );

        children.push(
            TextInput({
                text: this.searchTerm,
                placeholder: 'Search packs',
                onTextChanged: (_p: Player, text: string) => {
                    this.searchTerm = text;
                    this.rerender();
                },
                style: { marginBottom: 12 },
            })
        );

        for (const pack of filtered) {
            children.push(
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
