/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import {
  renderTreeDominantColorCanvas,
  renderTreeDominantColorCustomMetrics,
  TreeDominantColorCanvasAdapter,
} from './tree-dominant-color-canvas-adapter';
import { buildTreeDominantColorSteps } from '../../../algorithms/categories/graph/tree-dominant-color-step-compiler';

describe('TreeDominantColorCanvasAdapter', () => {
  it('renders pure SVG canvas without table or NaN styles for cf600e_5node preset', () => {
    const steps = buildTreeDominantColorSteps('cf600e_5node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const container = document.createElement('div');
    renderTreeDominantColorCanvas(container, steps[steps.length - 1]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('table')).toBeNull();
    expect(container.querySelectorAll('circle').length).toBe(5);
    expect(container.querySelectorAll('line').length).toBe(4);
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });

  it('renders pure SVG canvas for bicolor_5node preset', () => {
    const steps = buildTreeDominantColorSteps('bicolor_5node');
    const container = document.createElement('div');
    renderTreeDominantColorCanvas(container, steps[0]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('table')).toBeNull();
    expect(container.querySelectorAll('circle').length).toBe(5);
    expect(container.innerHTML).not.toContain('NaN');
  });

  it('renders custom metrics with sz, cnt, and ans rows', () => {
    const steps = buildTreeDominantColorSteps('cf600e_5node');
    const container = document.createElement('div');
    renderTreeDominantColorCustomMetrics(container, steps[steps.length - 1]);

    expect(container.textContent).toContain('sz[] (子树大小)');
    expect(container.textContent).toContain('cnt[] (颜色频次)');
    expect(container.textContent).toContain('ans[] (众数和)');
    expect(container.textContent).toContain('DSU 启发式合并法则');
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });

  it('supports lifecycle adapter methods mount, updateStep, renderCustomMetrics, dispose', () => {
    const adapter = new TreeDominantColorCanvasAdapter();
    const container = document.createElement('div');
    adapter.mount(container);
    const steps = buildTreeDominantColorSteps('cf600e_5node');
    adapter.updateStep(container, steps[0]);
    expect(container.querySelector('svg')).not.toBeNull();
    adapter.renderCustomMetrics(container, steps[steps.length - 1]);
    expect(container.textContent).toContain('sz[]');
    adapter.dispose();
  });
});
