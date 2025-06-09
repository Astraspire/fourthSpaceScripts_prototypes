import * as hz from 'horizon/core';
import { RecordTag } from './RecordTag';
import { serializeComponent } from './DebugUtils';

export class AudioPlayer extends hz.Component<typeof AudioPlayer> {
    static propsDefinition = {
        song1: { type: hz.PropTypes.Entity },
        song2: { type: hz.PropTypes.Entity },
    };

    /** Map of trackId ? ready-to-play AudioGizmo */
    private songMap: Record<number, hz.AudioGizmo> = {};

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
            this.playSong(individualComponent.props.trackId);
        }

    };

    // plays song in songMap with corresponding ID
    private playSong(trackId: number) {
        const currentPlayingSong = this.songMap[trackId];
        if (currentPlayingSong) {
            currentPlayingSong.play();
        }
    }

    // maps songs into songMap
    override start() {
        // requires an entry for each track in library
        this.songMap[1] = this.props.song1!.as(hz.AudioGizmo);
        this.songMap[2] = this.props.song2!.as(hz.AudioGizmo);
    }
}

hz.Component.register(AudioPlayer);
