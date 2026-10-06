// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  buildPreorderSerialize036Steps,
  SERIAL_TREE_NODES,
} from './preorder-serialize-036-step-compiler';
import { PreorderSerialize036CanvasAdapter } from './preorder-serialize-036-canvas-adapter';

describe('preorder-serialize-036-step-compiler (LC 297 / Class 036)', () => {
  it('正确生成全套先序序列化与反序列化推演步骤', () => {
    const steps = buildPreorderSerialize036Steps();
    expect(steps.length).toBeGreaterThanOrEqual(13);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.metrics?.['反序列化状态']).toContain('100%');
    expect(lastStep.statusBadge?.text).toContain('还原完成');
  });

  it('Canvas 适配器正常挂载树与队列管道', () => {
    const container = document.createElement('div');
    const steps = buildPreorderSerialize036Steps();
    PreorderSerialize036CanvasAdapter.renderCanvas(container, steps[1]);
    expect(container.querySelector('svg')).toBeDefined();
  });
});
