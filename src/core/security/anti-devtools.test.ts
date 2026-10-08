// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setupRuntimeInspectionGuard } from './anti-devtools';

describe('Runtime Anti-DevTools Inspection Guard (Ticket 02)', () => {
  let cleanup: (() => void) | null = null;

  beforeEach(() => {
    cleanup = null;
  });

  afterEach(() => {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
  });

  describe('Production Mode (isDev = false)', () => {
    it('should block contextmenu (right click) in production', () => {
      cleanup = setupRuntimeInspectionGuard(false);

      const event = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
      });

      const allowed = window.dispatchEvent(event);
      expect(allowed).toBe(false);
      expect(event.defaultPrevented).toBe(true);
    });

    it('should block F12 keydown in production', () => {
      cleanup = setupRuntimeInspectionGuard(false);

      const event = new KeyboardEvent('keydown', {
        key: 'F12',
        bubbles: true,
        cancelable: true,
      });

      const allowed = window.dispatchEvent(event);
      expect(allowed).toBe(false);
      expect(event.defaultPrevented).toBe(true);
    });

    it('should block Ctrl+Shift+I / J / C in production', () => {
      cleanup = setupRuntimeInspectionGuard(false);

      const inspectKeys = ['I', 'J', 'C', 'i', 'j', 'c'];
      for (const key of inspectKeys) {
        const event = new KeyboardEvent('keydown', {
          key,
          ctrlKey: true,
          shiftKey: true,
          bubbles: true,
          cancelable: true,
        });

        const allowed = window.dispatchEvent(event);
        expect(allowed).toBe(false);
        expect(event.defaultPrevented).toBe(true);
      }
    });

    it('should block Ctrl+U (view source) in production', () => {
      cleanup = setupRuntimeInspectionGuard(false);

      const event = new KeyboardEvent('keydown', {
        key: 'u',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });

      const allowed = window.dispatchEvent(event);
      expect(allowed).toBe(false);
      expect(event.defaultPrevented).toBe(true);
    });

    it('should allow normal keys like Enter, Escape, Space, Ctrl+C in production', () => {
      cleanup = setupRuntimeInspectionGuard(false);

      const normalKeys = [
        { key: 'Enter' },
        { key: 'Escape' },
        { key: ' ' },
        { key: 'c', ctrlKey: true },
      ];

      for (const config of normalKeys) {
        const event = new KeyboardEvent('keydown', {
          ...config,
          bubbles: true,
          cancelable: true,
        });

        const allowed = window.dispatchEvent(event);
        expect(allowed).toBe(true);
        expect(event.defaultPrevented).toBe(false);
      }
    });

    it('should restore normal behavior after cleanup is called', () => {
      cleanup = setupRuntimeInspectionGuard(false);
      cleanup();
      cleanup = null;

      const f12Event = new KeyboardEvent('keydown', {
        key: 'F12',
        bubbles: true,
        cancelable: true,
      });
      expect(window.dispatchEvent(f12Event)).toBe(true);
      expect(f12Event.defaultPrevented).toBe(false);

      const menuEvent = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
      });
      expect(window.dispatchEvent(menuEvent)).toBe(true);
      expect(menuEvent.defaultPrevented).toBe(false);
    });
  });

  describe('Development Mode (isDev = true)', () => {
    it('should NOT block contextmenu or F12 in dev mode to preserve debugging experience', () => {
      cleanup = setupRuntimeInspectionGuard(true);

      const f12Event = new KeyboardEvent('keydown', {
        key: 'F12',
        bubbles: true,
        cancelable: true,
      });
      expect(window.dispatchEvent(f12Event)).toBe(true);
      expect(f12Event.defaultPrevented).toBe(false);

      const menuEvent = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
      });
      expect(window.dispatchEvent(menuEvent)).toBe(true);
      expect(menuEvent.defaultPrevented).toBe(false);
    });
  });
});
