import * as hz from 'horizon/core';
import { loopTriggerEvent, offlineColorChangeEvent, playingColorChangeEvent, upcomingLoopColorChangedEvent } from './shared-events';

class LoopButtonTrigger extends hz.Component<typeof LoopButtonTrigger> {
    static propsDefinition = {
        loopSectionId: { type: hz.PropTypes.Number },
        channelId: { type: hz.PropTypes.Number },
        upcomingPlaybackColor: { type: hz.PropTypes.Color, default: new hz.Color(0, 0, 1) },
        playbackColor: { type: hz.PropTypes.Color, default: new hz.Color(0, 1, 0) },
        originalButtonColor: { type: hz.PropTypes.Color, default: new hz.Color(1.0, 0.5, 0.0) },
        loopButton: { type: hz.PropTypes.Entity }
    };

    // sends loopTriggerEvent with channelId and LoopSectionId
    private startLoopPress = (): void => {
        this.sendLocalBroadcastEvent(loopTriggerEvent, ({
            channelId: this.props.channelId,
            loopSectionId: this.props.loopSectionId
        }));  
    }

    // turns button to originalButtonColor
    private buttonOffline = (): void => {
        console.log(`Trying to change to original color: ${this.props.originalButtonColor}`);

        // casts button as MeshEntity to access the style properties
        const thisMesh = this.props.loopButton!.as(hz.MeshEntity);
        // sets button to match originalButtonColor property
        thisMesh.style.tintColor.set(this.props.originalButtonColor);
        thisMesh.style.tintStrength.set(1.00);
        thisMesh.style.brightness.set(1.00);
    }

    // turns button to upcomingPlaybackColor
    private buttonPrimedForPlayback = (): void => {
        console.log(`Trying to change to upcoming playback color: ${this.props.upcomingPlaybackColor}`);

        // casts button as MeshEntity to access the style properties
        const thisMesh = this.props.loopButton!.as(hz.MeshEntity);
        // sets button to match upcomingPlaybackColor property
        thisMesh.style.tintColor.set(this.props.upcomingPlaybackColor);
        thisMesh.style.tintStrength.set(1.00);
        thisMesh.style.brightness.set(1.00);
    }

    // turns button to playbackColor
    private buttonOnline = (): void => {
        console.log(`Trying to change to now playing color: ${this.props.playbackColor}`);

        // casts button as MeshEntity to access the style properties
        const thisMesh = this.props.loopButton!.as(hz.MeshEntity);
        // sets button to match playbackColor property
        thisMesh.style.tintColor.set(this.props.playbackColor);
        thisMesh.style.tintStrength.set(1.00);
        thisMesh.style.brightness.set(1.00);
    }

    preStart() {
        // listen to offlineColorChangeEvent if button if correct match
        this.connectLocalBroadcastEvent(offlineColorChangeEvent, (loopData) => {
            // checks for channelId match
            if (loopData.channel == this.props.channelId) {
                // checks for loopId match
                if (loopData.loopId == this.props.loopSectionId) {
                    // sets this loop button color to default
                    this.buttonOffline();
                }
            }
        });

        // listen to playingColorChangeEvent if button is correct match
        this.connectLocalBroadcastEvent(playingColorChangeEvent, (loopData) => {
            // checks for channelId match
            if (loopData.channel == this.props.channelId) {
                // checks for loopId match
                if (loopData.loopId == this.props.loopSectionId) {
                    // sets this loop button color to playbackColor
                    this.buttonOnline();
                }
            }
        });

        // listen to upcomingLoopColorChangedEvent if button is correct match
        this.connectLocalBroadcastEvent(upcomingLoopColorChangedEvent, (loopData) => {
            // checks for channelId match
            if (loopData.channel == this.props.channelId) {
                // checks for loopId match
                if (loopData.loopId == this.props.loopSectionId) {
                    // sets this loop button color to upcomingPaybackColor
                    this.buttonPrimedForPlayback();
                }
            }
        });

        // listen to turn button blue
        this.connectCodeBlockEvent(
            this.entity,
            hz.CodeBlockEvents.OnPlayerExitTrigger,
            (this.buttonPrimedForPlayback)
        );

        // listen to trigger loop press codeblock event
        this.connectCodeBlockEvent(
            this.entity,
            hz.CodeBlockEvents.OnPlayerExitTrigger,
            (this.startLoopPress)
        );
    }

    start() {
        // sets color to default at start
        this.buttonOffline(); 

    }
}
hz.Component.register(LoopButtonTrigger);
