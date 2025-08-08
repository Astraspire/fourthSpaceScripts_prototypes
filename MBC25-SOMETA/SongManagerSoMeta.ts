import * as hz from 'horizon/core';
import { loopTriggerEventSoMeta, offlineColorChangeEventSoMeta, hardOfflineColorChangeEventSoMeta, playingColorChangeEventSoMeta, stopRowEventSoMeta, upcomingLoopColorChangedEventSoMeta, machinePlayState } from './shared-events-soMeta';

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
    private activeLoops: Record<number,
        {
            channelId: number;
            loopSectionId: number;
            gizmo: hz.AudioGizmo
        }
    > = {};
    private loopDurationSec!: number;
    private playing: boolean = false;

    private removeLoop = (channelId: number) => {
        console.log(`Channel ${channelId} triggered to stop.`)

        // marks oldLoop
        const oldLoop = this.activeLoops[channelId];

        // if none, do nothing
        if (!oldLoop) return;

        delete this.activeLoops[channelId];
        this.updatePlayState();
    }

    // stops entire channel, checks for playing loop  --> any older playing loops set to default color
    private stopChannel = (channelId: number) => {
        console.log(`Channel ${channelId} triggered to stop.`)

        // marks oldLoop
        const oldLoop = this.activeLoops[channelId];

        // if no current loop on channel, do nothing
        if (!oldLoop) return;

        // stops and fades out currently playing loop on channel
        oldLoop.gizmo.stop({ fade: this.fadeTime });

        // send LocalEvent to hard set color of entire channel back to default
        this.sendLocalBroadcastEvent(hardOfflineColorChangeEventSoMeta, {
            channel: channelId,
            loopId: oldLoop.loopSectionId
        });

        // removes loop from active loops
        delete this.activeLoops[channelId];
        this.updatePlayState();
    }

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

        // Listen for loopTriggerEventSoMeta
        this.connectLocalBroadcastEvent(
            loopTriggerEventSoMeta, (loopData) => {
                console.log(`Channel: ${loopData.channelId}, Loop: ${loopData.loopSectionId} triggered to start.`);

                const incomingChannelId = loopData.channelId;
                const incomingLoopId = loopData.loopSectionId;
                // Store previous active loop on that incoming triggered channel
                const oldLoop = this.activeLoops[incomingChannelId];

                if (oldLoop != undefined) {
                    // if old loop is the same as new loop, do nothing
                    if ((oldLoop.loopSectionId === incomingLoopId)) {
                        return;
                    }

                    // if there is an upcoming loop on the channel already blue 
                    // (but not active - checked in LoopButtonTrigger script)
                    // then, turn to offline / idle
                    if (oldLoop.channelId === incomingChannelId) {
                        this.sendLocalBroadcastEvent(offlineColorChangeEventSoMeta, {
                            channel: loopData.channelId,
                            loopId: oldLoop.loopSectionId,
                        });

                        // removes from activeLoops
                        this.removeLoop(loopData.channelId);
                    }

                }                

                // sets new upcoming loop to upcoming playing color
                this.sendLocalBroadcastEvent(upcomingLoopColorChangedEventSoMeta, {
                    channel: loopData.channelId,
                    loopId: loopData.loopSectionId
                });

                // assigns new loop for playback
                const newAudio = this.channelLoops[loopData.channelId - 1][loopData.loopSectionId - 1];

                // Track it in our active playing map
                this.activeLoops[loopData.channelId] = {
                    channelId: loopData.channelId,
                    loopSectionId: loopData.loopSectionId,
                    gizmo: newAudio
                };

                this.updatePlayState();

            }
        );

        // Listen for stopRowEventSoMeta / stops channel
        this.connectLocalBroadcastEvent(
            stopRowEventSoMeta, (channelData) => {
                this.stopChannel(channelData.channelId);
            }
        );
    }

    private updatePlayState() {
        const isPlaying = Object.keys(this.activeLoops).length > 0;
        if (isPlaying !== this.playing) {
            this.playing = isPlaying;
            this.sendLocalBroadcastEvent(machinePlayState, { isPlaying });
        }
    }

    override start() {

        const interval = (this.loopDurationSec) * 1000; // converts to ms

        // Every interval ms, replay every active loop so they stay in lock-step
        this.async.setInterval(() => {

            // turns all loops Offline color and status
            this.channelLoops.forEach((loops, channelIdx) => {
                loops.forEach((gizmo, loopIdx) => {
                    this.sendLocalBroadcastEvent(hardOfflineColorChangeEventSoMeta, {
                        channel: channelIdx + 1,
                        loopId: loopIdx + 1,
                    });
                });
            });

            // changes all selected loops to Playing color and status
            // and triggers corresponding audio
            Object.values(this.activeLoops).forEach(({ channelId, loopSectionId, gizmo }) => {
                this.sendLocalBroadcastEvent(playingColorChangeEventSoMeta, {
                    channel: channelId,
                    loopId: loopSectionId,
                });
                gizmo.play();
            });
        }, interval);
    }
}
hz.Component.register(SongManager);
