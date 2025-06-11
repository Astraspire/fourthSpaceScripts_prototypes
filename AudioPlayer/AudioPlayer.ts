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
    private songPlaying: boolean = false;
    // when trigger is allowed to retrigger
    private nextAllowed = 0;
    // 30 s in ms
    private static readonly BUFFER = 30_000;
    private startTime = 0;

    // sends complete track signal when song is done
    private setAudioComplete(): void {
        this.songPlaying = false;
    }

    // plays song in songMap with corresponding ID
    private playSong(trackId: number): void {
        const clip = this.songMap[trackId];
        clip?.play();       // safe-call avoids crashes on bad IDs
    }

    // extracts trackId from RecordTag component once it enters the trigger
    private onEntityEnter = (enteredBy: hz.Entity) => {

        console.log(`${enteredBy.name} entered the trigger zone`);

        const now = Date.now();

        // Ignore anything that arrives too soon
        if (now < this.nextAllowed){
            return;      // still cooling down
        }
        // adds 30s to current time to find when replay is allowed
        this.nextAllowed = now + AudioPlayer.BUFFER;

        // grab the RecordTag(s) on the object and play
        const recordComponents = enteredBy.getComponents(RecordTag);
        for (const comp of recordComponents) {
            this.playSong(comp.props.trackId); // plays song with corresponding tag
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
