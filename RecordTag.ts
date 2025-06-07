import * as hz from 'horizon/core';
import { trackIdEvent } from './shared-events';

class RecordTag extends hz.Component<typeof RecordTag> {
    static propsDefinition = {
        trackId: { type: hz.PropTypes.Number },
    };
    
    preStart() {
    }

    start() {
        this.connectCodeBlockEvent(
            this.entity,
            hz.CodeBlockEvents.OnEntityEnterTrigger,
            (entity: hz.Entity) => {
                this.sendLocalBroadcastEvent(trackIdEvent, { trackId: this.props.trackId });
            }
        );
    }
}
hz.Component.register(RecordTag);