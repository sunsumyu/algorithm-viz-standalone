import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VisualRendererFactory } from './visual-renderer-factory';
import type { IVisualRenderer } from './visual-renderer';

describe('VisualRendererFactory Deep Module Guard (Factory Pattern)', () => {
  beforeEach(() => {
    VisualRendererFactory.clear();
  });

  it('should create and cache 2d-grid renderer correctly', () => {
    const r1 = VisualRendererFactory.getRenderer('2d-grid');
    const r2 = VisualRendererFactory.getRenderer('2d-grid');

    expect(r1).toBeDefined();
    expect(r1).toBe(r2);
    expect(r1.id).toBe('dom-2d-grid-renderer');
  });

  it('should create and cache 3d-voxel renderer correctly', () => {
    const r3d = VisualRendererFactory.getRenderer('3d-voxel');
    expect(r3d).toBeDefined();
    expect(r3d.id).toBe('three-grid-visual-adapter');
  });

  it('should support registering and retrieving custom renderer', () => {
    const mockCustomRenderer: IVisualRenderer = {
      id: 'custom-webgpu-adapter',
      mount: vi.fn(),
      updateStep: vi.fn(),
      dispose: vi.fn()
    };

    VisualRendererFactory.registerCustomRenderer('custom-webgpu', mockCustomRenderer);
    const retrieved = VisualRendererFactory.getRenderer('custom-webgpu');

    expect(retrieved).toBe(mockCustomRenderer);
    expect(retrieved.id).toBe('custom-webgpu-adapter');
  });

  it('should call dispose on all cached renderers upon clear()', () => {
    const mockCustomRenderer: IVisualRenderer = {
      id: 'disposable-adapter',
      mount: vi.fn(),
      updateStep: vi.fn(),
      dispose: vi.fn()
    };

    VisualRendererFactory.registerCustomRenderer('disposable', mockCustomRenderer);
    VisualRendererFactory.clear();

    expect(mockCustomRenderer.dispose).toHaveBeenCalled();
  });
});
