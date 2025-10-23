import { useEffect, useRef } from "react";
import { escapeManager } from "../stacks/escapeManager";

export function useEscape(callback: () => void, condition: boolean = true) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!condition) return;

    const handler = () => {
      callbackRef.current();
    };

    escapeManager.push(handler);
    return () => {
      escapeManager.pop(handler);
    };
  }, [condition]);
}
