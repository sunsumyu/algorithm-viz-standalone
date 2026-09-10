import { describe, it, expect, beforeEach } from 'vitest';
import { BacktrackStateSpacePresenter } from './backtrack-state-space-presenter';

class MockElement {
  public innerHTML = '';
  public scrollTop = 0;
  public scrollHeight = 200;
  public children: any[] = [];
  public textContent = '';
  public className = '';
  public dataset: Record<string, string> = {};
  public style: Record<string, string> = {};
  public onclick: (() => void) | null = null;

  constructor(public tagName = 'div') {}

  public querySelectorAll<T = any>(_selector: string): T[] {
    const matches: MockElement[] = [];
    const chipRegex = /class="result-solution-chip"\s+data-index="(\d+)"/g;
    let match;
    while ((match = chipRegex.exec(this.innerHTML)) !== null) {
      const el = new MockElement('button');
      el.className = 'result-solution-chip';
      el.dataset.index = match[1];
      const contentRegex = new RegExp(`data-index="${match[1]}"[^>]*>([\\s\\S]*?)<\\/button>`);
      const cMatch = contentRegex.exec(this.innerHTML);
      el.textContent = cMatch ? cMatch[1] : '';
      matches.push(el);
    }
    return matches as unknown as T[];
  }
}

describe('BacktrackStateSpacePresenter (回溯状态空间与沙盘呈现器测试)', () => {
  let container: MockElement;

  beforeEach(() => {
    container = new MockElement();
  });

  describe('1. renderPathStack (路径栈呈现)', () => {
    it('当路径为空时，显示空路径占位符', () => {
      BacktrackStateSpacePresenter.renderPathStack(container as unknown as HTMLElement, []);
      expect(container.innerHTML).toContain('当前路径栈为空');
    });

    it('当有元素时，正确渲染路径节点和箭头', () => {
      BacktrackStateSpacePresenter.renderPathStack(container as unknown as HTMLElement, [1, 2, 4], { action: 'push' });
      expect(container.innerHTML).toContain('path-stack-node');
      expect(container.innerHTML).toContain('path-node-push');
      expect(container.innerHTML).toContain('>1<');
      expect(container.innerHTML).toContain('>2<');
      expect(container.innerHTML).toContain('>4<');
    });

    it('正确处理 pop 与 collect 动作样式', () => {
      BacktrackStateSpacePresenter.renderPathStack(container as unknown as HTMLElement, [1, 2], { action: 'pop' });
      expect(container.innerHTML).toContain('path-node-pop');

      BacktrackStateSpacePresenter.renderPathStack(container as unknown as HTMLElement, [1, 2, 3], { action: 'collect' });
      expect(container.innerHTML).toContain('path-node-collect');
    });

    it('空容器安全处理', () => {
      expect(() => BacktrackStateSpacePresenter.renderPathStack(null, [1, 2])).not.toThrow();
    });
  });

  describe('2. renderPruningMonitor (剪枝监视器)', () => {
    it('未启用剪枝时显示朴素全搜索提示', () => {
      BacktrackStateSpacePresenter.renderPruningMonitor(container as unknown as HTMLElement, { enabled: false });
      expect(container.innerHTML).toContain('未启用剪枝');
    });

    it('启用剪枝且满足条件时显示剪枝提示与计算公式', () => {
      BacktrackStateSpacePresenter.renderPruningMonitor(container as unknown as HTMLElement, {
        enabled: true,
        conditionMet: true,
        formula: 'i <= n - (k - path.size()) + 1',
        remainingCapacity: 1,
        neededElements: 2,
        message: '剩余可选元素 1 < 还需元素 2，触发剪枝。',
      });
      expect(container.innerHTML).toContain('触发剪枝');
      expect(container.innerHTML).toContain('i <= n - (k - path.size()) + 1');
      expect(container.innerHTML).toContain('剩余可选数');
      expect(container.innerHTML).toContain('还需元素');
    });

    it('启用剪枝且条件合法时显示继续探索状态', () => {
      BacktrackStateSpacePresenter.renderPruningMonitor(container as unknown as HTMLElement, {
        enabled: true,
        conditionMet: false,
      });
      expect(container.innerHTML).toContain('条件合法 (继续探索)');
    });
  });

  describe('3. renderResultCollection (解集收集箱)', () => {
    it('解集为空时显示占位符', () => {
      BacktrackStateSpacePresenter.renderResultCollection(container as unknown as HTMLElement, []);
      expect(container.innerHTML).toContain('暂未找到合法解集');
    });

    it('正确渲染解集徽章', () => {
      const results = [[1, 2], [1, 3], [2, 4]];
      BacktrackStateSpacePresenter.renderResultCollection(container as unknown as HTMLElement, results, 1);

      expect(container.innerHTML).toContain('[1, 2]');
      expect(container.innerHTML).toContain('[1, 3]');
      expect(container.innerHTML).toContain('[2, 4]');
    });
  });

  describe('4. renderVariableWatch (实时变量监控)', () => {
    it('正确渲染变量标签与数值', () => {
      BacktrackStateSpacePresenter.renderVariableWatch(container as unknown as HTMLElement, [
        { label: 'startIndex', value: 2, highlight: true },
        { label: 'target', value: 7 },
      ]);
      expect(container.innerHTML).toContain('startIndex');
      expect(container.innerHTML).toContain('2');
      expect(container.innerHTML).toContain('target');
      expect(container.innerHTML).toContain('7');
    });
  });

  describe('5. renderBacktrackLogStream (回溯日志流)', () => {
    it('空日志安全处理', () => {
      BacktrackStateSpacePresenter.renderBacktrackLogStream(container as unknown as HTMLElement, []);
      expect(container.innerHTML).toContain('暂无执行日志');
    });

    it('正确渲染不同类型的日志标签', () => {
      BacktrackStateSpacePresenter.renderBacktrackLogStream(container as unknown as HTMLElement, [
        { text: '选择 1 入栈', type: 'push' },
        { text: '触发剪枝条件', type: 'prune' },
        { text: '收集解集 [1, 2]', type: 'collect' },
        { text: '回溯撤销 1', type: 'pop' },
      ], 2);

      expect(container.innerHTML).toContain('选择');
      expect(container.innerHTML).toContain('剪枝');
      expect(container.innerHTML).toContain('解集');
      expect(container.innerHTML).toContain('撤销');
    });
  });
});
