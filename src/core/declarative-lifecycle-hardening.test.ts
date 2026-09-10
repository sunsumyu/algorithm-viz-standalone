/**
 * DeclarativeAlgorithmVisualizer 生命周期管道固化验证
 * 方案 3 (Pipeline Hardening)：
 * 1. 渲染器异常 → 可见错误卡片，不向管道外传播
 * 2. 空 steps → 可见诊断信息，替代静默白板
 * 3. buildSteps 返回 null → 回退空数组，不崩溃
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeclarativeAlgorithmVisualizer } from './declarative-algorithm-visualizer';

// Lightweight DOM mock for node test environment
class MockElement {
  public style: Record<string, string> = {};
  public isConnected = true;
  private _innerHTML = '';
  public textContent = '';
  public get innerHTML(): string {
    return this._innerHTML;
  }
  public set innerHTML(v: string) {
    this._innerHTML = v;
  }
  public querySelector(): MockElement | null {
    return null;
  }
  public querySelectorAll(): MockElement[] {
    return [];
  }
  public addEventListener(): void {}
}

interface MockRoot {
  root: MockElement;
  sandbox: MockElement;
  metrics: MockElement;
  live: MockElement;
}

function makeRoot(): MockRoot {
  const sandbox = new MockElement();
  const metrics = new MockElement();
  const live = new MockElement();
  const root = new MockElement();
  (root as unknown as { querySelector: (sel: string) => MockElement | null }).querySelector = (
    sel: string
  ) => {
    if (sel === '#dsp-sandbox-container') return sandbox;
    if (sel === '#dsp-custom-metrics-container') return metrics;
    if (sel === '#dsp-live-text') return live;
    return null;
  };
  return { root, sandbox, metrics, live };
}

/** 测试专用子类：暴露 protected 生命周期方法 */
class Harness extends DeclarativeAlgorithmVisualizer<any> {
  public get stepCount(): number {
    return this.steps.length;
  }
  public callRenderStep(step: any): void {
    this.renderStep(step);
  }
  public async callStart(): Promise<void> {
    await this.start();
  }
}

function makeHarness(
  specOverrides: Record<string, unknown>,
  mock: MockRoot
): Harness {
  const viz = new Harness({
    id: 'lifecycle-test',
    category: 'test',
    buildSteps: () => [],
    ...specOverrides,
  } as any);
  (viz as unknown as { root: MockElement | null }).root = mock.root;
  return viz;
}

describe('DeclarativeAlgorithmVisualizer lifecycle hardening', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renderStep 守护主视觉渲染器异常：渲染错误卡片而非向外传播', () => {
    const mock = makeRoot();
    const viz = makeHarness(
      {
        renderCanvas: () => {
          throw new Error('boom-primary');
        },
      },
      mock
    );

    expect(() =>
      viz.callRenderStep({ stepIndex: 1, message: 'x', log: 'y' })
    ).not.toThrow();
    expect(mock.sandbox.innerHTML).toContain('主视觉沙盘');
    expect(mock.sandbox.innerHTML).toContain('boom-primary');
    expect(console.error).toHaveBeenCalled();
  });

  it('renderStep 守护辅助视觉渲染器异常：Card 2 显示错误卡片', () => {
    const mock = makeRoot();
    const viz = makeHarness(
      {
        renderCanvas: () => {},
        renderCustomMetrics: () => {
          throw new Error('boom-aux');
        },
      },
      mock
    );

    expect(() =>
      viz.callRenderStep({ stepIndex: 1, message: 'x', log: 'y' })
    ).not.toThrow();
    expect(mock.metrics.innerHTML).toContain('辅助视觉');
    expect(mock.metrics.innerHTML).toContain('boom-aux');
  });

  it('空步骤序列：start() 渲染可见诊断而非静默白板', async () => {
    const mock = makeRoot();
    const viz = makeHarness({ buildSteps: () => [] }, mock);

    await viz.callStart();

    expect(viz.stepCount).toBe(0);
    expect(mock.sandbox.innerHTML).toContain('未生成任何推演步骤');
    expect(mock.live.textContent).toContain('步骤序列为空');
  });

  it('buildSteps 返回 null：回退空数组且渲染空诊断，管道不崩溃', async () => {
    const mock = makeRoot();
    const viz = makeHarness({ buildSteps: () => null as any }, mock);

    await viz.callStart();

    expect(viz.stepCount).toBe(0);
    expect(mock.sandbox.innerHTML).toContain('未生成任何推演步骤');
  });

  it('正常路径：有步骤时不注入空诊断', async () => {
    const mock = makeRoot();
    const renderCanvas = vi.fn();
    const viz = makeHarness(
      {
        renderCanvas,
        buildSteps: () => [{ stepIndex: 1, totalSteps: 1, message: 'ok', log: 'ok' }],
      },
      mock
    );

    await viz.callStart();

    expect(viz.stepCount).toBe(1);
    expect(renderCanvas).toHaveBeenCalled();
    expect(mock.sandbox.innerHTML).not.toContain('未生成任何推演步骤');
  });
});
