import * as hz from 'horizon/core';
import { playSongEvent, } from './shared-events';

class MusicPlayer extends hz.Component<typeof MusicPlayer> {
    static propsDefinition = {
        song1: { type: hz.PropTypes.Entity },
        song2: { type: hz.PropTypes.Entity },
    };

    private songMap: { [key: string]: hz.Entity } = {};

    preStart() {
        this.connectNetworkEvent(this.entity!, playSongEvent, (data: { trackId: string }) => {
            console.log('Received trackIdEvent:', data.trackId);
        });
    }

    start() {
        this.songMap['trackId1'] = this.props.song1!;
        this.songMap['trackId2'] = this.props.song2!;
    }
}

hz.Component.register(MusicPlayer);