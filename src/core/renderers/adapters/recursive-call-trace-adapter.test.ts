// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  RecursiveCallTraceAdapter,
  CallTraceSnapshot,
} from './recursive-call-trace-adapter';

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
});
