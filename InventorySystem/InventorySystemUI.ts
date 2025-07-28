import * as hz from 'horizon/core';
import { Text, Pressable, UIComponent, UINode, View } from 'horizon/ui';
import { Entity, Player } from 'horizon/core';
import { requestMBCActivation, relinquishMBC } from './shared-events-MBC25';

/**
 * InventorySystem presents a simple UI listing the unlocked MBC25 packs
 * for the current player and allows them to activate one or relinquish
 * control of the currently active machine.  It relies on the
 * {@link MBCManager} to handle locking and activation logic.  A
 * managerEntity prop should be set to reference the entity running
 * MBCManager.  This component is implemented using the Pressable
 * element for interactive rows.
 */
class InventorySystemUI extends UIComponent<typeof InventorySystemUI> {
    /** Height of the panel in pixels. */
    protected panelHeight: number = 300;
    /** Width of the panel in pixels. */
    protected panelWidth: number = 500;

    /**
     * Expose a managerEntity property so that the UI can dispatch events
     * to the MBCManager.  The type is loosely typed as any because
     * Horizon's UI props system doesn't support strict Entity types in
     * TypeScript.  In practice this should be set in the editor to
     * reference the entity containing MBCManager.
     */
    static propsDefinition = {
        managerEntity: { type: hz.PropTypes.Entity },
    };

    /** Return the first connected player as the current UI owner. */
    private getCurrentPlayer(): Player | null {
        const players = this.world.getPlayers();
        return players.length > 0 ? players[0] : null;
    }

    /**
     * Retrieve the list of unlocked sound packs for the given player from
     * persistent storage.  If parsing fails or the key is missing, an empty array is returned.
     */
    private getUnlockedPacks(player: Player | null): Array<{ packId: string }> {
        const key = 'MBC25Inventory:unlockedSoundPacks';
        if (!player) return [];
        const raw = this.world.persistentStorage.getPlayerVariable<string>(player, key);
        if (!raw) return [];
        try {
            const parsed = JSON.parse(raw) as Array<{ packId: string }>;
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    /**
     * Build the UI panel for the inventory.  Each unlocked pack is
     * displayed as a Pressable row containing a text label.  When a
     * pack row is pressed, the UI sends a requestMBCActivation event
     * to the managerEntity with the player's name and the pack ID.
     * Additionally, a row allows the player to relinquish control of
     * the active machine by sending a relinquishMBC event.
     */
    initializeUI(): UINode {
        const player = this.getCurrentPlayer();
        const playerName = player ? player.name.get() : '';
        const packs = this.getUnlockedPacks(player);

        const children: UINode[] = [];

        // Create a Pressable row for each unlocked pack.
        if (packs.length > 0) {
            for (const item of packs) {
                const packId = item.packId;
                children.push(
                    Pressable({
                        onPress: (_player) => {
                            const manager: any = (this.props as any).managerEntity;
                            if (manager) {
                                this.sendLocalEvent(
                                    manager,
                                    requestMBCActivation,
                                    { playerName, packId }
                                );
                            }
                        },
                        style: {
                            marginBottom: 8,
                            padding: 4,
                            backgroundColor: 'rgba(255,255,255,0.1)',
                        },
                        children: Text({
                            text: `Load ${packId} pack`,
                            style: {
                                fontSize: 22,
                                color: 'green',
                            },
                        }),
                    })
                );
            }
        } else {
            children.push(
                Text({
                    text: 'No MBC25 packs unlocked.',
                    style: {
                        fontSize: 18,
                        color: 'white',
                        marginBottom: 8,
                    },
                })
            );
        }

        // Add a Pressable row to relinquish control of the active machine.
        children.push(
            Pressable({
                onPress: (_player) => {
                    const manager: any = (this.props as any).managerEntity;
                    if (manager) {
                        this.sendLocalEvent(
                            manager,
                            relinquishMBC,
                            { playerName }
                        );
                    }
                },
                style: {
                    marginTop: 16,
                    padding: 4,
                    backgroundColor: 'rgba(255,0,0,0.2)',
                },
                children: Text({
                    text: 'Put away your MBC25',
                    style: {
                        fontSize: 20,
                        color: 'red',
                    },
                }),
            })
        );

        return View({
            children,
            style: {
                backgroundColor: 'black',
                height: this.panelHeight,
                width: this.panelWidth,
                padding: 12,
                justifyContent: 'flex-start',
            },
        });
    }
}

// Register the UI component so it can be attached to a UI Gizmo.
UIComponent.register(InventorySystemUI);
