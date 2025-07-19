import * as hz from 'horizon/core';
import { CodeBlockEvents, Component, Entity, Player } from 'horizon/core';
import { checkMBCInventory } from "./shared-events-MBC25";

class LuckyCheck extends Component<typeof LuckyCheck>{
    static propsDefinition = {
        mbcInventoryObject: { type: hz.PropTypes.Entity },
    };

  preStart() {
    this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerEnterTrigger, this.OnPlayerEnterTrigger);
  }

  start() {

  }

  OnPlayerEnterTrigger(playerName: Player) {
    // Add code here that you want to run when a player enters the trigger.
    // For more details and examples go to:
    // https://developers.meta.com/horizon-worlds/learn/documentation/code-blocks-and-gizmos/use-the-trigger-zone
      console.log(`Player ${playerName.name.get()} entered trigger.`);
      this.connectLocalBroadcastEvent(
          checkMBCInventory,
          (playerName) => {
              console.log(playerName);
          }
      );

  }

}
Component.register(LuckyCheck);