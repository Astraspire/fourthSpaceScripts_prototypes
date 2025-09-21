import { NetworkEvent, Player } from "horizon/core";

export const simpleButtonEvent = new NetworkEvent<{ player: Player }>("simpleButtonEvent");

//region define events
export const NotificationEvent = new NetworkEvent<{
  message: string | null;
  players: Player[];
  imageAssetId: string | null;
}>("NotificationEvent");