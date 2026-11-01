import { describe, it, expect } from 'vitest';
import { ReturnStepDecorator } from './return-step-decorator';

const mockDom: Record<string, MockElement> = {};

(globalThis as any).document = {
  getElementById: (id: string) => mockDom[id] || null,
  createElement: (tag: string) => new MockElement(tag)
};

class MockElement {
  public innerHTML = '';
  public children: any[] = [];
  public classList = {
    classes: new Set<string>(),
    add(...clsList: string[]) { clsList.forEach(cls => this.classes.add(cls)); },
    remove(...clsList: string[]) { clsList.forEach(cls => this.classes.delete(cls)); },
    contains(cls: string) { return this.classes.has(cls); }
  };
  public className = '';
  public style: Record<string, string> = {};
  public dataset: Record<string, string> = {};
  public textContent = '';
  public parentElement: MockElement | null = null;

  constructor(public tagName = 'div') {}

  public appendChild(child: any) {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }

  public prepend(child: any) {
    child.parentElement = this;
    this.children.unshift(child);
    return child;
  }

  public insertBefore(newNode: any, referenceNode: any) {
    const idx = this.children.indexOf(referenceNode);
    if (idx === -1) this.children.push(newNode);
    else this.children.splice(idx, 0, newNode);
    newNode.parentElement = this;
    return newNode;
  }

  public remove() {
    if (this.parentElement) {
      const idx = this.parentElement.children.indexOf(this);
      if (idx !== -1) this.parentElement.children.splice(idx, 1);
    }
  }

  public querySelectorAll(selector: string): any[] {
    const res: any[] = [];
    const check = (node: any) => {
      const cls = selector.replace(/^\./, '');
      if (node.classList?.contains(cls) || node.className?.includes(cls)) res.push(node);
      node.children?.forEach(check);
    };
    this.children.forEach(check);
    return res;
  }

  public querySelector(selector: string): any | null {
    const cls = selector.replace(/^\./, '');
    const find = (node: any): any | null => {
      if (node !== this && (node.classList?.contains(cls) || node.className?.includes(cls))) return node;
      for (const child of node.children || []) {
        const f = find(child);
        if (f) return f;
      }
      return null;
    };
    return find(this);
  }
}

