/**
 * 声明式可视化器全量生命周期与无异常渲染守卫测试
 * 自动化测试注册表中的所有算法，验证：
 * 1. 算法元数据完整注册
 * 2. Visualizer 类可正常实例化
 * 3. 针对默认参数 buildSteps() 成功推导出步骤序列
 * 4. 针对所有单步执行 renderCanvas(mockContainer, step) 绝无方法缺失/未定义异常
 */

import { describe, it, expect } from 'vitest';
import { getAllManifests } from '../registry';

// 导入所有分类算法注册文件以触发 registerAlgorithm
import '../../algorithms/categories/stack/bracket-renderer';
import '../../algorithms/categories/stack/eval-rpn-renderer';
import '../../algorithms/categories/stack/remove-adjacent-duplicates-renderer';
import '../../algorithms/categories/stack/implement-queue-using-stack-renderer';
import '../../algorithms/categories/stack/implement-stack-using-queue-renderer';
import '../../algorithms/categories/stack/sliding-window-max-renderer';
import '../../algorithms/categories/stack/top-k-frequent-renderer';

import '../../algorithms/categories/tree/tree-traversal-renderer';
import '../../algorithms/categories/tree/tree-depth-renderer';
import '../../algorithms/categories/tree/tree-invert-renderer';
import '../../algorithms/categories/tree/tree-symmetric-renderer';
import '../../algorithms/categories/tree/valid-bst-renderer';
import '../../algorithms/categories/tree/bst-search-renderer';
import '../../algorithms/categories/tree/path-sum-renderer';
import '../../algorithms/categories/tree/binary-tree-level-renderer';
import '../../algorithms/categories/tree/lca-renderer';
import '../../algorithms/categories/tree/build-tree-renderer';

import '../../algorithms/categories/array/remove-element-renderer';
import '../../algorithms/categories/array/squares-of-sorted-array-renderer';
import '../../algorithms/categories/array/min-subarray-len-renderer';
import '../../algorithms/categories/array/spiral-matrix-ii-renderer';
import '../../algorithms/categories/array/range-sum-renderer';
import '../../algorithms/categories/array/buy-land-renderer';

import '../../algorithms/categories/search/binary-search-renderer';

// 轻量级 DOM Mock 元素
class MockDOMContainer {
  public _innerHTML = '';
  public textContent = '';
  public style: Record<string, string> = {};
  public dataset: Record<string, string> = {};
  public children: MockDOMContainer[] = [];

  constructor(public id: string = '') {}

  public get innerHTML(): string {
    return this._innerHTML;
  }

  public set innerHTML(val: string) {
    this._innerHTML = val;
  }

  public appendChild(child: any): any {
    this.children.push(child);
    this._innerHTML += `<${child.tagName || 'node'}>`;
    return child;
  }

  public setAttribute(_name: string, _val: string) {}

  public closest(_selector: string): MockDOMContainer | null {
    return this;
  }

  public querySelector(_selector: string): MockDOMContainer | null {
    return new MockDOMContainer();
  }

  public querySelectorAll(_selector: string): MockDOMContainer[] {
    return [];
  }
}

// 注入测试用全局 document
(globalThis as any).document = {
  createElement: (tag: string) => new MockDOMContainer(tag),
  createElementNS: (_ns: string, tag: string) => new MockDOMContainer(tag),
};

describe('Declarative Visualizers Full Lifecycle Guard', () => {
  it('所有声明式算法必须能正常实例化并成功执行全部步骤的画布渲染', () => {
    const allAlgos = getAllManifests();
    expect(allAlgos.length).toBeGreaterThan(0);

    for (const algo of allAlgos) {
      expect(algo.id).toBeTruthy();
      expect(algo.name).toBeTruthy();
      expect(algo.Visualizer).toBeDefined();

      const instance = new algo.Visualizer() as any;
      expect(instance).toBeDefined();

      // 如果是 DeclarativeVisualizer，进一步测试其 buildSteps 与 renderCanvas
      if (instance.spec && typeof instance.spec.buildSteps === 'function') {
        const defaultInputs: Record<string, any> = {};
        (instance.spec.inputs || []).forEach((inp: any) => {
          defaultInputs[inp.id] = inp.defaultValue;
        });

        const steps = instance.spec.buildSteps(defaultInputs, instance.currentMode);
        expect(Array.isArray(steps)).toBe(true);
        expect(steps.length).toBeGreaterThan(0);

        if (typeof instance.spec.renderCanvas === 'function') {
          const mockContainer = new MockDOMContainer('dsp-sandbox-container') as unknown as HTMLElement;
          for (let i = 0; i < steps.length; i++) {
            try {
              instance.spec.renderCanvas(mockContainer, steps[i], {
                mode: instance.currentMode,
                currentIndex: i,
              });
            } catch (e: any) {
              throw new Error(`[${algo.id}] renderCanvas failed at step ${i}: ${e?.stack || e}`);
            }
            // 验证沙盘已注入 HTML 文本内容
            expect((mockContainer as any).innerHTML.trim().length).toBeGreaterThan(0);
          }
        }
      }
    }
  });
});
