/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  renderGraphSummaryCanvas,
  renderGraphSummaryCustomMetrics,
  GraphSummaryCanvasAdapter,
} from './graph-summary-canvas-adapter';
import { buildGraphSummarySteps } from '../../../algorithms/categories/graph/graph-summary-step-compiler';

describe('GraphSummaryCanvasAdapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('renders pure SVG canvas in Card 1 with viewBox and core hub', () => {
    const steps = buildGraphSummarySteps();
    renderGraphSummaryCanvas(container, steps[0]);

    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 760 420');

    // Card 1 纯 SVG 禁绝外层内联 HTML 卡片
    expect(container.firstElementChild?.tagName.toLowerCase()).toBe('svg');

    // 核心枢纽存在
    expect(container.querySelector('.gs-core')).not.toBeNull();
    // 包含 5 个领域节点
    const nodes = container.querySelectorAll('.gs-node');
    expect(nodes.length).toBe(5);
  });

  it('renders highlighted satellite node and algorithm petals for active category step', () => {
    const steps = buildGraphSummarySteps();
    // Step 1: Traversal
    renderGraphSummaryCanvas(container, steps[1]);

    const activeNode = container.querySelector('.gs-node text');
    expect(activeNode).not.toBeNull();
  });

  it('renders custom metrics chips and descriptions in Card 2', () => {
    const steps = buildGraphSummarySteps();
    renderGraphSummaryCustomMetrics(container, steps[1]);

    expect(container.innerHTML).toContain('当前支柱:');
    expect(container.innerHTML).toContain('遍历搜索');
  });

  it('mounts, updates and disposes properly via adapter class', () => {
    const adapter = new GraphSummaryCanvasAdapter();
    const steps = buildGraphSummarySteps();

    adapter.mount(container);
    expect(container.innerHTML).toBe('');

    adapter.updateStep(container, steps[2]);
    expect(container.querySelector('svg')).not.toBeNull();

    adapter.dispose(container);
    expect(container.innerHTML).toBe('');
  });
});
