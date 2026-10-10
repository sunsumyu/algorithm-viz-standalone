/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  renderCourseScheduleIVCanvas,
  renderCourseScheduleIVCustomMetrics,
} from './course-schedule-iv-canvas-adapter';
import { buildCourseScheduleIVSteps } from '../../../algorithms/categories/graph/course-schedule-iv-step-compiler';

describe('CourseScheduleIVCanvasAdapter', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('renders pure SVG canvas without wrapping div in Card 1', () => {
    const steps = buildCourseScheduleIVSteps(4);
    expect(steps.length).toBeGreaterThan(0);

    const step = steps[steps.length - 1];
    renderCourseScheduleIVCanvas(container, step);

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(container.firstElementChild?.tagName.toLowerCase()).toBe('svg');

    // 检查节点 C0..C3 存在
    expect(container.innerHTML).toContain('C0');
    expect(container.innerHTML).toContain('C1');
    expect(container.innerHTML).toContain('C2');
    expect(container.innerHTML).toContain('C3');
  });

  it('renders custom metrics with transitive closure matrix and queries panel', () => {
    const steps = buildCourseScheduleIVSteps(4);
    const step = steps[steps.length - 1];

    renderCourseScheduleIVCustomMetrics(container, step);

    expect(container.innerHTML).toContain('全源传递闭包 isPre[u][v]');
    expect(container.innerHTML).toContain('先修关系验证查询');
    expect(container.innerHTML).toContain('课程总数');
  });
});
