import * as hz from 'horizon/core';
import { stopRowEvent, loopTriggerEvent } from './shared-events';

class StopButtonTrigger extends hz.Component<typeof StopButtonTrigger> {
    static propsDefinition = {
        channelId: { type: hz.PropTypes.Number },
        loop1: { type: hz.PropTypes.Entity },
        loop2: { type: hz.PropTypes.Entity },
        loop3: { type: hz.PropTypes.Entity },
        loop4: { type: hz.PropTypes.Entity },
        loop5: { type: hz.PropTypes.Entity },
    };

    /** Map of trackId ? ready-to-play AudioGizmo */
    private channelLoops: Record<number, hz.AudioGizmo> = {};
    // set true when song plays
    private audioLive: boolean = false;
    // when trigger is allowed to retrigger
    private nextAllowed = 0;
    // 15 s in ms
    private static readonly BUFFER = 15_000;
    private currentPlayingLoopId = 0;

    private playLoop(channelId: number, loopSectionId: number): void {
        console.log(`Channel ID: ${this.props.channelId} payLoop method not implemented yet`)

        if (channelId == this.props.channelId) {
            if (loopSectionId != this.currentPlayingLoopId) {
                this.sendStop // for currently playing loop
                this.channelLoops[loopSectionId].play();
            }
        }

    }

    private sendStop(): void {
        console.log(`Channel ID: ${this.props.channelId} sendStop method not implemented yet`);

        this.channelLoops[this.currentPlayingLoopId].stop({ fade: 3.0 });

    }

    preStart() {
        // listens for loopTriggerEvent from Loop Trigger Buttons
        this.connectLocalBroadcastEvent(loopTriggerEvent, (triggerButton) => {
            this.playLoop(triggerButton.channelId, triggerButton.loopSectionId);
        });

        // listen for player collision
        this.connectCodeBlockEvent(
            this.entity,
            hz.CodeBlockEvents.OnPlayerCollision,
            this.sendStop
        );
    }

    // maps songs into channelLoops
    override start() {
        // requires an entry for each track in library
        this.channelLoops[1] = this.props.loop1!.as(hz.AudioGizmo);
        this.channelLoops[2] = this.props.loop2!.as(hz.AudioGizmo);
        this.channelLoops[3] = this.props.loop3!.as(hz.AudioGizmo);
        this.channelLoops[4] = this.props.loop4!.as(hz.AudioGizmo);
        this.channelLoops[5] = this.props.loop5!.as(hz.AudioGizmo);
    }
}
hz.Component.register(StopButtonTrigger);