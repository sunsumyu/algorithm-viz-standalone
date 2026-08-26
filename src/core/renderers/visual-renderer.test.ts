import { describe, it, expect } from 'vitest';
import { ThreeGridVisualAdapter } from './three-grid-visual-adapter';
import type { IVisualRenderer } from './visual-renderer';

describe('IVisualRenderer Bridge Pattern Lifecycle Guard', () => {
  it('ThreeGridVisualAdapter conforms to IVisualRenderer interface contract', () => {
    const adapter: IVisualRenderer = ThreeGridVisualAdapter.getInstance();
    expect(adapter.id).toBe('three-grid-visual-adapter');
    expect(typeof adapter.mount).toBe('function');
    expect(typeof adapter.updateStep).toBe('function');
    expect(typeof adapter.dispose).toBe('function');
  });

  it('handles dispose safely when not mounted or after unmount', () => {
    const adapter = ThreeGridVisualAdapter.getInstance();
    expect(() => {
      adapter.dispose();
    }).not.toThrow();
  });
});
