import * as hz from 'horizon/core';
import {
    changeActiveMBC,
    requestMBCActivation,
    relinquishMBC,
    dropMBC,
    activePerformerChanged,
} from './shared-events-MBC25';

/**
 * The MBCManager component ensures that at most one MBC25 beat machine
 * is active in the world at any given time.  It tracks which
 * variant (identified by its packId) is currently in use and which
 * player owns the machine.  When a new activation request comes in
 * via {@link requestMBCActivation}, the manager will either grant
 * control (if no machine is active or the same player already owns
 * one) or ignore the request.  Upon granting control it broadcasts
 * a {@link changeActiveMBC} event so that all {@link MBCDrop}
 * components can show or hide themselves appropriately.  The
 * manager also listens for {@link relinquishMBC} to release the
 * current lock and hide any active machine.  Additionally, if a
 * sound pack is unlocked and no machine is currently active, the
 * manager will automatically drop the newly unlocked machine.
 */
class MBCManager extends hz.Component<typeof MBCManager> {
    static propsDefinition = {
        // No configurable props are required at this time.
    };

    /** The pack identifier of the currently active machine, or null if none. */
    private activePack: string | null = null;
    /** The name of the player currently controlling the machine, or null if none. */
    private controllingPlayer: string | null = null;

    /**
     * Key used to store per-player sound pack unlocks in persistent storage.
     * This matches the constant defined in {@link MBC25Inventory}.
     */
    private readonly SOUND_PACKS_PPV = 'MBC25Inventory:unlockedSoundPacks';

    /**
     * Determine whether a given player has unlocked a specific pack.  This
     * reads the player's persistent storage and parses the JSON array of
     * unlocked packs.  If the player is not found or the data cannot
     * be parsed, false is returned.
     *
     * @param playerName The human-readable name of the player.
     * @param packId The identifier of the pack to check for.
     */
    private playerHasUnlocked(playerName: string, packId: string): boolean {
        const player = this.world
            .getPlayers()
            .find(p => p.name.get() === playerName);
        if (!player) return false;
        const raw = this.world.persistentStorage.getPlayerVariable<string>(
            player,
            this.SOUND_PACKS_PPV
        );
        if (!raw) return false;
        try {
            const list = JSON.parse(raw) as Array<{ packId: string }>;
            return list.some(item => item.packId === packId);
        } catch {
            return false;
        }
    }

    private forfeitControlCountdown(player: hz.Player): void {
        const playerName = player.name.get();

        const durationMs = 30_000;
        const startTime = Date.now();
        let aborted = false;

        // subscribe once, set flag on AFK-exit
        const exitSub = this.connectCodeBlockEvent(
            this.entity!,
            hz.CodeBlockEvents.OnPlayerExitAFK,
            () => {
                aborted = true;
                exitSub.disconnect();
            }
        );

        // schedule a repeating check every 100 ms
        const intervalId = this.async.setInterval(() => {
            if (aborted) {
                // player returned — cancel interval and bail out
                this.async.clearInterval(intervalId);
                return;
            }

            const elapsed = Date.now() - startTime;
            if (elapsed >= durationMs) {
                // time’s up — do your forfeit logic
                if (playerName === this.controllingPlayer) {
                    this.activePack = null;
                    this.controllingPlayer = null;
                    this.sendLocalBroadcastEvent(changeActiveMBC, { packId: '' });
                    this.sendLocalBroadcastEvent(activePerformerChanged, { playerName: null });
                }
                this.async.clearInterval(intervalId);
            }
        }, 100);
    }
    preStart() {
        // Listen for activation requests from the UI or other systems.
        this.connectLocalEvent(
            this.entity!,
            requestMBCActivation,
            ({ playerName, packId }) => {
                if (!this.playerHasUnlocked(playerName, packId)) {
                    console.log(
                        `MBCManager: ${playerName} tried to activate pack '${packId}', but they do not own it.`
                    );
                    return;
                }
                // if active performer wants to change pack then broadcast change event
                if (!this.activePack || this.controllingPlayer === "null" || this.controllingPlayer === playerName) {
                    this.activePack = packId;
                    this.controllingPlayer = playerName;
                    this.sendLocalBroadcastEvent(changeActiveMBC, { packId });
                    this.sendLocalBroadcastEvent(activePerformerChanged, { playerName });
                } else {
                    console.log(
                        `MBCManager: Machine already in use by ${this.controllingPlayer}. Request by ${playerName} ignored.`
                    );
                }
            }
        );

        // Listen for relinquish requests.
        this.connectLocalEvent(
            this.entity!,
            relinquishMBC,
            ({ playerName }) => {
                if (this.controllingPlayer === playerName) {
                    console.log(
                        `MBCManager: ${playerName} relinquished the MBC25 control.`
                    );
                    this.activePack = null;
                    this.controllingPlayer = null;
                    this.sendLocalBroadcastEvent(changeActiveMBC, { packId: '' });
                    this.sendLocalBroadcastEvent(activePerformerChanged, { playerName: null });
                }
            }
        );

        // Automatically drop newly unlocked packs when no machine is active.
        this.connectLocalBroadcastEvent(
            dropMBC,
            ({ packId }) => {
                if (!this.activePack) {
                    this.activePack = packId;
                    this.controllingPlayer = null;
                    this.sendLocalBroadcastEvent(changeActiveMBC, { packId });
                    this.sendLocalBroadcastEvent(activePerformerChanged, { playerName: null });
                }
            }
        );

        this.connectCodeBlockEvent(
            this.entity!,
            hz.CodeBlockEvents.OnPlayerEnterAFK,
            this.forfeitControlCountdown,
        );

    }

    start() {
        // No runtime initialization required.
    }
}

hz.Component.register(MBCManager);
