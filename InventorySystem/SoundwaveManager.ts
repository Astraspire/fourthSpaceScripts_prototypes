import * as hz from 'horizon/core';
import { Player } from 'horizon/core';
import { machinePlayState } from './shared-events-MBC25';
import {
    activePerformerChanged,
    purchasePackWithSoundwaves,
    soundwaveBalanceChanged,
    unlockMBC25,
} from './shared-events-MBC25';

/**
 * SoundwaveManager tracks and awards "soundwave" points to players based on
 * their activity with the MBC25 beat machine. Points accumulate once per
 * minute while a machine is playing and the player is not AFK. The active
 * performer receives an additional point per listening player. Points can be
 * spent to unlock additional sound packs.
 */
export default class SoundwaveManager extends hz.Component<typeof SoundwaveManager> {
    static propsDefinition = {
        InventoryManager: { type: hz.PropTypes.Entity },
    };

    /** Persistent storage key for a player's soundwave balance. */
    private readonly SOUNDWAVE_PPV = 'SoundwaveManager:points';

    private machinePlaying: boolean = false; // whether any loops are active
    private currentPerformer: string | null = null; // name of the active performer
    private afkPlayers: Set<string> = new Set(); // players currently AFK
    private listenerToastShown: Set<string> = new Set(); // to avoid duplicate toasts
    private performerToastShown: Set<string> = new Set();

    /** Retrieve a player's current soundwave balance. */
    private getBalance(player: Player): number {
        const raw = this.world.persistentStorage.getPlayerVariable<number>(
            player,
            this.SOUNDWAVE_PPV
        );
        return raw ?? 0;
    }

    /** Update a player's soundwave balance and notify UI listeners. */
    private setBalance(player: Player, balance: number): void {
        this.world.persistentStorage.setPlayerVariable(
            player,
            this.SOUNDWAVE_PPV,
            balance
        );
        this.sendLocalBroadcastEvent(soundwaveBalanceChanged, {
            playerName: player.name.get(),
            balance,
        });
    }

    /** Display a basic notification to the given player. */
    private showNotification(
        player: Player,
        opts: { text: string; position: { horizontal: 'left' | 'right'; vertical: 'top' | 'bottom' } }
    ): void {
        // Horizon currently lacks a built-in toast API, so log to console.
        console.log(`[Notification to ${player.name.get()}] ${opts.text}`);
    }

    /** Show a one-time toast to listeners when they start earning points. */
    private showListenerToast(player: Player): void {
        // Hypothetical API for displaying a toast in the top-left corner.
        this.showNotification(player, {
            text: 'Earning soundwaves!',
            position: { horizontal: 'left', vertical: 'top' },
        });
    }

    /** Show a one-time toast to performers when they receive amplified points. */
    private showPerformerToast(player: Player): void {
        this.showNotification(player, {
            text: 'Amplified soundwaves active!',
            position: { horizontal: 'left', vertical: 'bottom' },
        });
    }

    /** Award points every minute to active players. */
    private awardPoints = () => {
        // Log each tick so we can verify the cadence of the award cycle and
        // whether the machine is considered "playing".
        console.log(
            `[Soundwave] awardPoints tick - machinePlaying=${this.machinePlaying}`
        );
        if (!this.machinePlaying) return;
        const players = this.world.getPlayers();
        const active = players.filter(p => !this.afkPlayers.has(p.name.get()));
        console.log(
            `[Soundwave] active listeners this tick: ${active.length} / ${players.length}`
        );

        // Everyone listening earns one point per minute.
        for (const p of active) {
            const newBal = this.getBalance(p) + 1;
            this.setBalance(p, newBal);
            // Log and notify each increment so we can verify accumulation.
            console.log(`[Soundwave] ${p.name.get()} earned 1 point (total: ${newBal}).`);
            this.showNotification(p, {
                text: `+1 soundwave (total ${newBal})`,
                position: { horizontal: 'left', vertical: 'top' },
            });
            if (!this.listenerToastShown.has(p.name.get())) {
                this.listenerToastShown.add(p.name.get());
                this.showListenerToast(p);
            }
        }

        // Performer gets a boost for each listener.
        if (this.currentPerformer) {
            const performer = active.find(p => p.name.get() === this.currentPerformer);
            if (performer) {
                const listeners = active.length - 1; // exclude performer
                if (listeners > 0) {
                    const newBal = this.getBalance(performer) + listeners;
                    this.setBalance(performer, newBal);
                    console.log(`[Soundwave] ${performer.name.get()} earned ${listeners} bonus point(s) (total: ${newBal}).`);
                    this.showNotification(performer, {
                        text: `+${listeners} soundwave${listeners > 1 ? 's' : ''} (total ${newBal})`,
                        position: { horizontal: 'left', vertical: 'bottom' },
                    });
                }
                if (!this.performerToastShown.has(this.currentPerformer)) {
                    this.performerToastShown.add(this.currentPerformer);
                    this.showPerformerToast(performer);
                }
            }
        }
    };

    /** Handle purchase requests from the store UI. */
    /** Attempt to purchase a pack with soundwave points for the given player. */
    private handlePurchase = ({ playerName, packId, cost }: { playerName: string; packId: string; cost: number; }) => {
        const player = this.world
            .getPlayers()
            .find(p => p.name.get() === playerName);
        if (!player) return;
        const balance = this.getBalance(player);
        if (balance < cost) {
            console.log(`${playerName} lacks soundwaves for ${packId}.`);
            return;
        }
        this.setBalance(player, balance - cost);
        // Unlock the purchased pack for the player.
        this.sendLocalEvent(this.props.InventoryManager!, unlockMBC25, { playerName, packId });
    };

    preStart() {
        // Track AFK status so inactive players don't earn points.
        this.connectCodeBlockEvent(
            this.entity!,
            hz.CodeBlockEvents.OnPlayerEnterAFK,
            (p: Player) => this.afkPlayers.add(p.name.get())
        );
        this.connectCodeBlockEvent(
            this.entity!,
            hz.CodeBlockEvents.OnPlayerExitAFK,
            (p: Player) => this.afkPlayers.delete(p.name.get())
        );

        // Listen for machine play state and log changes.
        this.connectLocalBroadcastEvent(machinePlayState, ({ isPlaying }) => {
            this.machinePlaying = isPlaying;
            if (this.machinePlaying = true) {
                this.awardPoints();
            }
            console.log(`MBC25 machine is now ${isPlaying ? 'playing' : 'stopped'}.`);
            // Notify all players so we can immediately see when active listening starts
            // or stops, providing feedback similar to a simple toast UI.
            for (const p of this.world.getPlayers()) {
                this.showNotification(p, {
                    text: isPlaying
                        ? 'Active listening started!'
                        : 'Active listening paused.',
                    position: { horizontal: 'left', vertical: 'top' },
                });
            }
            
        });

        // Keep track of which player is performing for bonus points.
        this.connectLocalBroadcastEvent(activePerformerChanged, ({ playerName }) => {
            this.currentPerformer = playerName;
        });

        // Handle purchase requests coming from the store UI.
        this.connectLocalEvent(
            this.entity!,
            purchasePackWithSoundwaves,
            this.handlePurchase
        );

        // Award points every minute based on current activity.
        this.async.setInterval(this.awardPoints, 60_000);
    }

    start() {
        // nothing required
    }
}

hz.Component.register(SoundwaveManager);
