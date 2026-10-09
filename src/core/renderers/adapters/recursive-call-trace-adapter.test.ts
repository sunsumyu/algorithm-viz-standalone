// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  RecursiveCallTraceAdapter,
  RecursiveCallTraceBuilder,
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
    expect(traceTexts.some((t) => t.includes('命中叶子') || t.includes('root.left == null'))).toBe(true);
    expect(traceTexts.some((t) => t.includes('return 1'))).toBe(true);

    expect(traceTexts.some((t) => t.includes('回到 minDepth(2): return 1 + 1 = 2'))).toBe(true);
    expect(traceTexts.some((t) => t.includes('minDepth(3)') && t.includes('再算右边'))).toBe(true);
    expect(traceTexts.some((t) => t.includes('回到 minDepth(1)'))).toBe(true);
    expect(traceTexts.some((t) => t.includes('最终返回 2'))).toBe(true);
  });

  it('支持浅色模式 (Light Theme) 并使用符合 Card 2 风格的明亮优雅样式', () => {
    const snapshot: CallTraceSnapshot = {
      lines: [
        { id: 'l1', depth: 0, text: 'maxDepth(3)', kind: 'header' },
        { id: 'l2', depth: 1, text: 'return 1 + max(1, 2) = 3', kind: 'unwind-calc' },
      ],
      activeLineId: 'l2',
    };

    RecursiveCallTraceAdapter.render(container, snapshot, { theme: 'light' });
    const terminal = container.querySelector('.rct-terminal-container') as HTMLElement;
    expect(terminal).not.toBeNull();
    expect(terminal.getAttribute('style')).toContain('background: #ffffff');
    expect(terminal.getAttribute('style')).toContain('border: 1px solid #e2e8f0');
    // 浅色模式下不应含有仿 macOS 红黄绿圆点
    expect(terminal.innerHTML).not.toContain('background: #ef4444');
    expect(terminal.innerHTML).not.toContain('background: #020617');
  });

  it('RecursiveCallTraceBuilder 建造者模式应精准构建调用树快照并保证深拷贝隔离', () => {
    const builder = new RecursiveCallTraceBuilder();
    const h1 = builder.addHeader('isSymmetric(root)', 0, '<- 根调用');
    expect(h1).toBe('hdr-1');

    builder.addConditionPass('① root != null', 0);
    const p1 = builder.addRecursePrep('outside = check(left.left, right.right)', 0);
    expect(builder.length).toBe(3);

    const snap1 = builder.snapshot();
    expect(snap1.lines.length).toBe(3);
    expect(snap1.activeLineId).toBe(p1);

    // 追加子调用
    builder.addHeader('check(2, 2)', 1, '<- 深入子节点');
    builder.addConditionHit('① 左右均为空 -> 对称', 1);
    builder.addReturnLeaf('return true', 1);

    const snap2 = builder.snapshot();
    expect(snap2.lines.length).toBe(6);
    // snap1 不应被 snap2 修改（深拷贝不可变契约）
    expect(snap1.lines.length).toBe(3);
  });

  it('应严格呈现图1黄金范式的树形分支连线 (├── 与 └──)、层级导轨、圆点前缀与连通空行', () => {
    const snapshot: CallTraceSnapshot = {
      lines: [
        { id: 'l1', depth: 0, text: 'minDepth(1)', kind: 'header', comment: '<- 最终要算这个' },
        { id: 'l2', depth: 0, text: '• root=1, 非空', kind: 'condition-pass' },
        { id: 'l3', depth: 1, text: 'minDepth(2)', kind: 'header', comment: '<- 先算左边' },
        { id: 'l4', depth: 2, text: 'minDepth(4)', kind: 'header', comment: '<- 算2的右孩子' },
        { id: 'l5', depth: 2, text: '返回 1', kind: 'return-leaf' },
        { id: 'l6', depth: 1, text: '回到 minDepth(2): return 1 + 1 = 2', kind: 'unwind-calc' },
        { id: 'l7', depth: 1, text: 'minDepth(3)', kind: 'header', comment: '<- 再算右边' },
        { id: 'l8', depth: 0, text: '最终返回 2', kind: 'final-result' },
      ],
      activeLineId: 'l8',
      finalResult: 2,
    };

    RecursiveCallTraceAdapter.render(container, snapshot);

    // 1. 验证左分支为 ├──，独生/末位分支为 └──
    const l3El = container.querySelector('#rct-line-l3');
    expect(l3El?.textContent).toContain('├──');
    expect(l3El?.textContent).toContain('minDepth(2)');

    const l4El = container.querySelector('#rct-line-l4');
    expect(l4El?.textContent).toContain('└──');
    expect(l4El?.textContent).toContain('minDepth(4)');

    const l7El = container.querySelector('#rct-line-l7');
    expect(l7El?.textContent).toContain('└──');
    expect(l7El?.textContent).toContain('minDepth(3)');

    // 2. 验证帧内步具包含圆点 •
    const l2El = container.querySelector('#rct-line-l2');
    expect(l2El?.textContent).toContain('•');

    // 3. 验证叶子返回行具有 └── 分支闭合指示
    const l5El = container.querySelector('#rct-line-l5');
    expect(l5El?.textContent).toContain('└──');
    expect(l5El?.textContent).toContain('返回 1');

    // 4. 验证渲染了用于纵向视觉连通的 spacer 导轨
    const spacers = container.querySelectorAll('.rct-spacer');
    expect(spacers.length).toBeGreaterThan(0);

    // 5. 验证最终结果行包含绿色对勾徽章
    const l8El = container.querySelector('#rct-line-l8');
    expect(l8El?.textContent).toContain('✓');
  });
});

