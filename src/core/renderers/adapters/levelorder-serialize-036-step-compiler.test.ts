// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  buildLevelorderSerialize036Steps,
  LEVEL_SERIAL_NODES,
} from './levelorder-serialize-036-step-compiler';
import { LevelorderSerialize036CanvasAdapter } from './levelorder-serialize-036-canvas-adapter';

describe('levelorder-serialize-036-step-compiler (LC 297 / Class 036)', () => {
  it('正确生成全套按层序列化推演步骤', () => {
    const steps = buildLevelorderSerialize036Steps();
    expect(steps.length).toBe(8);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.metrics?.['按层序列结果']).toBeDefined();
    expect(lastStep.statusBadge?.text).toBe('完成');
  });

  it('Canvas 适配器正常挂载树与队列管道', () => {
    const container = document.createElement('div');
    const steps = buildLevelorderSerialize036Steps();
    LevelorderSerialize036CanvasAdapter.renderCanvas(container, steps[2]);
    expect(container.querySelector('svg')).toBeDefined();
  });
});
