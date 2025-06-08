import * as hz from 'horizon/core';
import { LocalEvent, Player } from "horizon/core";
 
export const trackIdEvent = new hz.LocalEvent<{ trackId: number }>('trackIdEvent');
export const playSongEvent = new hz.LocalEvent<{ trackId: number }>('playSongEvent');