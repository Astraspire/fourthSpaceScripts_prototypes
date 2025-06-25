import * as hz from 'horizon/core';
import { stopRowEvent } from './shared-events';

class StopButtonTrigger extends hz.Component<typeof StopButtonTrigger> {
    static propsDefinition = {
        channelId: { type: hz.PropTypes.Number },
    };

    private sendStop = (): void => {
        this.sendLocalBroadcastEvent(stopRowEvent, ({
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
hz.Component.register(StopButtonTrigger);