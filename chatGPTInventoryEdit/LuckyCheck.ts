import * as hz from 'horizon/core';
import { CodeBlockEvents, Component, Entity, Player } from 'horizon/core';
import { checkMBCInventory } from "./shared-events-MBC25";

/**
 * Component used on a trigger zone to check a player's MBC
 * inventory when they enter.  When the player steps into the zone,
 * we send a {@link checkMBCInventory} event to the inventory manager
 * so it can respond by printing the player's inventory and
 * broadcasting any necessary drop events.  Without this component
 * players would unlock the Lucky machine but never see it until
 * another mechanism caused the drop.
 */
class LuckyCheck extends Component<typeof LuckyCheck> {
    static propsDefinition = {
        /**
         * A reference to the MBC25Inventory entity.  The LuckyCheck
         * trigger will send events to this entity when players
         * enter.
         */
        mbcInventoryObject: { type: hz.PropTypes.Entity },
    };

    preStart() {
        // Listen for players entering the trigger volume.  When a
        // player enters we call OnPlayerEnterTrigger().
        this.connectCodeBlockEvent(
            this.entity,
            CodeBlockEvents.OnPlayerEnterTrigger,
            this.OnPlayerEnterTrigger
        );
    }

    start() {
        // No setup required in start(); the work happens when players
        // enter the trigger and via local events.
    }

    /**
     * Handler for when a player enters the trigger.  Sends a
     * checkMBCInventory event to the inventory manager so it can
     * determine what packs the player owns and trigger any necessary
     * drops.
     *
     * @param playerName The player that entered the trigger.  Note
     *                   that Horizon passes a Player object here.
     */
    OnPlayerEnterTrigger(playerName: Player) {
        console.log(`Player ${playerName.name.get()} entered LuckyCheck trigger.`);
        this.sendLocalEvent(
            this.props.mbcInventoryObject!,
            checkMBCInventory,
            { playerId: playerName }
        );
    }
}
Component.register(LuckyCheck);
