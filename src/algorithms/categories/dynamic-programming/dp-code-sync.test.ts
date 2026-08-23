import { describe, it, expect, beforeEach } from 'vitest';
import { CodePanel } from '../../../core/code-panel';
import { LINEAR_DP_CODES, arrayLinearSteps, linearSteps } from './dp-generated-renderers';

class MockHTMLElement {
  public tagName: string;
  public className = '';
  private _innerHTML = '';
  public get innerHTML(): string {
    return this._innerHTML;
  }
  public set innerHTML(val: string) {
    this._innerHTML = val;
    if (val === '') {
      this.children = [];
    }
  }
  public value = '';
  private _textContent = '';
  public get textContent(): string {
    if (this.children.length > 0) {
      return this.children.map((c) => c.textContent).join('');
    }
    return this._textContent;
  }
  public set textContent(val: string) {
    this._textContent = val;
  }
  public style: Record<string, string> = {};
  public dataset: Record<string, string> = {};
  public children: MockHTMLElement[] = [];
  public parentElement: MockHTMLElement | null = null;
  public title = '';
  private listeners: Record<string, Array<() => void>> = {};

  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
  }

  appendChild<T extends MockHTMLElement>(child: T): T {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }

  removeChild<T extends MockHTMLElement>(child: T): T {
    const idx = this.children.indexOf(child);
    if (idx !== -1) this.children.splice(idx, 1);
    return child;
  }

  get classList() {
    const self = this;
    return {
      add(...cls: string[]) {
        const set = new Set(self.className.split(' ').filter(Boolean));
        cls.forEach((c) => set.add(c));
        self.className = Array.from(set).join(' ');
      },
      remove(...cls: string[]) {
        const set = new Set(self.className.split(' ').filter(Boolean));
        cls.forEach((c) => set.delete(c));
        self.className = Array.from(set).join(' ');
      },
      toggle(cls: string, force?: boolean) {
        const set = new Set(self.className.split(' ').filter(Boolean));
        const shouldAdd = force !== undefined ? force : !set.has(cls);
        if (shouldAdd) set.add(cls);
        else set.delete(cls);
        self.className = Array.from(set).join(' ');
        return shouldAdd;
      },
      contains(cls: string) {
        return self.className.split(' ').includes(cls);
      },
    };
  }

  addEventListener(event: string, handler: () => void) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(handler);
  }

  removeEventListener(event: string, handler: () => void) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((h) => h !== handler);
  }

  dispatchEvent(event: { type: string }) {
    (this.listeners[event.type] || []).forEach((h) => h());
  }

  click() {
    this.dispatchEvent({ type: 'click' });
  }

  querySelector(selector: string): MockHTMLElement | null {
    const match = this.matchSelector(selector);
    if (match) return match;
    for (const child of this.children) {
      const res = child.querySelector(selector);
      if (res) return res;
    }
    return null;
  }

  querySelectorAll(selector: string): MockHTMLElement[] {
    const results: MockHTMLElement[] = [];
    if (this.matchSelector(selector)) results.push(this);
    for (const child of this.children) {
      results.push(...child.querySelectorAll(selector));
    }
    return results;
  }

  public id = '';

  private matchSelector(selector: string): MockHTMLElement | null {
    if (selector.startsWith('#')) {
      const id = selector.slice(1);
      return this.id === id ? this : null;
    }
    if (selector.startsWith('.')) {
      const cls = selector.slice(1);
      return this.classList.contains(cls) ? this : null;
    }
    if (selector.startsWith('[')) {
      const match = selector.match(/\[([a-zA-Z0-9_-]+)(?:=["']?([^"']*)["']?)?\]/);
      if (match) {
        const attr = match[1];
        const val = match[2];
        if (attr.startsWith('data-')) {
          const key = attr.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
          if (val === undefined) return this.dataset[key] !== undefined ? this : null;
          return this.dataset[key] === val ? this : null;
        }
      }
      return null;
    }
    return this.tagName.toLowerCase() === selector.toLowerCase() ? this : null;
  }

  scrollIntoView() {}
}

(globalThis as any).document = {
  createElement: (tag: string) => new MockHTMLElement(tag),
};
(globalThis as any).window = globalThis;

