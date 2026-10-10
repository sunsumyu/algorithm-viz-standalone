/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  renderPeopleSecretCanvas,
  renderPeopleSecretCustomMetrics,
} from './people-secret-canvas-adapter';
import { buildSecretExpertSteps } from '../../../algorithms/categories/graph/people-secret-step-compiler';

describe('PeopleSecretCanvasAdapter', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('renders pure SVG canvas without wrapping div', () => {
    const steps = buildSecretExpertSteps('classic_6expert');
    expect(steps.length).toBeGreaterThan(0);

    const step = steps[steps.length - 1];
    renderPeopleSecretCanvas(container, step);

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(container.firstElementChild?.tagName.toLowerCase()).toBe('svg');

    // 检查节点文本存在
    expect(container.innerHTML).toContain('E0');
    expect(container.innerHTML).toContain('E1');
    expect(container.innerHTML).toContain('知密');
  });

  it('renders custom metrics with father array and time-slice compartment', () => {
    const steps = buildSecretExpertSteps('classic_6expert');
    const midStep = steps.find((s) => s.status === 'rollback') || steps[0];

    renderPeopleSecretCustomMetrics(container, midStep);

    expect(container.innerHTML).toContain('father[] (父指针)');
    expect(container.innerHTML).toContain('当前已确认掌握秘密人数');
    expect(container.innerHTML).toContain('时序扩散与因果撤销舱');
  });
});
