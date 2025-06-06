import * as hz from 'horizon/core';
import { trackIdEvent } from './shared-events';

class RecordTag extends hz.Component<typeof RecordTag> {
    static propsDefinition = {
        trackId: { type: hz.PropTypes.String },
    };
    
    preStart() {
        this.sendNetworkEvent(this.entity!, trackIdEvent, { trackId: this.props.trackId });
    }

    start() {
    }
}
hz.Component.register(RecordTag);