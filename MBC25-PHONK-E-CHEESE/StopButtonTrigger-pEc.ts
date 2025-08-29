import * as hz from 'horizon/core';
import { stopRowEventpEc } from './shared-events-pEc';

class StopButtonTriggerpEc extends hz.Component<typeof StopButtonTriggerpEc> {
    static propsDefinition = {
        channelId: { type: hz.PropTypes.Number },
    };

    private sendStop = (): void => {
        this.sendLocalBroadcastEvent(stopRowEventpEc, ({
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
hz.Component.register(StopButtonTriggerpEc);