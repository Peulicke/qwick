export enum EventType {
    LEVEL_START = "levelStart",
    LEVEL_WON = "levelWon",
    LEVEL_LOST = "levelLost",
    LEVEL_EXIT = "levelExit",
    LEVEL_RESTART = "levelRestart"
}

export type Event = {
    type: EventType;
    levelNum: number;
};

const isEvent = (event: unknown): event is Event =>
    typeof event === "object" && event !== null && "type" in event && "levelNum" in event;

export const emit = (event: Event) => window.parent.postMessage(JSON.stringify(event), "*");

export const subscribe = (func: (event: Event) => void) => {
    const onMessage = (messageEvent: MessageEvent) => {
        const data = JSON.parse(messageEvent.data);
        if (isEvent(data)) func(data);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
};
