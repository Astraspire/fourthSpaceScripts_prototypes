import * as hz from 'horizon/core';
import { RecordTag } from './RecordTag';
import { serializeComponent } from './DebugUtils';

export class AudioPlayer extends hz.Component<typeof AudioPlayer> {

    static propsDefinition = {
        song1: { type: hz.PropTypes.Entity },
        song2: { type: hz.PropTypes.Entity },
        song3: { type: hz.PropTypes.Entity },
    };

    /** Map of trackId ? ready-to-play AudioGizmo */
    private songMap: Record<number, hz.AudioGizmo> = {};
    // set true when song plays
    private audioLive: boolean = false;
    // when trigger is allowed to retrigger
    private nextAllowed = 0;
    // 30 s in ms
    private static readonly BUFFER = 30_000;
    private currentPlayingTrackId = 0;

    // Overload signatures for setAudioComplete
    private setAudioComplete(): void;                     // no-arg version
    private setAudioComplete(trackId: number): void;      // track-specific version

    // Single implementation for Audio completion / stopping
    private setAudioComplete(trackId?: number): void {
        // always mark the audio system as no longer live
        this.audioLive = false;

        // only stop a particular clip if a trackId was supplied
        if (trackId !== undefined) {
            const clip = this.songMap[trackId];
            clip.stop({ fade: 3.0 }); // fades out audio over 3 seconds
        }
    }

    // plays song in songMap with corresponding ID
    private playSong(trackId: number): void {
        const clip = this.songMap[trackId];
        clip?.play();       // safe-call avoids crashes on bad IDs
        this.audioLive = true;
    }

    // extracts trackId from RecordTag component once it enters the trigger
    private onEntityEnter = (enteredBy: hz.Entity) => {

        console.log(`${enteredBy.name} entered the trigger zone`);

        const now = Date.now();

        // Ignore anything that arrives too soon
        if (now < this.nextAllowed) {
            return;      // still cooling down
        }
        // adds 30s to current time to find when replay is allowed
        this.nextAllowed = now + AudioPlayer.BUFFER;

        // grab the RecordTag(s) on the object and play (and reset currentPlayingTrackId to new song when changed)
        const recordComponents = enteredBy.getComponents(RecordTag);
        for (const comp of recordComponents) {
            // checks for new song
            if ((this.currentPlayingTrackId != comp.props.trackId) && (this.audioLive)) {
                this.setAudioComplete(this.currentPlayingTrackId); // stop and fade-out currently playing song
                this.playSong(comp.props.trackId); // plays song with corresponding tag
                this.currentPlayingTrackId = comp.props.trackId; // set currentPlayingTrackId
                console.log(`Now playing song # ${this.currentPlayingTrackId}`);
            // checks for no audio
            } else if (!(this.audioLive)) {
                this.playSong(comp.props.trackId); // plays song with corresponding tag
                this.currentPlayingTrackId = comp.props.trackId; // set currentPlayingTrackId
                console.log(`Now playing song # ${this.currentPlayingTrackId}`);
            // checks for redundant play
            } else {
                return; // do nothing
            }
        }
    }

    // listens for entry of objects tagged 'Record' (selected in properties panel)
    preStart() {
        // listen for records
        this.connectCodeBlockEvent(
            this.entity,
            hz.CodeBlockEvents.OnEntityEnterTrigger,
            this.onEntityEnter
        );

        // listen once for the clip finishing
        this.connectCodeBlockEvent(
            this.entity,
            hz.CodeBlockEvents.OnAudioCompleted,
            this.setAudioComplete
        );
    }

    // maps songs into songMap
    override start() {
        // requires an entry for each track in library
        this.songMap[1] = this.props.song1!.as(hz.AudioGizmo);
        this.songMap[2] = this.props.song2!.as(hz.AudioGizmo);
        this.songMap[3] = this.props.song3!.as(hz.AudioGizmo);
    }
};

hz.Component.register(AudioPlayer);