describe('DP Code Sync & Multi-Language Loop Execution Alignment', () => {
  let container: any;

  beforeEach(() => {
    container = (globalThis as any).document.createElement('div');
  });

  it('supports multi-language dictionary HighlightTarget in CodePanel', () => {
    const javaCode = [
      'class Solution {',
      '    public int minCostClimbingStairs(int[] cost) {',
      '        int n = cost.length;',
      '        int[] dp = new int[n + 1];',
      '        dp[0] = 0;',
      '        dp[1] = 0;',
      '        for (int i = 2; i <= n; i++) {',
      '            dp[i] = Math.min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2]);',
      '        }',
      '        return dp[n];',
      '    }',
      '}',
    ];

    const jsCode = [
      'function minCostClimbingStairs(cost) {',
      '    const n = cost.length;',
      '    const dp = new Array(n + 1).fill(0);',
      '    dp[0] = 0;',
      '    dp[1] = 0;',
      '    for (let i = 2; i <= n; i++) {',
      '        dp[i] = Math.min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2]);',
      '    }',
      '    return dp[n];',
      '}',
    ];

    const panel = new CodePanel(container, {
      lines: javaCode,
      language: 'java',
      languages: {
        java: javaCode,
        javascript: jsCode,
      },
    });

    // In Java: loop body is line 8, loop header is line 7
    // In JS: loop body is line 7, loop header is line 6
    const multiLangTarget = {
      java: { primary: 8, context: 7 },
      javascript: { primary: 7, context: 6 },
    };

    panel.highlight(multiLangTarget as any);

    const lineElements = container.querySelectorAll('.algo-code-line');
    expect(lineElements.length).toBe(javaCode.length);
    // Line 8 in Java (index 7) should have is-active
    expect(lineElements[7].classList.contains('is-active')).toBe(true);
    // Line 7 in Java (index 6) should have is-context
    expect(lineElements[6].classList.contains('is-context')).toBe(true);
    // Line 6 in Java (index 5) should NOT have is-active or is-context
    expect(lineElements[5].classList.contains('is-active')).toBe(false);
    expect(lineElements[5].classList.contains('is-context')).toBe(false);

    // Switch to javascript
    (panel as any).switchLanguage('javascript');
    const jsLineElements = container.querySelectorAll('.algo-code-line');
    expect(jsLineElements.length).toBe(jsCode.length);
    // Line 7 in JS (index 6) should have is-active
    expect(jsLineElements[6].classList.contains('is-active')).toBe(true);
    // Line 6 in JS (index 5) should have is-context
    expect(jsLineElements[5].classList.contains('is-context')).toBe(true);

    panel.destroy();
  });

  it('supports semantic anchor string and object targets in CodePanel with automatic multi-language switching', () => {
    const rawJava = [
      'class Solution {',
      '    public int uniquePaths(int m, int n) { // @step:entry',
      '        int[] dp = new int[n]; // @step:init',
      '        Arrays.fill(dp, 1);',
      '        for (int i = 1; i < m; i++) { // @step:loop-outer',
      '            for (int j = 1; j < n; j++) { // @step:loop-inner',
      '                dp[j] += dp[j - 1]; // @step:update',
      '            }',
      '        }',
      '        return dp[n - 1]; // @step:return',
      '    }',
      '}',
    ];

    const rawJs = [
      'function uniquePaths(m, n) { // @step:entry',
      '    const dp = new Array(n).fill(1); // @step:init',
      '    for (let i = 1; i < m; i++) { // @step:loop-outer',
      '        for (let j = 1; j < n; j++) { // @step:loop-inner',
      '            dp[j] += dp[j - 1]; // @step:update',
      '        }',
      '    }',
      '    return dp[n - 1]; // @step:return',
      '}',
    ];

    const panel = new CodePanel(container, {
      lines: rawJava,
      language: 'java',
      languages: {
        java: rawJava,
        javascript: rawJs,
      },
      algoKey: 'test-unique-paths-anchors',
    });

    // 1. Highlighting 'update' in Java should highlight line 7 (0-based index 6)
    panel.highlight('update');
    let lineElements = container.querySelectorAll('.algo-code-line');
    expect(lineElements[6].classList.contains('is-active')).toBe(true);

    // 2. Highlighting 'return' in Java should highlight line 10 (0-based index 9)
    panel.highlight({ anchor: 'return' });
    expect(lineElements[9].classList.contains('is-active')).toBe(true);

    // 3. Switch language to Javascript: 'return' should automatically re-evaluate to JS line 8 (0-based index 7)
    (panel as any).switchLanguage('javascript');
    lineElements = container.querySelectorAll('.algo-code-line');
    expect(lineElements[7].classList.contains('is-active')).toBe(true);

    // 4. Highlight 'update' in Javascript should highlight JS line 5 (0-based index 4)
    panel.highlight('update');
    expect(lineElements[4].classList.contains('is-active')).toBe(true);

    panel.destroy();
  });

  it('generates strict line-by-line execution steps for min-cost climbing stairs starting at function entry', () => {
    const root = (globalThis as any).document.createElement('div');
    const input = (globalThis as any).document.createElement('input');
    input.id = 'dp-input-nums';
    input.dataset.prop = 'nums';
    input.value = '10,15,20';
    root.appendChild(input);

    const steps = arrayLinearSteps(root, 'min-cost');
    // Step 0: Function Entry (Java Line 2, JS Line 1)
    // Step 1: dp[0] = 0 (Java Line 5, JS Line 4)
    // Step 2: dp[1] = 0 (Java Line 6, JS Line 5)
    // Step 3: for i = 2 condition check (Java Line 7, JS Line 6)
    // Step 4: dp[2] = Math.min(...) (Java Line 8, JS Line 7)
    // Step 5: for i = 3 condition check (Java Line 7, JS Line 6)
    // Step 6: dp[3] = Math.min(...) (Java Line 8, JS Line 7)
    // Step 7: for i = 4 condition check loop exit (Java Line 7, JS Line 6)
    // Step 8: return dp[3] (Java Line 10, JS Line 9)
    expect(steps.length).toBe(9);

    // Step 0: Function entry
    const step0 = steps[0];
    const target0 = step0.codeLine as any;
    expect(target0.java).toBe(2);
    expect(target0.javascript).toBe(1);

    // Step 1: dp[0] = 0
    const step1 = steps[1];
    const target1 = step1.codeLine as any;
    expect(target1.java).toBe(5);
    expect(target1.javascript).toBe(4);

    // Step 2: dp[1] = 0
    const step2 = steps[2];
    const target2 = step2.codeLine as any;
    expect(target2.java).toBe(6);
    expect(target2.javascript).toBe(5);

    // Step 3: for loop check (i = 2)
    const step3 = steps[3];
    const target3 = step3.codeLine as any;
    expect(target3.java).toBe(7);
    expect(target3.javascript).toBe(6);

    // Step 4: loop body calculation (i = 2)
    const step4 = steps[4];
    const target4 = step4.codeLine as any;
    expect(target4.java).toBe(8);
    expect(target4.javascript).toBe(7);

    // Step 5: for loop check (i = 3)
    const step5 = steps[5];
    const target5 = step5.codeLine as any;
    expect(target5.java).toBe(7);
    expect(target5.javascript).toBe(6);

    // Step 6: loop body calculation (i = 3)
    const step6 = steps[6];
    const target6 = step6.codeLine as any;
    expect(target6.java).toBe(8);
    expect(target6.javascript).toBe(7);

    // Step 7: for loop exit (i = 4)
    const step7 = steps[7];
    const target7 = step7.codeLine as any;
    expect(target7.java).toBe(7);
    expect(target7.javascript).toBe(6);

    // Step 8: return dp[n]
    const step8 = steps[8];
    const target8 = step8.codeLine as any;
    expect(target8.java).toBe(10);
    expect(target8.javascript).toBe(9);
  });

  it('generates accurate line-by-line steps for climb-stairs and fibonacci starting at function entry', () => {
    const root = (globalThis as any).document.createElement('div');
    const input = (globalThis as any).document.createElement('input');
    input.id = 'dp-input-n';
    input.dataset.prop = 'n';
    input.value = '4';
    root.appendChild(input);

    const climbSteps = linearSteps(root, 'climb');
    // Function entry (Step 0: Java Line 2), dp[1]=1, dp[2]=2, (for i=3, body i=3), (for i=4, body i=4), for exit, return -> 9 steps
    expect(climbSteps.length).toBe(9);
    // Check Step 0: Function entry
    const climbEntry = climbSteps[0].codeLine as any;
    expect(climbEntry.java).toBe(2);
    expect(climbEntry.javascript).toBe(1);

    // Check first for condition step (Step 3)
    const climbFor = climbSteps[3].codeLine as any;
    expect(climbFor.java).toBe(7);
    // Check first body step (Step 4)
    const climbBody = climbSteps[4].codeLine as any;
    expect(climbBody.java).toBe(8);

    const fibSteps = linearSteps(root, 'fibonacci');
    // Function entry (Step 0: Java Line 2), dp[0]=0, dp[1]=1, (for i=2, body i=2), (for i=3, body i=3), (for i=4, body i=4), for exit, return -> 11 steps
    expect(fibSteps.length).toBe(11);
    const fibEntry = fibSteps[0].codeLine as any;
    expect(fibEntry.java).toBe(2);
    expect(fibEntry.javascript).toBe(1);

    const fibFor = fibSteps[3].codeLine as any;
    expect(fibFor.java).toBe(7);
    const fibBody = fibSteps[4].codeLine as any;
    expect(fibBody.java).toBe(8);
  });

  it('initializes DP array with uncomputed placeholders and positions character at ground on Step 0 for min-cost', () => {
    const root = (globalThis as any).document.createElement('div');
    const input = (globalThis as any).document.createElement('input');
    input.id = 'dp-input-array';
    input.dataset.prop = 'array';
    input.value = '10, 15, 20';
    root.appendChild(input);

    const steps = arrayLinearSteps(root, 'min-cost');
    expect(steps.length).toBeGreaterThan(5);

    // Step 0: Function entry
    const step0 = steps[0];
    expect(step0.dp1d).toEqual(['-', '-', '-', '-']);
    expect(step0.staircase?.characterPosition).toBe(-1);
    expect(step0.metrics?.i).toBe('-');

    // Step 1: dp[0] = 0
    const step1 = steps[1];
    expect(step1.dp1d).toEqual([0, '-', '-', '-']);
    expect(step1.staircase?.characterPosition).toBe(0);

    // Step 2: dp[1] = 0
    const step2 = steps[2];
    expect(step2.dp1d).toEqual([0, 0, '-', '-']);
    expect(step2.staircase?.characterPosition).toBe(1);

    // Step 4: dp[2] calculated
    const step4 = steps[4];
    expect(step4.dp1d).toEqual([0, 0, 10, '-']);
  });

  it('maintains fixed, persistent variables across all steps in min-cost, climb-stairs, fibonacci, and decode-ways', () => {
    const root = (globalThis as any).document.createElement('div');
    const inputArr = (globalThis as any).document.createElement('input');
    inputArr.id = 'dp-input-array';
    inputArr.dataset.prop = 'array';
    inputArr.value = '10, 15, 20';
    root.appendChild(inputArr);

    const minCostSteps = arrayLinearSteps(root, 'min-cost');
    for (const step of minCostSteps) {
      expect(step.vars).toBeDefined();
      const varNames = step.vars!.map((v) => v.name);
      expect(varNames).toContain('cost (台阶花费)');
      expect(varNames).toContain('n (楼顶台阶)');
      expect(varNames).toContain('dp (花费数组)');
      expect(varNames).toContain('i (当前台阶)');
    }

    const inputN = (globalThis as any).document.createElement('input');
    inputN.id = 'dp-input-n';
    inputN.dataset.prop = 'n';
    inputN.value = '4';
    root.appendChild(inputN);

    const climbSteps = linearSteps(root, 'climb');
    for (const step of climbSteps) {
      expect(step.vars).toBeDefined();
      const varNames = step.vars!.map((v) => v.name);
      expect(varNames).toContain('n (目标台阶)');
      expect(varNames).toContain('dp (方案总数数组)');
      expect(varNames).toContain('i (当前计算台阶)');
    }

    const fibSteps = linearSteps(root, 'fibonacci');
    for (const step of fibSteps) {
      expect(step.vars).toBeDefined();
      const varNames = step.vars!.map((v) => v.name);
      expect(varNames).toContain('n (目标项)');
      expect(varNames).toContain('dp (斐波那契数组)');
      expect(varNames).toContain('i (当前计算项)');
    }
  });
});

