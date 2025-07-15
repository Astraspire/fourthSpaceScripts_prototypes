import * as hz from 'horizon/core';
import { CodeBlockEvents, Component, Entity, Player } from 'horizon/core';
import { unlockMBC25 } from 'shared-events-MBC25';

class unlockMBCTwo extends Component<typeof unlockMBCTwo>{
    static propsDefinition = {
        inventoryManager: { type: hz.PropTypes.Entity },
        unlockMBCVariant: { type: hz.PropTypes.String },
    };


    private unlockLuckyMBC(playerName: string, packId: string) {
        this.sendLocalEvent(
            this.props.inventoryManager!,
            unlockMBC25, {
                unlockPlayerName: playerName,
                unlockPackId: packId
        })
    }

    override preStart() {
        this.connectCodeBlockEvent(
            this.entity,
            CodeBlockEvents.OnPlayerEnterTrigger,
            (unlockPlayer) => this.unlockLuckyMBC(unlockPlayer.name.get(), this.props.unlockMBCVariant)
        )
    }

    start() {

    }
}


Component.register(unlockMBCTwo);