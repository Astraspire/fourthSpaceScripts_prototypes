import * as hz from 'horizon/core';
import { loopTriggerEvent } from './shared-events';

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
    };

    // number of channels on MBC-25 controller
    private static readonly NUM_CHANNELS: number = 5;
    // cross-fade time in seconds
    private static readonly FADE_TIME = 2.0;

    // Defines song BPM for script
    private static readonly SONG_BPM = 120
    // Defines beatsPerLoop for script
    private static readonly BEATS_PER_LOOP = 32;

    // Map of channels
    private channelLoops: hz.AudioGizmo[][] = [];

    // map of currently playing loops
    private currentLoopIndex!: number[][];

    // sets incoming loop index number
    private queuedLoopIndex!: number[][];

    private currentLoopId: number = -1;

    // decides loop duration based on properties set
    private loopDurationSec = (60 / SongManager.SONG_BPM) * SongManager.BEATS_PER_LOOP; 

    private onGlobalLoopCycle = (incomingChannelId: number, incomingLoopId: number): void => {

        // If there is no currentLoopId, this sets it to the incoming
        console.log(`Received trigger event from channel:${incomingChannelId}, loop: ${incomingLoopId}.`)

        if (this.currentLoopId == -1)  {
            this.currentLoopId = incomingLoopId;
        }

        // checks for valid incoming channel and if loop exists and if incoming loop is not currently playing
        if ((0 <= incomingChannelId) && (incomingChannelId < 6)
            && (this.currentLoopId !== incomingLoopId)) {
            if (this.currentLoopId != null) {
                // declares old loop to stop later
                const oldLoop = this.currentLoopIndex[incomingChannelId][this.currentLoopId];

                // queues a new loop state for the channel
                const newLoop = this.queuedLoopIndex[incomingChannelId][incomingLoopId];

                // assigns for playback
                const newAudio = this.channelLoops[incomingChannelId][incomingLoopId];

                // Start the new loop on the downbeat if loop exists
                newAudio?.play();

                // An old loop was playing, stop it with a fade-out
                const oldAudio = this.channelLoops[incomingChannelId][oldLoop];
                oldAudio?.stop({ fade: SongManager.FADE_TIME });

                // update current playing loopId state
                this.currentLoopId = incomingLoopId;

            } else {
                // queues a new loop state for the channel
                const newLoop = this.queuedLoopIndex[incomingChannelId][incomingLoopId];

                // assigns for playback
                const newAudio = this.channelLoops[incomingChannelId][incomingLoopId];

                // Start the new loop on the downbeat if loop exists
                newAudio?.play();

                // update current playing loopId state
                this.currentLoopId = incomingLoopId;

            }
        } else if (incomingLoopId != null) {

            // queues a new loop state for the channel
            const newLoop = this.queuedLoopIndex[incomingChannelId][incomingLoopId];

            // casts audio gizmo and assigns for playback
            const newAudio = this.channelLoops[incomingChannelId][incomingLoopId];

            newAudio?.play();

            // update current playing loopId state
            this.currentLoopId = incomingLoopId;

        } else {
            return; // skip, invalid selection
        }
    }

    preStart() {
        this.currentLoopIndex = Array.from({ length: 5 }, () => new Array(5).fill(0));
        this.queuedLoopIndex = Array.from({ length: 5 }, () => new Array(5).fill(0));

        // maps all audio gizmos to the channel grid
        this.channelLoops = [
            [this.props.chan1Loop1!.as(hz.AudioGizmo), this.props.chan1Loop2!.as(hz.AudioGizmo), this.props.chan1Loop3!.as(hz.AudioGizmo), this.props.chan1Loop4!.as(hz.AudioGizmo), this.props.chan1Loop5!.as(hz.AudioGizmo)],
            [this.props.chan2Loop1!.as(hz.AudioGizmo), this.props.chan2Loop2!.as(hz.AudioGizmo), this.props.chan2Loop3!.as(hz.AudioGizmo), this.props.chan2Loop4!.as(hz.AudioGizmo), this.props.chan2Loop5!.as(hz.AudioGizmo)],
            [this.props.chan3Loop1!.as(hz.AudioGizmo), this.props.chan3Loop2!.as(hz.AudioGizmo), this.props.chan3Loop3!.as(hz.AudioGizmo), this.props.chan3Loop4!.as(hz.AudioGizmo), this.props.chan3Loop5!.as(hz.AudioGizmo)],
            [this.props.chan4Loop1!.as(hz.AudioGizmo), this.props.chan3Loop2!.as(hz.AudioGizmo), this.props.chan4Loop3!.as(hz.AudioGizmo), this.props.chan4Loop4!.as(hz.AudioGizmo), this.props.chan4Loop5!.as(hz.AudioGizmo)],
            [this.props.chan5Loop1!.as(hz.AudioGizmo), this.props.chan3Loop2!.as(hz.AudioGizmo), this.props.chan5Loop3!.as(hz.AudioGizmo), this.props.chan5Loop4!.as(hz.AudioGizmo), this.props.chan5Loop5!.as(hz.AudioGizmo)],
        ];

        // listens for loopTriggerEvent from Loop Trigger Buttons
        this.connectLocalBroadcastEvent(loopTriggerEvent, (loopData) => {
            this.onGlobalLoopCycle(loopData.channelId, loopData.loopSectionId);
        });

    }

    start() {
        //this.async.setInterval(() => {
        //this.onGlobalLoopCycle(); // custom method to handle the cycle event
        //}, this.loopDurationSec * 1000);

    }
}
hz.Component.register(SongManager);