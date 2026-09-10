import { describe, it, expect } from 'vitest';
import { ThreeGridVisualAdapter } from './three-grid-visual-adapter';
import { DOMGridVisualAdapter } from './dom-grid-visual-adapter';
import type { IVisualRenderer } from './visual-renderer';

describe('IVisualRenderer Bridge Pattern Lifecycle Guard', () => {
  it('ThreeGridVisualAdapter conforms to IVisualRenderer interface contract', () => {
    const adapter: IVisualRenderer = ThreeGridVisualAdapter.getInstance();
    expect(adapter.id).toBe('three-grid-visual-adapter');
    expect(typeof adapter.mount).toBe('function');
    expect(typeof adapter.updateStep).toBe('function');
    expect(typeof adapter.dispose).toBe('function');
  });

  it('DOMGridVisualAdapter conforms to IVisualRenderer interface contract', () => {
    const adapter: IVisualRenderer = new DOMGridVisualAdapter();
    expect(adapter.id).toBe('dom-2d-grid-renderer');
    expect(typeof adapter.mount).toBe('function');
    expect(typeof adapter.updateStep).toBe('function');
    expect(typeof adapter.dispose).toBe('function');

    const mockContainer = {
      querySelector: () => null
    } as unknown as HTMLElement;

    adapter.mount(mockContainer);
    adapter.updateStep({ type: 'init', i: 0, j: 0 });
    adapter.resize?.(800, 600);
    expect(() => adapter.dispose()).not.toThrow();
  });

  it('handles dispose safely when not mounted or after unmount', () => {
    const adapter = ThreeGridVisualAdapter.getInstance();
    expect(() => {
      adapter.dispose();
    }).not.toThrow();
  });
});
