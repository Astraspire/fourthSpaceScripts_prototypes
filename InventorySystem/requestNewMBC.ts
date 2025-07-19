import { CodeBlockEvents, Component,  Player } from 'horizon/core';
import * as hz from 'horizon/core';
import { changeActiveMBC, checkMBCInventory } from './shared-events-MBC25';

class requestNewMBC extends Component<typeof requestNewMBC>{
    static propsDefinition = {
        MBCInventoryManager: { type: hz.PropTypes.Entity },
    };

  preStart() {
      this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerEnterTrigger, this.OnPlayerEnterTrigger.bind(this));
      this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerExitTrigger, this.OnPlayerExitTrigger.bind(this));
  }

  start() {

  }

  OnPlayerEnterTrigger(player: Player) {
      console.log(`Player ${player.name.get()} entered trigger.`);

      this.sendLocalEvent(
          this.props.MBCInventoryManager!,
          checkMBCInventory,
          { playerName: player } 
      )
  }

    OnPlayerExitTrigger(player: Player) {
        console.log(`Player ${player.name.get()} exited trigger.`);

    }


}
Component.register(requestNewMBC);