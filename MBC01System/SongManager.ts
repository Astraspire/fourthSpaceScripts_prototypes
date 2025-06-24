import * as hz from 'horizon/core';
import { loopTriggerEvent, stopRowEvent } from './shared-events';

class SongManager extends hz.Component<typeof SongManager> {
    static propsDefinition = {
        chan1Loop1: { type: hz.PropTypes.Entity },
        chan1Loop2: { type: hz.PropTypes.Entity },
        chan1Loop3: { type: hz.PropTypes.Entity },
        chan1Loop4: { type: hz.PropTypes.Entity },
        chan1Loop5: { type: hz.PropTypes.Entity },
        chan2Loop1: { type: hz.PropTypes.Entity },
        chan2Loop2: { type: hz.PropTypes.Entity },
        chan2Loop3: { type: hz.PropTypes.Entity },
        chan2Loop4: { type: hz.PropTypes.Entity },
        chan2Loop5: { type: hz.PropTypes.Entity },
        chan3Loop1: { type: hz.PropTypes.Entity },
        chan3Loop2: { type: hz.PropTypes.Entity },
        chan3Loop3: { type: hz.PropTypes.Entity },
        chan3Loop4: { type: hz.PropTypes.Entity },
        chan3Loop5: { type: hz.PropTypes.Entity },
        chan4Loop1: { type: hz.PropTypes.Entity },
        chan4Loop2: { type: hz.PropTypes.Entity },
        chan4Loop3: { type: hz.PropTypes.Entity },
        chan4Loop4: { type: hz.PropTypes.Entity },
        chan4Loop5: { type: hz.PropTypes.Entity },
        chan5Loop1: { type: hz.PropTypes.Entity },
        chan5Loop2: { type: hz.PropTypes.Entity },
        chan5Loop3: { type: hz.PropTypes.Entity },
        chan5Loop4: { type: hz.PropTypes.Entity },
        chan5Loop5: { type: hz.PropTypes.Entity },
        customFadeTime: { type: hz.PropTypes.Number },
        customBPM: { type: hz.PropTypes.Number },
        beatsPerLoop: { type: hz.PropTypes.Number },

    };

    private fadeTime!: number;
    private songBPM!: number;
    private beatsPerLoop!: number;
    private channelLoops!: hz.AudioGizmo[][];
    private activeLoops: Record<number, hz.AudioGizmo> = {};
    private loopDurationSec!: number;


    override preStart() {
        // maps all audio gizmos to the channel grid
        this.channelLoops = [
            [this.props.chan1Loop1!.as(hz.AudioGizmo), this.props.chan1Loop2!.as(hz.AudioGizmo), this.props.chan1Loop3!.as(hz.AudioGizmo), this.props.chan1Loop4!.as(hz.AudioGizmo), this.props.chan1Loop5!.as(hz.AudioGizmo)],
            [this.props.chan2Loop1!.as(hz.AudioGizmo), this.props.chan2Loop2!.as(hz.AudioGizmo), this.props.chan2Loop3!.as(hz.AudioGizmo), this.props.chan2Loop4!.as(hz.AudioGizmo), this.props.chan2Loop5!.as(hz.AudioGizmo)],
            [this.props.chan3Loop1!.as(hz.AudioGizmo), this.props.chan3Loop2!.as(hz.AudioGizmo), this.props.chan3Loop3!.as(hz.AudioGizmo), this.props.chan3Loop4!.as(hz.AudioGizmo), this.props.chan3Loop5!.as(hz.AudioGizmo)],
            [this.props.chan4Loop1!.as(hz.AudioGizmo), this.props.chan4Loop2!.as(hz.AudioGizmo), this.props.chan4Loop3!.as(hz.AudioGizmo), this.props.chan4Loop4!.as(hz.AudioGizmo), this.props.chan4Loop5!.as(hz.AudioGizmo)],
            [this.props.chan5Loop1!.as(hz.AudioGizmo), this.props.chan5Loop2!.as(hz.AudioGizmo), this.props.chan5Loop3!.as(hz.AudioGizmo), this.props.chan5Loop4!.as(hz.AudioGizmo), this.props.chan5Loop5!.as(hz.AudioGizmo)],
        ];

        // cross-fade time in seconds
        this.fadeTime = this.props.customFadeTime!;

        // Defines song BPM for script
        this.songBPM = this.props.customBPM!;

        // Defines beatsPerLoop for script
        this.beatsPerLoop = this.props.beatsPerLoop!;

        // decides loop duration based on properties set - forced loop duration to floating number to prevent rounding errors in the future (due to trunctation)
        this.loopDurationSec = (60.0 / this.songBPM) * this.beatsPerLoop;

        // Listen for loopTriggerEvent
        this.connectLocalBroadcastEvent(
            loopTriggerEvent, (loopData) => {
                console.log(`Channel: ${loopData.channelId}, Loop: ${loopData.loopSectionId} triggered to start.`);
               
                // Stop any old loop on that channel
                const oldLoop = this.activeLoops[loopData.channelId];
                if (oldLoop) {
                    this.removeLoop(loopData.channelId);
                }

                // assigns for playback
                const newAudio = this.channelLoops[loopData.channelId - 1][loopData.loopSectionId - 1];

                // Track it in our active playing map
                this.activeLoops[loopData.channelId] = newAudio;
            }
        );

        // Listen for stopRowEvent / stops channel
        this.connectLocalBroadcastEvent(
            stopRowEvent, (channelData) => {
                this.stopChannel(channelData.channelId);

            }
        );
    }

    override start() {

        const interval = (this.loopDurationSec) * 1000; // converts to ms

        // Every interval ms, replay every active loop so they stay in lock-step
        this.async.setInterval(() => {
            for (const loopGizmo of Object.values(this.activeLoops)) {
                loopGizmo.play();
            }
        }, interval);
    }

    private removeLoop = (channelId: number) => {
        console.log(`Channel ${channelId} triggered to stop.`)

        // stops and removes channel from activeLoops list
        const oldLoop = this.activeLoops[channelId];
        if (oldLoop) {
 
            delete this.activeLoops[channelId];
        }
    }

    private stopChannel = (channelId: number) => {
        console.log(`Channel ${channelId} triggered to stop.`)

        // stops and removes channel from activeLoops list
        const oldLoop = this.activeLoops[channelId];
        if (oldLoop) {
            // removes loop from active loops
            delete this.activeLoops[channelId];

            // stops and fades out playing loop on channel
            oldLoop.stop({ fade: this.fadeTime });
        }
    }
}
hz.Component.register(SongManager);