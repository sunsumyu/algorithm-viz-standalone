// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { AlgorithmRegistry } from '../../../../core/algorithm-registry';

// 导入批次以触发所有 16 个算法注册
import '../../../batch-29-index';

// 导入所有 step builder 函数
import { buildLevelOrder036Steps } from './level-order-036-renderer';
import { buildZigzag036Steps } from './zigzag-level-order-036-renderer';
import { buildWidth036Steps } from './width-of-binary-tree-036-renderer';
import { buildDepth036Steps } from './depth-of-binary-tree-036-renderer';
import { buildPreorderSerialize036Steps } from './preorder-serialize-036-renderer';
import { buildLevelorderSerialize036Steps } from './levelorder-serialize-036-renderer';
import { buildBuildTree036Steps } from './build-tree-preorder-inorder-036-renderer';
import { buildCompleteness036Steps } from './completeness-binary-tree-036-renderer';
import { buildCountNodes036Steps } from './count-complete-tree-nodes-036-renderer';

import { buildLca037Steps } from './lowest-common-ancestor-037-renderer';
import { buildLcaBst037Steps } from './lowest-common-ancestor-bst-037-renderer';
import { buildPathSumII037Steps } from './path-sum-ii-037-renderer';
import { buildBalancedTree037Steps } from './balanced-binary-tree-037-renderer';
import { buildValidateBst037Steps } from './validate-bst-037-renderer';
import { buildTrimBst037Steps } from './trim-bst-037-renderer';
import { buildHouseRobberIII037Steps } from './house-robber-iii-037-renderer';

const ALL_16_ALGO_IDS = [
  // Class 036 (9题)
  'tree-036-level-order',
  'tree-036-zigzag-level-order',
  'tree-036-width-of-binary-tree',
  'tree-036-depth-of-binary-tree',
  'tree-036-preorder-serialize',
  'tree-036-levelorder-serialize',
  'tree-036-build-tree-preorder-inorder',
  'tree-036-completeness-binary-tree',
  'tree-036-count-complete-tree-nodes',
  // Class 037 (7题)
  'tree-037-lowest-common-ancestor',
  'tree-037-lowest-common-ancestor-bst',
  'tree-037-path-sum-ii',
  'tree-037-balanced-binary-tree',
  'tree-037-validate-bst',
  'tree-037-trim-bst',
  'tree-037-house-robber-iii',
];

