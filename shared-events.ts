import * as hz from 'horizon/core';
import { LocalEvent, Player } from "horizon/core";

export const trackIdEvent = new hz.NetworkEvent<{ trackId: string }>('trackIdEvent');
export const playSongEvent = new hz.NetworkEvent<{ trackId: string }>('playSongEvent');