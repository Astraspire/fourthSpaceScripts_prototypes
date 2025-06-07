import * as hz from 'horizon/core';
import { playSongEvent, trackIdEvent } from './shared-events';

class TriggerZone extends hz.Component<typeof TriggerZone> {
    static propsDefinition = {
        musicPlayer: { type: hz.PropTypes.Entity },
    };

    preStart() {
        this.connectCodeBlockEvent(
            this.entity,
            hz.CodeBlockEvents.OnEntityEnterTrigger,
            (record: hz.Entity) => {
                this.connectLocalBroadcastEvent(trackIdEvent, (data) => {
                    console.log('Received trackIdEvent: ' + data.trackId);
                    if (this.props.musicPlayer!) {
                        this.sendLocalEvent(
                            this.props.musicPlayer!,
                            playSongEvent,
                            { trackId: data.trackId }
                        );
                    }
                })
            }
        )
    };

    start() {
    }
}

hz.Component.register(TriggerZone);