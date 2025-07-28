import * as hz from 'horizon/core';
import { changeActiveMBC, dropMBC } from './shared-events-MBC25';

/**
 * MBCDrop controls the visibility and drop animation for a single
 * MBC25 beat machine.  When an MBC machine is not the currently
 * active pack it is hidden off‑screen.  When it becomes active the
 * machine animates from a raised position down to its editor‑set
 * location.  This component listens for both dropMBC and
 * changeActiveMBC events and uses a helper to determine whether to
 * show or hide itself based on the incoming pack identifier.
 */
class MBCDrop extends hz.Component<typeof MBCDrop> {
    static propsDefinition = {
        /** Unique identifier for this machine's sound pack. */
        packId: { type: hz.PropTypes.String },
        /** Duration of the drop animation, in seconds. */
        dropTime: { type: hz.PropTypes.Number, default: 1 },
        /** Not used in this implementation but kept for compatibility. */
        requestNewMBCTrigger: { type: hz.PropTypes.Entity },
    };

    /** The initial local position where the machine should land. */
    private initialLocal!: hz.Vec3;
    /** Subscription handle for the drop tween update loop. */
    private updateSub!: hz.EventSubscription;

    /**
     * Animate the machine from its current raised position down to its
     * initial position.  The machine becomes visible and collidable,
     * and moves smoothly over the configured dropTime.
     */
    private startDrop() {
        console.log(`drop started.`)

        this.entity.setVisibilityForPlayers(
            this.world.getPlayers(),
            hz.PlayerVisibilityMode.VisibleTo
        );
        this.entity.collidable.set(true);

        const startPos = this.entity.position.get();
        const endPos = this.initialLocal;
        const durationMs = (this.props.dropTime ?? 1) * 1000;
        const startTime = Date.now();

        this.updateSub = this.connectLocalBroadcastEvent(hz.World.onUpdate, () => {
            const t = Math.min((Date.now() - startTime) / durationMs, 1);
            this.entity.position.set(hz.Vec3.lerp(startPos, endPos, t));
            if (t === 1) {
                this.updateSub.disconnect();
            }
        });
    }

    /**
     * Decide whether to show or hide this machine based on the active
     * pack identifier.  When packId matches this machine's pack, the
     * drop animation is triggered.  Otherwise the machine is moved
     * off‑screen and hidden.
     *
     * @param packId The pack identifier to compare against this.props.packId.
     */
    private handleActivation(packId: string) {
        if (packId === this.props.packId) {
            this.startDrop();
        } else {
            const offPos = this.initialLocal.add(new hz.Vec3(0, 100, 0));
            this.entity.position.set(offPos);
            this.entity.setVisibilityForPlayers(
                this.world.getPlayers(),
                hz.PlayerVisibilityMode.HiddenFrom
            );
            this.entity.collidable.set(false);
        }
    }

    preStart() {
        // Listen for drop events triggered when packs are unlocked.
        this.connectLocalBroadcastEvent(dropMBC, ({ packId }) => {
            this.handleActivation(packId);
        });
        // Listen for active change events from the MBCManager.
        this.connectLocalBroadcastEvent(changeActiveMBC, ({ packId }) => {
            this.handleActivation(packId);
        });
    }

    start() {
        // Cache the editor‑placed position and start hidden.
        this.initialLocal = this.entity.position.get();
        this.entity.position.set(this.initialLocal.add(new hz.Vec3(0, 100, 0)));
        this.entity.setVisibilityForPlayers(
            this.world.getPlayers(),
            hz.PlayerVisibilityMode.HiddenFrom
        );
        this.entity.collidable.set(false);
    }
}

hz.Component.register(MBCDrop);
