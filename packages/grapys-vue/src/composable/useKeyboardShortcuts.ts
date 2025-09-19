import { onBeforeUnmount } from "vue";

export type ShortcutHandler = (e: KeyboardEvent) => void;

export type Shortcut = {
  combo: string; // e.g. "mod+z", "ctrl+r", "mod+shift+z"
  handler: ShortcutHandler;
};

export type UseShortcutsApi = {
  addShortcut: (s: Shortcut) => () => void; // returns disposer
  removeShortcut: (disposer: () => void) => void;
  clearShortcuts: () => void;
};

function isEditableTarget(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null;
  if (!element) return false;
  const tag = element.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || element.isContentEditable === true;
}

function isMacOS(): boolean {
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

function parseCombo(combo: string): ParsedCombo {
  // Minimal implementation: do not treat '+' specially
  const parts = combo
    .toLowerCase()
    .split("+")
    .map((s) => s.trim())
    .filter(Boolean);

  const pc: ParsedCombo = { key: "" };
  for (const p of parts) {
    if (p === "ctrl" || p === "control") pc.ctrl = true;
    else if (p === "cmd" || p === "meta" || p === "command") pc.meta = true;
    else if (p === "shift") pc.shift = true;
    else if (p === "alt" || p === "option") pc.alt = true;
    else if (p === "mod") pc.mod = true;
    else pc.key = p; // e.g. 'z', 'r', '=', etc.
  }
  return pc;
}

function matchCombo(e: KeyboardEvent, pc: ParsedCombo, mac: boolean): boolean {
  const rawKey = e.key || "";
  const key = rawKey.toLowerCase();

  if (pc.key && key !== pc.key) return false;

  const expectCtrl = pc.ctrl ?? false;
  const expectMeta = pc.meta ?? false;
  const expectShift = pc.shift ?? false;
  const expectAlt = pc.alt ?? false;
  const expectMod = pc.mod ?? false;

  // Actual modifier values
  const actualCtrl = e.ctrlKey;
  const actualMeta = e.metaKey;
  const actualShift = e.shiftKey;
  const actualAlt = e.altKey;

  // 'mod' maps to meta on Mac, and to ctrl on other platforms
  const actualMod = mac ? actualMeta : actualCtrl;

  // Strictly check only modifiers that are expected to be true
  if (expectCtrl && !actualCtrl) return false;
  if (expectMeta && !actualMeta) return false;
  if (expectShift && !actualShift) return false;
  if (expectAlt && !actualAlt) return false;
  if (expectMod && !actualMod) return false;

  return true;
}

export function useKeyboardShortcuts(): UseShortcutsApi {
  const disposers: Array<() => void> = [];
  const mac = isMacOS();

  function attachListener(target: Window | HTMLElement, listener: (e: KeyboardEvent) => void) {
    const wrapped = (e: Event) => listener(e as KeyboardEvent);
    target.addEventListener("keydown", wrapped as EventListener);
    return () => target.removeEventListener("keydown", wrapped as EventListener);
  }

  function addShortcut(s: Shortcut): () => void {
    const pc = parseCombo(s.combo);
    const targetEl: Window | HTMLElement = window;

    const listener = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return;
      if (!matchCombo(e, pc, mac)) return;
      e.preventDefault();
      try {
        s.handler(e);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
      }
    };

    const dispose = attachListener(targetEl, listener);
    disposers.push(dispose);
    return () => {
      dispose();
      const i = disposers.indexOf(dispose);
      if (i >= 0) disposers.splice(i, 1);
    };
  }

  function removeShortcut(disposer: () => void) {
    disposer();
  }

  function clearShortcuts() {
    while (disposers.length) {
      const d = disposers.pop();
      if (d) d();
    }
  }

  onBeforeUnmount(() => {
    clearShortcuts();
  });

  return { addShortcut, removeShortcut, clearShortcuts };
}
