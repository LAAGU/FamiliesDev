type EscapeHandler = () => void;

const escapeStack: EscapeHandler[] = [];

function onKeyDown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    const latest = escapeStack[escapeStack.length - 1];
    if (latest) latest();
  }
}

// Attach once — this is crucial
let listenerAttached = false;

function ensureListener() {
  if (!listenerAttached && typeof window !== "undefined") {
    window.addEventListener("keydown", onKeyDown);
    listenerAttached = true;
  }
}

export const escapeManager = {
  push(handler: EscapeHandler) {
    ensureListener();
    escapeStack.push(handler);
  },
  pop(handler: EscapeHandler) {
    const index = escapeStack.lastIndexOf(handler);
    if (index !== -1) escapeStack.splice(index, 1);
  },
  debug() {
    console.log("Stack:", escapeStack.map((fn, i) => `#${i}: ${fn.name || 'anon'}`));
  },
  _stack: escapeStack,
};
