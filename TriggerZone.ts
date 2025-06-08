import * as hz from 'horizon/core';
import { playSongEvent, trackIdEvent } from './shared-events';

export class TriggerZone extends hz.Component<typeof TriggerZone> {
    static propsDefinition = {
        musicPlayer: { type: hz.PropTypes.Entity },
    };

    preStart() {
    }

    private onEntityEnter = (enteredBy: hz.Entity) => {
        console.log(`${enteredBy.name} entered the trigger zone`);

        const record = enteredBy.getComponents();

        for (const recordData of record) {
            this.onTrackIdReceived(recordData.props.trackId)
        }

    };

    private onTrackIdReceived = (data: { trackId: number; }) => {
        console.log(`trackIdEvent received: songId = ${data.trackId}`);
        if (this.props.musicPlayer) {
            this.sendLocalEvent(
                this.props.musicPlayer,
                playSongEvent,
                { trackId: data.trackId }
            );
        }
    };

    override start() {
        this.connectCodeBlockEvent(
            this.entity,
            hz.CodeBlockEvents.OnEntityEnterTrigger,
            this.onEntityEnter
        );
    }
}


hz.Component.register(TriggerZone);



