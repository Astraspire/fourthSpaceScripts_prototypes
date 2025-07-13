import * as hz from 'horizon/core';
import { changeActiveMBC, unlockMBC25 } from 'shared-events-MBC25';

class InventoryManager extends hz.Component<typeof InventoryManager> {
    static propsDefinition = {
        unlockTrigger: { type: hz.PropTypes.Entity },
    };

    private playerInventory = 0;

    private registerInventoryAddition( newMbcVariant: string, playerName: string ) {
        console.log('need to add registerInventoryAddition method to InventoryManager script.');
        this.playerInventory++;

        console.log(`${this.playerInventory} in inventory and ${playerName} entered the trigger to do it.\n
        Soon they'll unlock the ${newMbcVariant}!'`);
    }

    preStart() {
        this.connectNetworkEvent(
            this.props.unlockTrigger!,
            unlockMBC25,
            (incomingData) => {
                this.registerInventoryAddition(incomingData.mbcVariant, incomingData.playerName);
            }
        )
    }

    start() {

    }
}
hz.Component.register(InventoryManager);