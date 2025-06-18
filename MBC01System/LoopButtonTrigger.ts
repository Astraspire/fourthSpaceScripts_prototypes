import * as hz from 'horizon/core';
import { loopTriggerEvent } from './shared-events';
import { serializeComponent } from './DebugUtils';

class LoopButtonTrigger extends hz.Component<typeof LoopButtonTrigger> {
    static propsDefinition = {
        loopSectionId: { type: hz.PropTypes.Number },
        channelId: { type: hz.PropTypes.Number },
    };

    private startLoopPress(): void {
        console.log(`startLoopPress for loop ${this.props.loopSectionId} 
        on channel ${this.props.channelId} not implemented yet`);

        // sends loopTriggerEvent with channelId and loopSectionId as data
        this.sendLocalBroadcastEvent(loopTriggerEvent, {
            channelId: this.props.channelId,
            loopSectionId: this.props.loopSectionId
        })

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