describe('Class 036 & Class 037 二叉树高频题专题全量算法测试', () => {
  const registry = AlgorithmRegistry.getInstance();

  it('1. 所有 16 道二叉树算法已全部在注册中心成功注册', () => {
    for (const id of ALL_16_ALGO_IDS) {
      const manifest = registry.getManifest(id);
      expect(manifest, `Manifest ${id} 必须已注册`).toBeDefined();
      expect(manifest?.name).toBeDefined();
      expect(manifest?.category).toBe('tree');
    }
  });

  it('2. 验证 Class 036 的 9 个 Step 生成函数与状态转移正确性', () => {
    const s1 = buildLevelOrder036Steps();
    expect(s1.length).toBeGreaterThanOrEqual(5);
    expect(s1[s1.length - 1].decision).toContain('遍历全部完成');

    const s2 = buildZigzag036Steps();
    expect(s2.length).toBeGreaterThanOrEqual(5);
    expect(s2[s2.length - 1].decision).toContain('锯齿形层序遍历完成');

    const s3 = buildWidth036Steps();
    expect(s3.length).toBeGreaterThanOrEqual(4);
    expect(s3[s3.length - 1].metrics?.['最终最大宽度 maxWidth']).toBe(4);

    const s4 = buildDepth036Steps();
    expect(s4.length).toBeGreaterThanOrEqual(5);
    expect(s4[s4.length - 1].metrics?.['最终最小深度']).toBe(2);

    const s5 = buildPreorderSerialize036Steps();
    expect(s5.length).toBeGreaterThanOrEqual(5);
    expect(s5[s5.length - 1].metrics?.['最终根节点']).toBe('TreeNode(1)');

    const s6 = buildLevelorderSerialize036Steps();
    expect(s6.length).toBeGreaterThanOrEqual(5);
    expect(s6[s6.length - 1].metrics?.['按层序列结果']).toBeDefined();

    const s7 = buildBuildTree036Steps();
    expect(s7.length).toBeGreaterThanOrEqual(5);
    expect(s7[s7.length - 1].metrics?.['总节点数']).toBe(5);

    const s8 = buildCompleteness036Steps();
    expect(s8.length).toBeGreaterThanOrEqual(5);
    expect(s8[s8.length - 1].metrics?.['判定结果']).toContain('TRUE');

    const s9 = buildCountNodes036Steps();
    expect(s9.length).toBeGreaterThanOrEqual(5);
    expect(s9[s9.length - 1].metrics?.['最终结果']).toBe(6);
  });

  it('3. 验证 Class 037 的 7 个 Step 生成函数与状态转移正确性', () => {
    const s1 = buildLca037Steps();
    expect(s1.length).toBeGreaterThanOrEqual(4);
    expect(s1[s1.length - 1].metrics?.['最终结果']).toBe('TreeNode(3)');

    const s2 = buildLcaBst037Steps();
    expect(s2.length).toBeGreaterThanOrEqual(4);
    expect(s2[s2.length - 1].metrics?.['分叉节点 (LCA)']).toBe('节点 4');

    const s3 = buildPathSumII037Steps();
    expect(s3.length).toBeGreaterThanOrEqual(5);
    expect(s3[s3.length - 1].metrics?.['有效路径数']).toBe(1);

    const s4 = buildBalancedTree037Steps();
    expect(s4.length).toBeGreaterThanOrEqual(5);
    expect(s4[s4.length - 1].metrics?.['整树平衡判定']).toContain('TRUE');

    const s5 = buildValidateBst037Steps();
    expect(s5.length).toBeGreaterThanOrEqual(5);
    expect(s5[s5.length - 1].metrics?.['判定结果']).toContain('TRUE');

    const s6 = buildTrimBst037Steps();
    expect(s6.length).toBeGreaterThanOrEqual(5);
    expect(s6[s6.length - 1].metrics?.['最终节点数']).toBe(3);

    const s7 = buildHouseRobberIII037Steps();
    expect(s7.length).toBeGreaterThanOrEqual(5);
    expect(s7[s7.length - 1].metrics?.['全树最优窃取金额']).toBe(7);
  });

  it('4. 验证所有 16 道算法各语言代码行号均属于合法 1-based 范围', () => {
    for (const id of ALL_16_ALGO_IDS) {
      const manifest = registry.getManifest(id);
      expect(manifest).toBeDefined();
      const visualizer = new manifest!.Visualizer();
      const codeLangs = (visualizer as any).spec?.codeLanguages;
      expect(codeLangs, `算法 ${id} codeLanguages 必须定义`).toBeDefined();

      const steps = (visualizer as any).spec.generateSteps({});
      expect(steps.length).toBeGreaterThan(0);

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const codeLine = step.codeLine;
        expect(codeLine, `算法 ${id} 第 ${i} 步的 codeLine 必须定义`).toBeDefined();

        if (typeof codeLine === 'number') {
          expect(codeLine).toBeGreaterThan(0);
        } else if (typeof codeLine === 'object' && codeLine !== null) {
          for (const [lang, line] of Object.entries(codeLine)) {
            const linesOfCode = codeLangs[lang as keyof typeof codeLangs];
            if (linesOfCode) {
              const totalLines = Array.isArray(linesOfCode)
                ? linesOfCode.length
                : linesOfCode.split('\n').length;
              if (typeof line === 'number') {
                expect(line, `算法 ${id} 第 ${i} 步语言 ${lang} 行号 ${line} 必须在 1~${totalLines} 范围内`).toBeGreaterThanOrEqual(1);
                expect(line, `算法 ${id} 第 ${i} 步语言 ${lang} 行号 ${line} 必须在 1~${totalLines} 范围内`).toBeLessThanOrEqual(totalLines);
              }
            }
          }
        }
      }
    }
  });

  it('5. 验证所有 16 道算法的 renderCanvas 挂载渲染均正常，无报错且 DOM 结构饱满', () => {
    const container = document.createElement('div');
    for (const id of ALL_16_ALGO_IDS) {
      const manifest = registry.getManifest(id);
      expect(manifest).toBeDefined();
      const visualizer = new manifest!.Visualizer();
      const spec = (visualizer as any).spec;
      const steps = spec.generateSteps({});
      const firstStep = steps[0];
      const lastStep = steps[steps.length - 1];

      // 渲染第一步
      container.innerHTML = '';
      spec.renderCanvas(container, firstStep);
      expect(container.innerHTML.length).toBeGreaterThan(50);
      expect(container.querySelector('svg')).not.toBeNull();

      // 渲染最后一步
      container.innerHTML = '';
      spec.renderCanvas(container, lastStep);
      expect(container.innerHTML.length).toBeGreaterThan(50);
      expect(container.querySelector('svg')).not.toBeNull();
    }
  });
});
