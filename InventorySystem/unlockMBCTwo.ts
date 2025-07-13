import * as hz from 'horizon/core';
import { CodeBlockEvents, Component, Entity, Player } from 'horizon/core';
import { unlockMBC25 } from 'shared-events-MBC25';

class unlockMBCTwo extends Component<typeof unlockMBCTwo>{
    static propsDefinition = {
        inventoryManager: { type: hz.PropTypes.Entity },
    };

  override preStart() {
    this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerEnterTrigger, this.mbcLuckyUnlockTrigger);
  }

  start() {

  }

  mbcLuckyUnlockTrigger(playerWhoEntered: Player) {
      const playerId = playerWhoEntered.name.get();
      console.log(`Player ${playerId} entered "Lucky" trigger.`);

      this.sendNetworkEvent (
          this.props.inventoryManager!,
          unlockMBC25, {
          mbcVariant: "Lucky",
          playerName: playerId,
      });  
  }
}
Component.register(unlockMBCTwo);