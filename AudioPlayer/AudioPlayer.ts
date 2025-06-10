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

    // listens for entry of objects tagged 'Record' (selected in properties panel)
    preStart() {
        this.connectCodeBlockEvent(
            this.entity,
            hz.CodeBlockEvents.OnEntityEnterTrigger,
            this.onEntityEnter
        );
    }

    // extracts trackId from RecordTag component once it enters the trigger
    private onEntityEnter = (enteredBy: hz.Entity) => {
        console.log(`${enteredBy.name} entered the trigger zone`);
        const recordComponents = enteredBy.getComponents(RecordTag);
        for (const individualComponent of recordComponents) {
            //console.log("print all of component enum:");
            //console.log(serializeComponent(individualComponent));
            //console.log("print trackId: " + individualComponent.props.trackId);

            if (this.songPlaying) {
                const now = this.startTime;
                if (now <= this.nextAllowed) {
                    return;
                } else {
                    const now = Date.now();
                    this.startTime = now;
                    this.playSong(individualComponent.props.trackId);
                    this.connectCodeBlockEvent(
                        this.entity,
                        hz.CodeBlockEvents.OnAudioCompleted,
                        this.sendSongComplete
                    );
                }
            } else {
                const now = Date.now();
                this.startTime = now;
                this.playSong(individualComponent.props.trackId);
                this.connectCodeBlockEvent(
                    this.entity,
                    hz.CodeBlockEvents.OnAudioCompleted,
                    this.sendSongComplete
                );
            }
        }
    };

    private sendSongComplete() {
        this.songPlaying = false;
    }

    // plays song in songMap with corresponding ID
    private playSong(trackId: number) {
        const currentPlayingSong = this.songMap[trackId];
        if ((currentPlayingSong) && !(this.songPlaying)) {
            this.songPlaying = true;
            currentPlayingSong.play();
        } else {
            return;
        }
    }

    // maps songs into songMap
    override start() {
        // requires an entry for each track in library
        this.songMap[1] = this.props.song1!.as(hz.AudioGizmo);
        this.songMap[2] = this.props.song2!.as(hz.AudioGizmo);
        this.songMap[3] = this.props.song3!.as(hz.AudioGizmo);
    }
}

hz.Component.register(AudioPlayer);
