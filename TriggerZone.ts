import * as hz from 'horizon/core';
import { playSongEvent, trackIdEvent } from './shared-events';

class TriggerZone extends hz.Component<typeof TriggerZone> {
    static propsDefinition = {
        musicPlayer: { type: hz.PropTypes.Entity },
    };

    private inputTrackId = "";

    preStart() {
        this.connectNetworkEvent(this.entity!, trackIdEvent, (data: { trackId: string }) => {
            console.log('Received trackIdEvent:', data.trackId);
            this.inputTrackId = data.trackId;
        });
    }

    start() {
        if (hz.CodeBlockEvents.OnEntityEnterTrigger) {
            //const trackId = "trackId1"
            this.sendLocalEvent(this.props.musicPlayer!, playSongEvent, { trackId: this.inputTrackId });
        }
    }
}
