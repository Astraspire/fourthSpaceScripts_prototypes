import { NetworkEvent, Player } from 'horizon/core';

declare module 'UI_NotificationManager' {
    export const NotificationEvent: NetworkEvent<{
        message: string;
        players: Player[];
        imageAssetId: string | null;
    }>;
}
