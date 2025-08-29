import * as hz from 'horizon/core';
import { loopTriggerEventLucky, offlineColorChangeEventLucky, hardOfflineColorChangeEventLucky, playingColorChangeEventLucky, upcomingLoopColorChangedEventLucky } from './shared-events-lucky';

enum ButtonState {
    Idle,
    Upcoming,
    Playing,
}

class LoopButtonTriggerLucky extends hz.Component<typeof LoopButtonTriggerLucky> {
    // starts each button as 'idle'
    public state = ButtonState.Idle;

    static propsDefinition = {
        loopSectionId: { type: hz.PropTypes.Number },
        channelId: { type: hz.PropTypes.Number },
        upcomingPlaybackColor: { type: hz.PropTypes.Color, default: new hz.Color(0, 0, 1) },
        playbackColor: { type: hz.PropTypes.Color, default: new hz.Color(0, 1, 0) },
        originalButtonColor: { type: hz.PropTypes.Color, default: new hz.Color(1.0, 0.5, 0.0) },
        loopButton: { type: hz.PropTypes.Entity }
    };
    // sends loopTriggerEventLucky with channelId and LoopSectionId
    private startLoopPress = (): void => {
            this.sendLocalBroadcastEvent(loopTriggerEventLucky, ({
            channelId: this.props.channelId,
            loopSectionId: this.props.loopSectionId
        }));  
    }

    // turns button to originalButtonColor
    private buttonOffline = (): void => {
        if (this.state == ButtonState.Playing) {
            console.log('button already active, skipping...');
            return;
        }

        // casts button as MeshEntity to access the style properties
        const thisMesh = this.props.loopButton!.as(hz.MeshEntity);
        // sets button to match originalButtonColor property
        thisMesh.style.tintColor.set(this.props.originalButtonColor);
        thisMesh.style.tintStrength.set(1.00);
        thisMesh.style.brightness.set(1.00);

        this.state = ButtonState.Idle;
    }

    // turns button offline color no matter what
    private hardOffline = (): void => {
        // casts button as MeshEntity to access the style properties
        const thisMesh = this.props.loopButton!.as(hz.MeshEntity);
        // sets button to match originalButtonColor property
        thisMesh.style.tintColor.set(this.props.originalButtonColor);
        thisMesh.style.tintStrength.set(1.00);
        thisMesh.style.brightness.set(1.00);

        this.state = ButtonState.Idle;
    }

    // turns button to upcomingPlaybackColor
    private buttonPrimedForPlayback = (): void => {
        if (this.state == ButtonState.Playing) {
            console.log('Button already live');
            return;
        }

        // casts button as MeshEntity to access the style properties
        const thisMesh = this.props.loopButton!.as(hz.MeshEntity);
        // sets button to match upcomingPlaybackColor property
        thisMesh.style.tintColor.set(this.props.upcomingPlaybackColor);
        thisMesh.style.tintStrength.set(1.00);
        thisMesh.style.brightness.set(1.00);

        this.state = ButtonState.Upcoming;
    }

    // turns button to playbackColor
    private buttonOnline = (): void => {
        // casts button as MeshEntity to access the style properties
        const thisMesh = this.props.loopButton!.as(hz.MeshEntity);
        // sets button to match playbackColor property
        thisMesh.style.tintColor.set(this.props.playbackColor);
        thisMesh.style.tintStrength.set(1.00);
        thisMesh.style.brightness.set(1.00);

        this.state = ButtonState.Playing;
    }

    preStart() {

        // sets color to default at start
        this.buttonOffline(); 

        // listen to offlineColorChangeEventLucky if button if correct match
        this.connectLocalBroadcastEvent(offlineColorChangeEventLucky, (loopData) => {
            // checks for channelId match
            if (loopData.channel == this.props.channelId) {
                // checks for loopId match
                if (loopData.loopId == this.props.loopSectionId) {
                    // sets this loop button color to default
                    this.buttonOffline();
                }
            }
        });

        // listen to offlineColorChangeEventLucky if button if correct match
        this.connectLocalBroadcastEvent(hardOfflineColorChangeEventLucky, (loopData) => {
            // checks for channelId match
            if (loopData.channel == this.props.channelId) {
                // checks for loopId match
                if (loopData.loopId == this.props.loopSectionId) {
                    // sets this loop button color to default
                    this.hardOffline();
                }
            }
        });

        // listen to playingColorChangeEventLucky if button is correct match
        this.connectLocalBroadcastEvent(playingColorChangeEventLucky, (loopData) => {
            // checks for channelId match
            if (loopData.channel == this.props.channelId) {
                // checks for loopId match
                if (loopData.loopId == this.props.loopSectionId) {
                    // sets this loop button color to playbackColor
                    this.buttonOnline();
                }
            }
        });

        // listen to upcomingLoopColorChangedEventLucky if button is correct match
        this.connectLocalBroadcastEvent(upcomingLoopColorChangedEventLucky, (loopData) => {
            // checks for channelId match
            if (loopData.channel == this.props.channelId) {
                // checks for loopId match
                if (loopData.loopId == this.props.loopSectionId) {
                    // sets this loop button color to upcomingPaybackColor
                    this.buttonPrimedForPlayback();
                }
            }
        });

        // listen to trigger loop press codeblock event
        this.connectCodeBlockEvent(
            this.entity,
            hz.CodeBlockEvents.OnPlayerExitTrigger,
            (this.startLoopPress)
        );

        // listen to turn button blue
        this.connectCodeBlockEvent(
            this.entity,
            hz.CodeBlockEvents.OnPlayerExitTrigger,
            (this.buttonPrimedForPlayback)
        );
    }

    start() {

    }

}
hz.Component.register(LoopButtonTriggerLucky);
