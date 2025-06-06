import * as hz from 'horizon/core';
import { playSongEvent, trackIdEvent } from './shared-events';

class TriggerZone extends hz.Component<typeof TriggerZone> {
    static propsDefinition = {
        musicPlayer: { type: hz.PropTypes.Entity },
    };

    // !!FIXME!! setter not actively changing incomingTrackId variable !!FIXME!!
    private incomingTrackId: number = 0;

    private setTrackId(trackId: number): void {
        this.incomingTrackId = trackId;
    }

    public getTrackId(): number {
        return this.incomingTrackId;
    }

    preStart() {
        this.connectLocalBroadcastEvent(trackIdEvent, (trackInfo) => {
            console.log('Received trackIdEvent: ' + trackInfo.trackId);
            this.setTrackId(trackInfo.trackId);
        })
    }

    override start() {
        if (hz.CodeBlockEvents.OnEntityEnterTrigger) {
            this.sendNetworkEvent(this.props.musicPlayer!, playSongEvent, { trackId: this.incomingTrackId});
        }
    }
}

hz.Component.register(TriggerZone);