import * as hz from 'horizon/core';
import { trackIdEvent } from './shared-events';

class RecordTag extends hz.Component<typeof RecordTag> {
    static propsDefinition = {
        trackId: { type: hz.PropTypes.Number },
    };
    
    preStart() {
        
    }

    override start() {
        this.sendLocalBroadcastEvent(trackIdEvent, { trackId: this.props.trackId });
    }
}
hz.Component.register(RecordTag);