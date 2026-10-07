// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { buildAttendanceSteps } from './attendance-record-matrix-098-step-compiler';
import { matrixPower098CanvasAdapter } from './matrix-power-098-canvas-adapter';

describe('AttendanceRecordMatrix098 Step Compiler & Canvas Adapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('出勤记录 n=2 答案应为 8', () => {
    const steps = buildAttendanceSteps(2);
    expect(steps.length).toBeGreaterThan(3);

    const last = steps[steps.length - 1];
    expect(last.finalValue).toBe(8);
    expect(last.codeLine).toBeDefined();
    expect(last.line).toBeGreaterThan(0);
  });

  it('Canvas 适配器 DOM 挂载无崩溃', () => {
    const steps = buildAttendanceSteps(2);
    for (const step of [steps[0], steps[steps.length - 1]]) {
      matrixPower098CanvasAdapter.render(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
      expect(container.innerHTML).not.toContain('undefined');
    }
  });
});
