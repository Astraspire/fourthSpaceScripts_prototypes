import * as hz from 'horizon/core';
import { playSongEvent, } from './shared-events';


type TrackId = number;
class MusicPlayer extends hz.Component<typeof MusicPlayer> {
    static propsDefinition = {
        recordTrigger: { type: hz.PropTypes.Entity},
        song1: { type: hz.PropTypes.Entity },
        song2: { type: hz.PropTypes.Entity },
    };

    /** Map of trackId ? ready-to-play AudioGizmo */
    private songMap: Record<TrackId, hz.AudioGizmo> = {};

    playSong(trackId: TrackId) {
        const currentPlayingSong = this.songMap[trackId];
        if (currentPlayingSong!) {
            currentPlayingSong.play();
        }

    }

    preStart() {
        this.connectLocalEvent(
            this.props.recordTrigger!,
            playSongEvent,
            (incomingTrackInfo) => {
                console.log('Received playSongEvent song: ', incomingTrackInfo.trackId);
                this.playSong(incomingTrackInfo.trackId);
            }
        );
    }

    start() {
        this.songMap[1] = this.props.song1!.as(hz.AudioGizmo);
        this.songMap[2] = this.props.song2!.as(hz.AudioGizmo);
    }
}

hz.Component.register(MusicPlayer);