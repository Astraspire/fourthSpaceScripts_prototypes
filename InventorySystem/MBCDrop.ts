import * as hz from 'horizon/core';
import { changeActiveMBC, dropMBC } from "./shared-events-MBC25";

class MBCDrop extends hz.Component<typeof MBCDrop>{
    static propsDefinition = {
        packId: { type: hz.PropTypes.String },
        dropTime: { type: hz.PropTypes.Number, default: 1 },
        requestNewMBCTrigger: { type: hz.PropTypes.Entity },
    };

    /* ───────────── private state ───────────── */
    private initialLocal!: hz.Vec3;              // local position to land on
    private updateSub!: hz.EventSubscription;    // on‑update handle


    /* ───────────── drop tween ───────────── */
    private startDrop() {
        /* later, when you want to show it to everyone online */
        this.entity.setVisibilityForPlayers(
            this.world.getPlayers(),                 // all current players
            hz.PlayerVisibilityMode.VisibleTo           // show only to them
        );
        this.entity.collidable.set(true);            // collider back on


        const startPos = this.entity.position.get();   // local 112
        const endPos = this.initialLocal;            // local 12
        const durationMs = this.props.dropTime! * 1000;
        const startTime = Date.now();

        /* update every frame until finished */
        this.updateSub = this.connectLocalBroadcastEvent(hz.World.onUpdate, () => {
            const t = Math.min((Date.now() - startTime) / durationMs, 1);
            this.entity.position.set(hz.Vec3.lerp(startPos, endPos, t));

            if (t === 1) {                                 // finished
                this.updateSub.disconnect();                 // stop listening
            }
        });
    }


    preStart() {
        // connect local event from inventory to drop correct mbc25 machine
        this.connectLocalBroadcastEvent(
            dropMBC,
            ({ packId }) => {
                if (packId == this.props.packId) {
                    this.startDrop
                }
            }
        )

    }

    start() {
        /* 1. cache editor‑placed local position  */
        this.initialLocal = this.entity.position.get();

        /* 2. raise platform by +100 local units */
        this.entity.position.set(this.initialLocal.add(new hz.Vec3(0, 100, 0)));

        /* 3. hide from everyone while floating */
        this.entity.setVisibilityForPlayers(
            this.world.getPlayers(),                 // array (can be empty)
            hz.PlayerVisibilityMode.HiddenFrom          // mode
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