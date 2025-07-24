import { CodeBlockEvents, Component,  Player } from 'horizon/core';
import * as hz from 'horizon/core';
import { checkMBCInventory } from './shared-events-MBC25';

class requestNewMBC extends Component<typeof requestNewMBC>{
    static propsDefinition = {
        mbcInventoryObject: { type: hz.PropTypes.Entity },
    };

    preStart() {
        this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerEnterTrigger, this.askForMBC.bind(this));
    }

    start() {

    }

    askForMBC(player: Player) {

        this.sendLocalEvent(
            this.props.mbcInventoryObject!,
            checkMBCInventory,
            { playerId: player }
        );
    }
}
Component.register(requestNewMBC);