import * as hz from 'horizon/core';
import { loopTriggerEvent } from './shared-events';

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
    private channelLive: boolean = false;
    // when trigger is allowed to retrigger
    private nextAllowed = 0;
    // 15 s in ms
    private static readonly BUFFER = 15_000;
    private currentPlayingLoopId: number = 0;
    private numOfLoops: number = 0;

    private playLoop(channelId: number, loopSectionId: number): void {
        console.log(`Channel playLoop method not implemented yet`);

        // checks for live sample on channel already
        if (this.channelLive) {
            // checks to see if trigger is for the selected channel
            if (channelId == this.props.channelId) {
                // checks to see if new loop on same channel
                if (loopSectionId != this.currentPlayingLoopId) {
                    // stops currently playing loop
                    this.sendStop();
                    // play triggered loop
                    this.channelLoops[loopSectionId]?.play();
                    // sets current loop playing to incoming loopSectionId
                    this.currentPlayingLoopId = loopSectionId;
                } else {
                    return; // no new loop triggered
                }
            } else {
                return; // skips if irrelevant sample
            }
        } else { // if no sample is live on this current channel

            // sets current loop playing to incoming loopSectionId
            this.currentPlayingLoopId = loopSectionId;

            // play triggered loop
            this.channelLoops[loopSectionId]?.play(); 

            // sets channel as playing
            this.channelLive = true;
        }        
    }

    private sendStop = (): void => {
        console.log(`Channel sendStop method not implemented yet`);

        // sets loop to stop based on parameter input
        var id = this.currentPlayingLoopId;

        // stops loop over 3.0 second fade
        this.channelLoops[id]?.stop({ fade: 3.0 }); 
    }

    preStart() {
        // listens for loopTriggerEvent from Loop Trigger Buttons
        this.connectLocalBroadcastEvent(loopTriggerEvent, (loopData) => {
            this.playLoop(loopData.channelId, loopData.loopSectionId);
        });

        // listen for player collision
        this.connectCodeBlockEvent(
            this.entity,
            hz.CodeBlockEvents.OnPlayerCollision,
            this.sendStop,
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