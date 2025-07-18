import * as hz from 'horizon/core';
import { CodeBlockEvents, Component, Entity, Player } from 'horizon/core';
import { unlockMBC25 } from 'shared-events-MBC25';


// walking through this trigger should unlock the lucky MBC25 for the user
class unlockMBCTwo extends Component<typeof unlockMBCTwo>{
    static propsDefinition = {
        inventoryManager: { type: hz.PropTypes.Entity },
        unlockMBCVariant: { type: hz.PropTypes.String },
    };


    private unlockLuckyMBC(playerName: string, packId: string) {
        this.sendLocalEvent(
            this.props.inventoryManager!,
            unlockMBC25, {
                playerName,
                packId
            }
        )
    }

    preStart() {

    }

    start() {
        this.connectCodeBlockEvent(
            this.entity,
            CodeBlockEvents.OnPlayerEnterTrigger,
            (unlockData) => this.unlockLuckyMBC(unlockData.name.get(), this.props.unlockMBCVariant)
        )
    }
}


Component.register(unlockMBCTwo);