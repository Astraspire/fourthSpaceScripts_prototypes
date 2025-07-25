import * as hz from 'horizon/core';
import { CodeBlockEvents, Component, Entity, Player } from 'horizon/core';
// NOTE: Use a relative import to reference local files.  Without
// the './' prefix TypeScript will try to resolve to a node module and
// fail.  This event is defined in shared-events-MBC25.ts.
import { unlockMBC25 } from './shared-events-MBC25';

/**
 * Component placed on a trigger zone that unlocks a specific MBC25
 * variant for the player.  When the player exits the trigger zone
 * (useful for letting them fully traverse a small area), we emit
 * an {@link unlockMBC25} event with their name and the configured
 * pack ID.  The inventory manager listens for this event and updates
 * the player's persistent storage accordingly.  After unlocking,
 * MBC25Inventory will broadcast a dropMBC event so the machine
 * appears in the world.
 */
class unlockMBCTwo extends Component<typeof unlockMBCTwo> {
    static propsDefinition = {
        /** A reference to the entity running the MBC25Inventory
         * component. */
        inventoryManager: { type: hz.PropTypes.Entity },
        /** The identifier of the MBC25 variant to unlock when the
         * player exits the trigger.  For example: 'Lucky'. */
        unlockMBCVariant: { type: hz.PropTypes.String },
    };

    /**
     * Helper function to send the unlock event.  We separate this out
     * to keep the event wiring in start() concise.  A player's name
     * and the pack ID are passed to the inventory manager via a local
     * event.  The inventory manager handles persisting and dropping
     * the MBC.
     */
    private unlockLuckyMBC(playerName: string, packId: string) {
        this.sendLocalEvent(
            this.props.inventoryManager!,
            unlockMBC25,
            {
                playerName,
                packId,
            }
        );
    }

    preStart() {
        // No action is required before start; the component waits for
        // players to exit the trigger.
    }

    start() {
        // Listen for the player exiting the trigger volume.  When this
        // occurs we call unlockLuckyMBC() with the player's name and
        // the configured MBC variant to unlock.
        this.connectCodeBlockEvent(
            this.entity,
            CodeBlockEvents.OnPlayerExitTrigger,
            (unlockData) => {
                // name.get() returns the string name of the Player
                this.unlockLuckyMBC(unlockData.name.get(), this.props.unlockMBCVariant);
            }
        );
    }
}

Component.register(unlockMBCTwo);
