/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import {
  renderEulerianCircuitCanvas,
  renderEulerianCircuitCustomMetrics,
} from './eulerian-circuit-canvas-adapter';
import { buildEulerianCircuitSteps } from '../../../algorithms/categories/graph/eulerian-circuit-step-compiler';

describe('EulerianCircuitCanvasAdapter', () => {
  it('renders pure SVG canvas without table or NaN styles for 4-node preset', () => {
    const steps = buildEulerianCircuitSteps('classic_4node');
    expect(steps.length).toBeGreaterThan(5);

    const container = document.createElement('div');
    renderEulerianCircuitCanvas(container, steps[steps.length - 1]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('table')).toBeNull();
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });

  it('renders pure SVG canvas for triangle preset', () => {
    const steps = buildEulerianCircuitSteps('simple_triangle');
    const container = document.createElement('div');
    renderEulerianCircuitCanvas(container, steps[0]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.innerHTML).not.toContain('NaN');
  });

  it('renders custom metrics with head, deg, stack, and path monitor', () => {
    const steps = buildEulerianCircuitSteps('classic_4node');
    const container = document.createElement('div');
    renderEulerianCircuitCustomMetrics(container, steps[steps.length - 1]);

    expect(container.textContent).toContain('head[]');
    expect(container.textContent).toContain('outDeg[]');
    expect(container.textContent).toContain('一笔画欧拉回路轨迹');
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });
});
