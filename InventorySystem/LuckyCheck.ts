import * as hz from 'horizon/core';
import { CodeBlockEvents, Component, Entity, Player } from 'horizon/core';
import { checkMBCInventory } from "./shared-events-MBC25";

class LuckyCheck extends Component<typeof LuckyCheck>{
    static propsDefinition = {
        mbcInventoryObject: { type: hz.PropTypes.Entity },
    };

  preStart() {
    this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerEnterTrigger, this.OnPlayerEnterTrigger.bind(this));
    this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnEntityEnterTrigger, this.OnEntityEnterTrigger.bind(this));
  }

  start() {

  }

  OnPlayerEnterTrigger(player: Player) {
    // Add code here that you want to run when a player enters the trigger.
    // For more details and examples go to:
    // https://developers.meta.com/horizon-worlds/learn/documentation/code-blocks-and-gizmos/use-the-trigger-zone
      console.log(`Player ${player.name.get()} entered trigger.`);

      this.connectLocalEvent(
          this.props.mbcInventoryObject!,
          checkMBCInventory,
          (thisPlayer) => {
              console.log(thisPlayer);
          }
      );

  }

  OnEntityEnterTrigger(entity: Entity) {
    // Add code here that you want to run when an entity enters the trigger.
    // The entity will need to have a Gameplay Tag that matches the tag your
    // trigger is configured to detect.
    console.log(`Entity ${entity.name.get()} entered trigger`);
  }
}
Component.register(LuckyCheck);