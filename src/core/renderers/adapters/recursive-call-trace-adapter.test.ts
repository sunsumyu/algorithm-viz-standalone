// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  RecursiveCallTraceAdapter,
  CallTraceSnapshot,
} from './recursive-call-trace-adapter';
import { buildTreeFromArr } from '../../../algorithms/categories/tree/tree-template';
import { buildMinDepthStage1Steps } from '../../../algorithms/categories/tree/min-depth-renderer';

describe('RecursiveCallTraceAdapter (Deep Module)', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    // jsdom does not implement scrollIntoView by default
    window.HTMLElement.prototype.scrollIntoView = () => {};
  });

  it('空快照时应渲染优雅的占位提示', () => {
    RecursiveCallTraceAdapter.render(container, null);
    expect(container.textContent).toContain('准备递归推演');
  });

  it('能正确渲染多层缩进调用树与分支线', () => {
    const snapshot: CallTraceSnapshot = {
      lines: [
        { id: 'l1', depth: 0, text: 'minDepth(1)', kind: 'header', comment: '<- 最终要算这个' },
        { id: 'l2', depth: 0, text: '① root=1, 非空', kind: 'condition-pass' },
        { id: 'l3', depth: 1, text: 'minDepth(2)', kind: 'header', comment: '<- 先算左边' },
        { id: 'l4', depth: 1, text: '③ root.left == null √ 命中!', kind: 'condition-hit' },
        { id: 'l5', depth: 1, text: '回到 minDepth(2): return 1 + 1 = 2', kind: 'unwind-calc' },
      ],
      activeLineId: 'l4',
      finalResult: 2,
    };

    RecursiveCallTraceAdapter.render(container, snapshot);
    const rendered = container.innerHTML;
    expect(rendered).toContain('minDepth(1)');
    expect(rendered).toContain('&lt;- 最终要算这个');
    expect(rendered).toContain('minDepth(2)');
    expect(rendered).toContain('√ 命中!');
    expect(rendered).toContain('rct-active-line');
  });

  it('多级深度应输出精确的树干连线与缩进', () => {
    const snapshot: CallTraceSnapshot = {
      lines: [
        { id: 'l1', depth: 0, text: 'minDepth(1)', kind: 'header' },
        { id: 'l2', depth: 1, text: 'minDepth(2)', kind: 'header' },
        { id: 'l3', depth: 2, text: 'minDepth(4)', kind: 'header' },
        { id: 'l4', depth: 2, text: '返回 1 ---', kind: 'return-leaf' },
      ],
      activeLineId: 'l4',
    };

    RecursiveCallTraceAdapter.render(container, snapshot);
    const lines = container.querySelectorAll('.rct-line');
    expect(lines.length).toBe(4);
    expect(lines[3].classList.contains('rct-active-line')).toBe(true);
  });

  it('buildMinDepthStage1Steps 应针对四节点用例 [1, 2, 3, null, 4] 准确产出截图所示的调用追踪全貌', () => {
    const root = buildTreeFromArr([1, 2, 3, null, 4]);
    const steps = buildMinDepthStage1Steps(root);

    // 验证每一步均注入 callTrace 且具备 activeLineId
    steps.forEach((step, idx) => {
      expect(step.callTrace, `Step ${idx} 必须具备 callTrace`).toBeDefined();
      expect(step.callTrace?.activeLineId, `Step ${idx} 必须具备 activeLineId`).toBeTruthy();
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.minDepth).toBe(2);

    const traceTexts = lastStep.callTrace!.lines.map((l) => `${l.text} ${l.comment || ''}`.trim());

    // 断言完整覆盖用户截图中的全部核心生命周期推演节点
    expect(traceTexts.some((t) => t.includes('minDepth(1)') && t.includes('最终要算这个'))).toBe(true);
    expect(traceTexts.some((t) => t.includes('① root=1, 非空'))).toBe(true);
    expect(traceTexts.some((t) => t.includes('② 不是叶子'))).toBe(true);
    expect(traceTexts.some((t) => t.includes('③ left != null'))).toBe(true);
    expect(traceTexts.some((t) => t.includes('④ right != null'))).toBe(true);
    expect(traceTexts.some((t) => t.includes('⑤ 走最后一行'))).toBe(true);

    expect(traceTexts.some((t) => t.includes('minDepth(2)') && t.includes('先算左边'))).toBe(true);
    expect(traceTexts.some((t) => t.includes('① root=2, 非空'))).toBe(true);
    expect(traceTexts.some((t) => t.includes('③ root.left == null √ 命中!'))).toBe(true);
    expect(traceTexts.some((t) => t.includes('minDepth(root.right) + 1'))).toBe(true);

    expect(traceTexts.some((t) => t.includes('minDepth(4)') && t.includes('算2的右孩子'))).toBe(true);
    expect(traceTexts.some((t) => t.includes('① root=4, 非空'))).toBe(true);
    expect(traceTexts.some((t) => t.includes('left==null && right==null √ 命中!'))).toBe(true);
    expect(traceTexts.some((t) => t.includes('|--- 返回 1 ---'))).toBe(true);

    expect(traceTexts.some((t) => t.includes('回到 minDepth(2): return 1 + 1 = 2'))).toBe(true);
    expect(traceTexts.some((t) => t.includes('minDepth(3)') && t.includes('再算右边'))).toBe(true);
    expect(traceTexts.some((t) => t.includes('回到 minDepth(1)'))).toBe(true);
    expect(traceTexts.some((t) => t.includes('最终返回 2'))).toBe(true);
  });
});
