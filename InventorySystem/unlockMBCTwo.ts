import * as hz from 'horizon/core';
import { CodeBlockEvents, Component, Entity, Player } from 'horizon/core';
import { unlockMBC25 } from 'shared-events-MBC25';


// walking through this trigger should unlock the lucky MBC25 for the user
class unlockMBCTwo extends Component<typeof unlockMBCTwo>{
    static propsDefinition = {
        inventoryManager: { type: hz.PropTypes.Entity },
        unlockMBCVariant: { type: hz.PropTypes.String },
    };

    // sends unlock info to inventory manager
    private unlockLuckyMBC(unlockingPlayerName: string, unlockPackId: string) {
        this.sendLocalEvent(
            this.props.inventoryManager!,
            unlockMBC25, {
                playerName: unlockingPlayerName,
                packId: unlockPackId
            }
        )
    }

    preStart() {

    }

    start() {
        this.connectCodeBlockEvent(
            this.entity,
            CodeBlockEvents.OnPlayerExitTrigger,
            (unlockData) => this.unlockLuckyMBC(unlockData.name.get(), this.props.unlockMBCVariant)
        )
    }
}


Component.register(unlockMBCTwo);