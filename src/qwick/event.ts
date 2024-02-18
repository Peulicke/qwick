export enum EventType {
    LEVEL_START = "levelStart",
    LEVEL_WON = "levelWon",
    LEVEL_LOST = "levelLost",
    LEVEL_EXIT = "levelExit"
}

export type Event = {
    type: EventType;
    levelNum: number;
};

export const emit = (event: Event) => window.parent.postMessage(JSON.stringify(event), "*");

export const subscribe = (func: (event: Event) => void) => {
    const onMessage = (messageEvent: MessageEvent) => func(JSON.parse(messageEvent.data));
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
};
