import * as hz from 'horizon/core';
import { stopRowEventLucky } from './shared-events-lucky';

class StopButtonTriggerLucky extends hz.Component<typeof StopButtonTriggerLucky> {
    static propsDefinition = {
        channelId: { type: hz.PropTypes.Number },
    };

    private sendStop = (): void => {
        this.sendLocalBroadcastEvent(stopRowEventLucky, ({
            channelId: this.props.channelId
        }));
    }

    preStart() {
        // listen for player collision
        this.connectCodeBlockEvent(
            this.entity,
            hz.CodeBlockEvents.OnPlayerExitTrigger,
            this.sendStop,
        );
    }

    start() {

    }

}
hz.Component.register(StopButtonTriggerLucky);