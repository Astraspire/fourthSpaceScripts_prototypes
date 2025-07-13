import * as hz from 'horizon/core';
import { CodeBlockEvents, Component, Entity, Player } from 'horizon/core';
import { unlockMBC25 } from 'shared-events-MBC25';

class unlockMBCTwo extends Component<typeof unlockMBCTwo>{
    static propsDefinition = {
        inventoryManager: { type: hz.PropTypes.Entity },
    };

  preStart() {
    this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerEnterTrigger, this.OnPlayerEnterTrigger);
    this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnEntityEnterTrigger, this.OnEntityEnterTrigger);
  }

  start() {

  }

  OnPlayerEnterTrigger(player: Player) {
    // Add code here that you want to run when a player enters the trigger.
    // For more details and examples go to:
    // https://developers.meta.com/horizon-worlds/learn/documentation/code-blocks-and-gizmos/use-the-trigger-zone
      console.log(`Player ${player.name.get()} entered trigger.`);

      this.sendNetworkEvent(
          this.props.inventoryManager!,
          unlockMBC25, ({
          mbcVariant: "Lucky",
          playerName: player.name.get(),
      }));  
  }

  OnEntityEnterTrigger(entity: Entity) {
    // Add code here that you want to run when an entity enters the trigger.
    // The entity will need to have a Gameplay Tag that matches the tag your
    // trigger is configured to detect.
    console.log(`Entity ${entity.name.get()} entered trigger`);
  }
}
Component.register(unlockMBCTwo);