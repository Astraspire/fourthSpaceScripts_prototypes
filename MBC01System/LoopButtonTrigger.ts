import * as hz from 'horizon/core';
import { loopTriggerEvent } from './shared-events';

class LoopButtonTrigger extends hz.Component<typeof LoopButtonTrigger> {
    static propsDefinition = {
        loopSectionId: { type: hz.PropTypes.Number },
        channelId: { type: hz.PropTypes.Number },
        channelStopButton: { type: hz.PropTypes.Entity },
    };

    private startLoopPress = (): void => {
        this.sendLocalBroadcastEvent(loopTriggerEvent, ({
            channelId: this.props.channelId,
            loopSectionId: this.props.loopSectionId
        }));  
    }

    preStart() {
        // listen for player collision
        this.connectCodeBlockEvent(
            this.entity,
            hz.CodeBlockEvents.OnPlayerCollision,
            this.startLoopPress
        );
    }

    start() {
    }
}
hz.Component.register(LoopButtonTrigger);
