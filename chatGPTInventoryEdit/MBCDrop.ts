import * as hz from 'horizon/core';
import { changeActiveMBC, dropMBC } from "./shared-events-MBC25";

class MBCDrop extends hz.Component<typeof MBCDrop> {
    static propsDefinition = {
        packId: { type: hz.PropTypes.String },
        dropTime: { type: hz.PropTypes.Number, default: 1 },
        requestNewMBCTrigger: { type: hz.PropTypes.Entity },
    };

    /* ───────────── private state ───────────── */
    /**
     * Cached editor‑placed local position to land on.  We save this
     * when the component starts so we can raise the platform
     * off‑screen and animate it back into place later.
     */
    private initialLocal!: hz.Vec3;
    /** Handle to the update subscription used during the drop tween. */
    private updateSub!: hz.EventSubscription;

    /* ───────────── drop tween ───────────── */
    /**
     * Animate this machine from its raised starting position back to
     * its original local position.  When called, the machine becomes
     * visible and collidable to all players, and a simple lerp moves
     * it over {@link dropTime} seconds.
     */
    private startDrop() {
        // Make the machine visible and collidable again.
        this.entity.setVisibilityForPlayers(
            this.world.getPlayers(),
            hz.PlayerVisibilityMode.VisibleTo
        );
        this.entity.collidable.set(true);

        const startPos = this.entity.position.get();
        const endPos = this.initialLocal;
        const durationMs = this.props.dropTime! * 1000;
        const startTime = Date.now();

        // Update every frame until finished.
        this.updateSub = this.connectLocalBroadcastEvent(hz.World.onUpdate, () => {
            const t = Math.min((Date.now() - startTime) / durationMs, 1);
            this.entity.position.set(hz.Vec3.lerp(startPos, endPos, t));
            if (t === 1) {
                this.updateSub.disconnect();
            }
        });
    }

    preStart() {
        // connect local event from inventory to drop correct mbc25 machine
        this.connectLocalBroadcastEvent(
            dropMBC,
            ({ packId }) => {
                // When a dropMBC event is received, check if it
                // corresponds to this specific machine.  If it does,
                // call startDrop() to animate the machine into view.
                if (packId == this.props.packId) {
                    this.startDrop();
                }
            }
        );
    }

    start() {
        /* 1. cache editor‑placed local position  */
        this.initialLocal = this.entity.position.get();

        /* 2. raise platform by +100 local units */
        this.entity.position.set(this.initialLocal.add(new hz.Vec3(0, 100, 0)));

        /* 3. hide from everyone while floating */
        this.entity.setVisibilityForPlayers(
            this.world.getPlayers(),
            hz.PlayerVisibilityMode.HiddenFrom
        );
        this.entity.collidable.set(false);

        /* 4. listen for the unlock event */
        this.connectLocalEvent(
            this.entity,
            changeActiveMBC,
            (swapData) => {
                if (swapData.packId === this.props.packId) this.startDrop();
            });
    }
}
hz.Component.register(MBCDrop);