describe('ReturnStepDecorator (返回帧装饰器顶层深模块)', () => {
  describe('isReturnStep — 返回帧判定唯一事实来源', () => {
    it('空值与普通非返回步必须判定为 false', () => {
      expect(ReturnStepDecorator.isReturnStep(undefined)).toBe(false);
      expect(ReturnStepDecorator.isReturnStep(null)).toBe(false);
      expect(ReturnStepDecorator.isReturnStep({})).toBe(false);
      expect(ReturnStepDecorator.isReturnStep({ action: 'recurse-left', decision: '发起左子树递归调用' })).toBe(false);
      expect(ReturnStepDecorator.isReturnStep({ action: 'compare', message: '比较 dp[i-1][j] 与 dp[i][j]' })).toBe(false);
      expect(ReturnStepDecorator.isReturnStep({ type: 'loop-step', decision: '自增 k' })).toBe(false);
    });

    it('子句级否定守卫：「跳过基底返回」等非返回语义严禁误报', () => {
      // valid-bst null-pass 判空未命中步的真实文案（含"跳过基底返回"）
      expect(ReturnStepDecorator.isReturnStep({
        action: 'null-pass',
        message: '节点 5 非空，跳过基底返回，继续向下执行。',
      })).toBe(false);
      expect(ReturnStepDecorator.isReturnStep({
        decision: '判空未命中，无需返回上一层',
      })).toBe(false);
      // 否定子句不影响同句中真实返回子句的判定
      expect(ReturnStepDecorator.isReturnStep({
        message: '判空未命中；左子树校验通过，返回 true',
      })).toBe(true);
    });

    it('显式标记：isReturn=true 与 flowPhase=backtrack 必须判定为 true', () => {
      expect(ReturnStepDecorator.isReturnStep({ isReturn: true })).toBe(true);
      expect(ReturnStepDecorator.isReturnStep({ flowPhase: 'backtrack' })).toBe(true);
    });

    it('规范 action/phase/type 信号（含 USNE 合成帧）必须判定为 true', () => {
      // USNE synthesizeReturnUnwindFrames 合成的返回现场帧
      expect(ReturnStepDecorator.isReturnStep({ action: 'return-unwind', phase: 'recurse-return' })).toBe(true);
      // 既有子调用完成动作
      expect(ReturnStepDecorator.isReturnStep({ action: 'left-done' })).toBe(true);
      expect(ReturnStepDecorator.isReturnStep({ action: 'right-done' })).toBe(true);
      // 旧路径 grid-DP 信号
      expect(ReturnStepDecorator.isReturnStep({ type: 'branch-return' })).toBe(true);
      expect(ReturnStepDecorator.isReturnStep({ type: 'combine' })).toBe(true);
      expect(ReturnStepDecorator.isReturnStep({ flowPhase: 'backtrack', type: 'transition' })).toBe(true);
    });

    it('调用帧排除：聚焦递归调用的压栈下行帧严禁因行文内嵌 return 源码而误判', () => {
      // USNE 聚焦递归调用帧：decision 内嵌 "return isValidBST(root.right)" 源码文本
      expect(ReturnStepDecorator.isReturnStep({
        action: 'recurse-right',
        focusMode: 'recursive-call',
        decision: '深入右子树递归：return isValidBST(root.right) (聚焦递归调用)',
      })).toBe(false);
      expect(ReturnStepDecorator.isReturnStep({
        focusTarget: '@recursive-call',
        message: '高亮块移动至行内递归函数调用',
      })).toBe(false);
    });

    it('文本兜底（与 StepNormalizationEngine 启发式一致）必须判定为 true', () => {
      expect(ReturnStepDecorator.isReturnStep({
        decision: '↩ 子调用完成并返回，恢复父节点 1 执行现场',
      })).toBe(true);
      expect(ReturnStepDecorator.isReturnStep({
        message: '左子树校验通过，返回 true',
      })).toBe(true);
      expect(ReturnStepDecorator.isReturnStep({
        log: 'return to node 1',
      })).toBe(true);
    });
  });

  describe('applyReturnBadge — 活跃行返回徽章挂载', () => {
    it('应将徽章插入行号与代码文本之间，且幂等不重复挂载', () => {
      const line = new MockElement('div');
      line.classList.add('code-line', 'algo-code-line');
      const numEl = new MockElement('span');
      numEl.className = 'code-line-num algo-code-line-number';
      line.appendChild(numEl);
      const textEl = new MockElement('span');
      textEl.className = 'code-line-text algo-code-line-text';
      line.appendChild(textEl);

      ReturnStepDecorator.applyReturnBadge(line as any);
      const icon = line.querySelector('.code-return-icon');
      expect(icon).not.toBeNull();
      expect(icon.textContent).toContain('↩');
      // 徽章位于行号之后、代码文本之前（对齐黄金基准设计）
      expect(line.children.indexOf(icon)).toBeGreaterThan(line.children.indexOf(numEl));
      expect(line.children.indexOf(icon)).toBeLessThan(line.children.indexOf(textEl));

      // 幂等：重复挂载不产生第二个徽章
      ReturnStepDecorator.applyReturnBadge(line as any);
      expect(line.querySelectorAll('.code-return-icon').length).toBe(1);
    });

    it('无代码文本子元素时应兜底 prepend 到行首（旧路径兼容）', () => {
      const line = new MockElement('div');
      line.classList.add('code-line');
      ReturnStepDecorator.applyReturnBadge(line as any);
      const icon = line.querySelector('.code-return-icon');
      expect(icon).not.toBeNull();
      expect(line.children[0]).toBe(icon);
    });

    it('null 行必须安全无操作', () => {
      expect(() => ReturnStepDecorator.applyReturnBadge(null)).not.toThrow();
    });
  });

  describe('clearReturnBadges — 全容器徽章与返回行标记清理', () => {
    it('必须同时清除全部 code-return-icon 徽章与 return-line 类', () => {
      const container = new MockElement('div');
      const lineA = new MockElement('div');
      lineA.classList.add('code-line', 'return-line');
      const iconA = new MockElement('span');
      iconA.className = 'code-return-icon';
      lineA.appendChild(iconA);
      const lineB = new MockElement('div');
      lineB.classList.add('code-line', 'active-line');
      container.appendChild(lineA);
      container.appendChild(lineB);

      ReturnStepDecorator.clearReturnBadges(container as any);

      expect(lineA.querySelector('.code-return-icon')).toBeNull();
      expect(lineA.classList.contains('return-line')).toBe(false);
      expect(lineB.classList.contains('return-line')).toBe(false);
      expect(lineB.classList.contains('active-line')).toBe(true);
    });

    it('null 容器必须安全无操作', () => {
      expect(() => ReturnStepDecorator.clearReturnBadges(null)).not.toThrow();
    });
  });
});
