import * as hz from 'horizon/core';
import { Player } from 'horizon/core';
import { openSoundwaveStore, closeSoundwaveStore } from './shared-events-MBC25';

/**
 * SoundwaveStoreTrigger opens the SoundwaveStoreUI when a player enters a
 * trigger zone and closes it when they exit. Attach this component to a
 * trigger volume and reference the UI entity via the `storeUI` property.
 */
class SoundwaveStoreTrigger extends hz.Component<typeof SoundwaveStoreTrigger> {
    static propsDefinition = {
        // Entity running the SoundwaveStoreUI component
        storeUI: { type: hz.PropTypes.Entity },
    };

    private openStore = (player: Player): void => {
        if (this.props.storeUI) {
            this.sendLocalEvent(this.props.storeUI, openSoundwaveStore, { player });
        }
    };

    private closeStore = (player: Player): void => {
        if (this.props.storeUI) {
            this.sendLocalEvent(this.props.storeUI, closeSoundwaveStore, { player });
        }
    };

    preStart() {
        // Display UI when a player enters the trigger
        this.connectCodeBlockEvent(
            this.entity!,
            hz.CodeBlockEvents.OnPlayerEnterTrigger,
            this.openStore
        );
        // Hide UI when the player leaves the trigger
        this.connectCodeBlockEvent(
            this.entity!,
            hz.CodeBlockEvents.OnPlayerExitTrigger,
            this.closeStore
        );
    }
}

hz.Component.register(SoundwaveStoreTrigger);
