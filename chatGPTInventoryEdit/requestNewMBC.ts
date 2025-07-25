import { CodeBlockEvents, Component, Player } from 'horizon/core';
import * as hz from 'horizon/core';
import { checkMBCInventory } from './shared-events-MBC25';

/**
 * Component used on a trigger zone to let players request their
 * currently unlocked MBCs.  When a player steps through this trigger
 * the inventory system will be queried and any unlocked machines will
 * drop down into the world.  This is separate from LuckyCheck so
 * builders can have different triggers for different flows.
 */
class requestNewMBC extends Component<typeof requestNewMBC> {
    static propsDefinition = {
        /** Reference to the MBC25Inventory entity. */
        mbcInventoryObject: { type: hz.PropTypes.Entity },
    };

    preStart() {
        // Listen for when a player enters the trigger.  We bind
        // askForMBC() as the handler to ensure the correct `this`
        // context.
        this.connectCodeBlockEvent(
            this.entity,
            CodeBlockEvents.OnPlayerEnterTrigger,
            this.askForMBC.bind(this)
        );
    }

    start() {
        // No additional setup required.
    }

    /**
     * Ask the inventory manager which MBCs the player owns.  The
     * inventory manager will respond by printing the inventory and
     * broadcasting drop events for each owned pack.  Without this
     * event players would have no way to respawn their machines.
     *
     * @param player The player who entered the trigger.
     */
    askForMBC(player: Player) {
        this.sendLocalEvent(
            this.props.mbcInventoryObject!,
            checkMBCInventory,
            { playerId: player }
        );
    }
}
Component.register(requestNewMBC);
