import { onBeforeUnmount, onMounted } from "vue";

export type ShortcutHandler = (e: KeyboardEvent) => void;

export type Shortcut = {
  combo: string; // e.g. "mod+z", "ctrl+r", "mod+shift+z"
  handler: ShortcutHandler;
};

export type UseShortcutsApi = {
  addShortcut: (shortcut: Shortcut) => void;
};

const isEditableTarget = (target: EventTarget | null): boolean => {
  const element = target as HTMLElement | null;
  if (!element) return false;
  const tag = element.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || element.isContentEditable === true;
}

const isMacOS = (): boolean => {
  const ua = navigator.userAgent || "";
  return /(Mac|iPhone|iPod|iPad|iOS)/i.test(ua);
}

type ParsedCombo = {
  key: string; // normalized lower-case
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  mod?: boolean; // virtual modifier
};

const parseCombo = (combo: string): ParsedCombo => {
  // Minimal implementation: do not treat '+' specially
  const parts = combo
    .toLowerCase()
    .split("+")
    .map((part) => part.trim())
    .filter(Boolean);

  const modifierMap: { [key: string]: keyof Omit<ParsedCombo, "key"> } = {
    ctrl: "ctrl",
    control: "ctrl",
    cmd: "meta",
    meta: "meta",
    command: "meta",
    shift: "shift",
    alt: "alt",
    option: "alt",
    mod: "mod",
  };

  const initialCombo: ParsedCombo = { key: "" };
  return parts.reduce((acc, part) => {
    const modifier = modifierMap[part];
    if (modifier) {
      acc[modifier] = true;
    } else {
      acc.key = part;
    }
    return acc;
  }, initialCombo);
}

const matchCombo = (event: KeyboardEvent, parsedCombo: ParsedCombo, isMac: boolean): boolean => {
  const rawKey = event.key || "";
  const key = rawKey.toLowerCase();

  if (parsedCombo.key && key !== parsedCombo.key) return false;

  // Determine the expected state of modifier keys
  // If parsedCombo.mod is true, expect meta on Mac and ctrl otherwise
  const expectCtrl = parsedCombo.ctrl || (parsedCombo.mod && !isMac) || false;
  const expectMeta = parsedCombo.meta || (parsedCombo.mod && isMac) || false;
  const expectShift = parsedCombo.shift || false;
  const expectAlt = parsedCombo.alt || false;

  // Actual state of modifier keys
  const actualCtrl = event.ctrlKey;
  const actualMeta = event.metaKey;
  const actualShift = event.shiftKey;
  const actualAlt = event.altKey;

  // Check if the expected state and actual state match perfectly
  return expectCtrl === actualCtrl && expectMeta === actualMeta && expectShift === actualShift && expectAlt === actualAlt;
}

type InternalShortcut = {
  parsedCombo: ParsedCombo;
  handler: ShortcutHandler;
};

export const useKeyboardShortcuts = (): UseShortcutsApi => {
  const shortcuts: InternalShortcut[] = [];
  const isMac = isMacOS();

  const handleKeyDown = (event: KeyboardEvent) => {
    if (isEditableTarget(event.target)) return;

    for (const shortcut of shortcuts) {
      if (matchCombo(event, shortcut.parsedCombo, isMac)) {
        event.preventDefault();
        try {
          shortcut.handler(event);
        } catch (err) {
          console.error(err);
        }
        break;
      }
    }
  };

  const addShortcut = (shortcut: Shortcut) => {
    const parsedCombo = parseCombo(shortcut.combo);
    shortcuts.push({ parsedCombo, handler: shortcut.handler });
  };

  const clearShortcuts = () => {
    // Clear the array.
    shortcuts.length = 0;
  };

  onMounted(() => {
    window.addEventListener("keydown", handleKeyDown);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("keydown", handleKeyDown);
    clearShortcuts();
  });

  return { addShortcut };
}
