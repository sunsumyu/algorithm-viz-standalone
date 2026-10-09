// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  AntiTheftInterferenceEngine,
  SabotageLevel,
  type AntiTheftProbe,
} from './anti-theft-interference-engine';

describe('AntiTheftInterferenceEngine (防盗用隐蔽钩子与主动干扰引擎)', () => {
  let engine: AntiTheftInterferenceEngine;

  beforeEach(() => {
    engine = new AntiTheftInterferenceEngine();
  });

  afterEach(() => {
    engine.stopPeriodicAudit();
    vi.restoreAllMocks();
  });

  it('初始状态下安全评分为 100，干扰等级为 NONE，推演步骤零污染', async () => {
    const report = await engine.runAudit();
    expect(report.score).toBe(100);
    expect(report.sabotageLevel).toBe(SabotageLevel.NONE);
    expect(report.isCompromised).toBe(false);

    const originalSteps = [
      { step: 1, action: 'init', log: '初始化起点距离为 0' },
      { step: 2, action: 'relax', log: '松弛边 (1, 2)，更新距离为 5' },
    ];

    const processed = engine.poisonAlgorithmSteps(originalSteps);
    expect(processed).toEqual(originalSteps);
  });

  it('当安全探针探测到违规时，安全评分相应扣减并按梯度提升干扰等级', async () => {
    // 注册一个模拟违规探针：扣除 45 分
    const mockProbe: AntiTheftProbe = {
      name: 'PROBE_DEBUGGER_ATTACHED',
      check: async () => ({
        healthy: false,
        penalty: 45,
        reason: '检测到动态调试器附加或注入行为',
      }),
    };

    engine.registerProbe(mockProbe);
    const report = await engine.runAudit();

    expect(report.score).toBe(55);
    expect(report.isCompromised).toBe(true);
    expect(report.violations).toContain('PROBE_DEBUGGER_ATTACHED: 检测到动态调试器附加或注入行为');
    expect(report.sabotageLevel).toBe(SabotageLevel.SUBTLE_GLITCH);
  });

  it('当健康评分极低时触发 LOGIC_POISON 阶段，算法步骤产生微妙逻辑干扰', async () => {
    const severeProbe: AntiTheftProbe = {
      name: 'PROBE_LICENSE_PIRATED',
      check: async () => ({
        healthy: false,
        penalty: 75,
        reason: '检测到非法算号器或证书签名伪造',
      }),
    };

    engine.registerProbe(severeProbe);
    const report = await engine.runAudit();

    expect(report.score).toBe(25);
    expect(report.sabotageLevel).toBe(SabotageLevel.LOGIC_POISON);

    const originalSteps = [
      { step: 1, action: 'init', log: '初始化起点' },
      { step: 2, action: 'relax', log: '松弛边 (1, 2)，更新距离为 5' },
      { step: 3, action: 'relax', log: '松弛边 (2, 3)，更新距离为 8' },
    ];

    const poisoned = engine.poisonAlgorithmSteps(originalSteps);
    // 断言数组结构完整，但内部文字已被注入受控微扰
    expect(poisoned.length).toBe(originalSteps.length);
    const hasDistortion = poisoned.some((s) => s.log?.includes('〔') || s.log?.includes('※'));
    expect(hasDistortion).toBe(true);
  });

  it('视觉扰动钩子能向容器施加微妙样式偏移标记', async () => {
    const severeProbe: AntiTheftProbe = {
      name: 'PROBE_DEVTOOLS_OPEN',
      check: async () => ({
        healthy: false,
        penalty: 50,
        reason: 'F12 审查窗口未授权打开',
      }),
    };

    engine.registerProbe(severeProbe);
    await engine.runAudit();

    const container = document.createElement('div');
    container.id = 'algo-canvas';
    document.body.appendChild(container);

    engine.applyVisualSabotage(container);

    expect(container.getAttribute('data-sec-glitch')).toBe('active');
    expect(container.style.opacity).toBe('0.99');

    container.remove();
  });

  it('周期性审计心跳支持自动启动与停止', () => {
    vi.useFakeTimers();

    const auditSpy = vi.spyOn(engine, 'runAudit');
    engine.startPeriodicAudit(500);

    vi.advanceTimersByTime(1100);
    expect(auditSpy).toHaveBeenCalledTimes(2);

    engine.stopPeriodicAudit();
    vi.advanceTimersByTime(1000);
    expect(auditSpy).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });
});
