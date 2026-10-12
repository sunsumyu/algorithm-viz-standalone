// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  composeUnifiedCanvas,
  renderFormulaCard,
  renderMetricsGrid,
  createUnifiedCanvasRenderer,
} from './unified-canvas-composer';

describe('UnifiedCanvasComposer (全库统一画布装配器深模块契约测试)', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('完整装配：同时渲染指标卡网格、主沙盘与公式卡片', () => {
    composeUnifiedCanvas(container, {
      metrics: [
        { label: '算法阶段', value: 'Stage 1', color: '#0284c7' },
        { label: '步进指标', value: 42, color: '#059669', subText: '耗时 0.2ms' },
      ],
      mainBoardHtml: '<div id="main-board">Core Topological SandBox</div>',
      formula: {
        title: '核心定理',
        equation: 'E = mc^2',
        explanation: '质能方程推导',
        statusBadge: { text: '计算完成', type: 'success' },
      },
    });

    const root = container.querySelector('.unified-algo-canvas');
    expect(root).toBeTruthy();
    expect(root?.textContent).toContain('算法阶段');
    expect(root?.textContent).toContain('Stage 1');
    expect(root?.textContent).toContain('Core Topological SandBox');
    expect(root?.textContent).toContain('E = mc^2');
    expect(root?.textContent).toContain('计算完成');
  });

  it('自适应降级：无 metrics 和 formula 时依然纯净包裹沙盘', () => {
    composeUnifiedCanvas(container, {
      mainBoardHtml: '<div id="minimal-board">Minimal Board</div>',
    });

    expect(container.innerHTML).toContain('Minimal Board');
    expect(container.querySelectorAll('.dsp-formula-card').length).toBe(0);
  });

  it('高阶工厂 createUnifiedCanvasRenderer 正常工作', () => {
    interface DummyStep {
      val: number;
      phase: string;
    }

    const renderer = createUnifiedCanvasRenderer<DummyStep>((step) => ({
      metrics: [{ label: '数值', value: step.val }],
      mainBoardHtml: `<div>Phase: ${step.phase}</div>`,
    }));

    renderer(container, { val: 100, phase: 'Running' });

    expect(container.textContent).toContain('数值');
    expect(container.textContent).toContain('100');
    expect(container.textContent).toContain('Phase: Running');
  });

  it('renderFormulaCard 独立渲染满足契约规范', () => {
    const html = renderFormulaCard('状态转移', 'dp[i] = dp[i-1] + 1', '线性递推', {
      text: '转移中',
      type: 'warning',
    });
    expect(html).toContain('💡 状态转移');
    expect(html).toContain('dp[i] = dp[i-1] + 1');
    expect(html).toContain('转移中');
  });
});
