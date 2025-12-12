export type LetterKey =
    | "KeyA"
    | "KeyB"
    | "KeyC"
    | "KeyD"
    | "KeyE"
    | "KeyF"
    | "KeyG"
    | "KeyH"
    | "KeyI"
    | "KeyJ"
    | "KeyK"
    | "KeyL"
    | "KeyM"
    | "KeyN"
    | "KeyO"
    | "KeyP"
    | "KeyQ"
    | "KeyR"
    | "KeyS"
    | "KeyT"
    | "KeyU"
    | "KeyV"
    | "KeyW"
    | "KeyX"
    | "KeyY"
    | "KeyZ";

export type DigitKey =
    | "Digit0"
    | "Digit1"
    | "Digit2"
    | "Digit3"
    | "Digit4"
    | "Digit5"
    | "Digit6"
    | "Digit7"
    | "Digit8"
    | "Digit9";

export const functionKeys = [
    "F1",
    "F2",
    "F3",
    "F4",
    "F5",
    "F6",
    "F7",
    "F8",
    "F9",
    "F10",
    "F11",
    "F12",
    "F13",
    "F14",
    "F15",
    "F16",
    "F17",
    "F18",
    "F19",
    "F20",
    "F21",
    "F22",
    "F23",
    "F24"
] as const;

export type FunctionKey = (typeof functionKeys)[number];

export type ArrowKey = "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight";

export type ControlKey =
    | "Escape"
    | "Tab"
    | "CapsLock"
    | "ShiftLeft"
    | "ShiftRight"
    | "ControlLeft"
    | "ControlRight"
    | "AltLeft"
    | "AltRight"
    | "MetaLeft"
    | "MetaRight"
    | "ContextMenu"
    | "Enter"
    | "Backspace"
    | "Space";

export type NavigationKey = "Insert" | "Delete" | "Home" | "End" | "PageUp" | "PageDown";

export type SymbolKey =
    | "Minus"
    | "Equal"
    | "BracketLeft"
    | "BracketRight"
    | "Backslash"
    | "Semicolon"
    | "Quote"
    | "Backquote"
    | "Comma"
    | "Period"
    | "Slash";

export type NumpadKey =
    | "NumLock"
    | "Numpad0"
    | "Numpad1"
    | "Numpad2"
    | "Numpad3"
    | "Numpad4"
    | "Numpad5"
    | "Numpad6"
    | "Numpad7"
    | "Numpad8"
    | "Numpad9"
    | "NumpadAdd"
    | "NumpadSubtract"
    | "NumpadMultiply"
    | "NumpadDivide"
    | "NumpadDecimal"
    | "NumpadEnter"
    | "NumpadEqual"
    | "NumpadComma"
    | "NumpadParenLeft"
    | "NumpadParenRight";

export type MediaKey =
    | "VolumeMute"
    | "VolumeDown"
    | "VolumeUp"
    | "MediaTrackNext"
    | "MediaTrackPrevious"
    | "MediaStop"
    | "MediaPlayPause";

export type BrowserKey =
    | "BrowserBack"
    | "BrowserForward"
    | "BrowserRefresh"
    | "BrowserStop"
    | "BrowserSearch"
    | "BrowserFavorites"
    | "BrowserHome";

export type SystemKey = "Power" | "Sleep" | "WakeUp";

export type IntlKey =
    | "IntlBackslash"
    | "IntlRo"
    | "IntlYen"
    | "Convert"
    | "NonConvert"
    | "KanaMode"
    | "Lang1"
    | "Lang2"
    | "Lang3"
    | "Lang4"
    | "Lang5";

export type SoftKey = "SoftLeft" | "SoftRight" | "Soft1" | "Soft2" | "Soft3" | "Soft4";

export type KeyCode =
    | LetterKey
    | DigitKey
    | FunctionKey
    | ArrowKey
    | ControlKey
    | NavigationKey
    | SymbolKey
    | NumpadKey
    | MediaKey
    | BrowserKey
    | SystemKey
    | IntlKey
    | SoftKey;

export const isFunctionKey = (code: KeyCode): code is FunctionKey => {
    const fk: readonly KeyCode[] = functionKeys;
    return fk.includes(code);
};
