import { CodeBlockEvents, Component,  Player } from 'horizon/core';
import * as hz from 'horizon/core';
import { checkMBCInventory } from './shared-events-MBC25';

class requestNewMBC extends Component<typeof requestNewMBC>{
    static propsDefinition = {
        mbcInventoryObject: { type: hz.PropTypes.Entity },
    };

    preStart() {
        this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerEnterTrigger, this.OnPlayerEnterTrigger.bind(this));
    }

    start() {

    }

    OnPlayerEnterTrigger(player: Player) {
        // Add code here that you want to run when a player enters the trigger.
        // For more details and examples go to:
        // https://developers.meta.com/horizon-worlds/learn/documentation/code-blocks-and-gizmos/use-the-trigger-zone
        console.log(`Player ${player.name.get()} entered trigger.`);
        this.sendLocalEvent(
            this.props.mbcInventoryObject!,
            checkMBCInventory,
            { playerName: player }
        );
    }


}
Component.register(requestNewMBC);