// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  buildMergeTreesDfsSteps,
  buildMergeTreesBfsSteps,
  buildMergeTreesSteps,
  parseTreeInput,
} from './merge-trees-renderer';
import {
  MERGE_TREES_STAGE1_CODES,
  MERGE_TREES_STAGE2_CODES,
} from './merge-trees-stage-codes';

function assertCodeLineWithinBounds(
  codeLine: any,
  codes: Record<string, string[] | string>,
  stepDesc: string
) {
  if (!codeLine) return;

  for (const [lang, rawCode] of Object.entries(codes)) {
    const lines = Array.isArray(rawCode)
      ? rawCode
      : typeof rawCode === 'string'
      ? rawCode.split('\n')
      : [];
    const lineCount = lines.length;
    if (lineCount === 0) continue;

    if (typeof codeLine === 'number') {
      expect(
        codeLine,
        `${stepDesc}: scalar codeLine ${codeLine} exceeds ${lang} line count ${lineCount}`
      ).toBeLessThanOrEqual(lineCount);
      expect(
        codeLine,
        `${stepDesc}: scalar codeLine ${codeLine} must be >= 1 for ${lang}`
      ).toBeGreaterThanOrEqual(1);
    } else if (Array.isArray(codeLine)) {
      for (const line of codeLine) {
        expect(
          line,
          `${stepDesc}: array codeLine ${line} exceeds ${lang} line count ${lineCount}`
        ).toBeLessThanOrEqual(lineCount);
        expect(
          line,
          `${stepDesc}: array codeLine ${line} must be >= 1 for ${lang}`
        ).toBeGreaterThanOrEqual(1);
      }
    } else if (typeof codeLine === 'object' && codeLine !== null) {
      const target = codeLine[lang];
      if (target != null) {
        expect(
          target,
          `${stepDesc}: dict codeLine[${lang}]=${target} exceeds line count ${lineCount}`
        ).toBeLessThanOrEqual(lineCount);
        expect(
          target,
          `${stepDesc}: dict codeLine[${lang}]=${target} must be >= 1`
        ).toBeGreaterThanOrEqual(1);
      }
    }
  }
}

describe('Merge Trees (合并二叉树 - LeetCode 617)', () => {
  describe('1. Stage 1: 递归 DFS 同步下潜', () => {
    it('标准案例合并：[1,3,2,5] + [2,1,3,null,4,null,7] 产生根节点为 3 的合并树', () => {
      const t1 = [1, 3, 2, 5];
      const t2 = [2, 1, 3, null, 4, null, 7];
      const steps = buildMergeTreesDfsSteps(t1, t2);

      expect(steps.length).toBeGreaterThan(6);

      const s0 = steps[0];
      expect(s0.opType).toBe('init');
      expect(s0.focus1).toBe(1);
      expect(s0.focus2).toBe(2);

      const sLast = steps[steps.length - 1];
      expect(sLast.opType).toBe('complete');
      expect(sLast.mergedTree).not.toBeNull();
      expect(sLast.mergedTree?.val).toBe(3);
      expect(sLast.mergedTree?.left?.val).toBe(4);
      expect(sLast.mergedTree?.right?.val).toBe(5);
      expect(sLast.mergedTree?.left?.left?.val).toBe(5);
      expect(sLast.mergedTree?.left?.right?.val).toBe(4);
      expect(sLast.mergedTree?.right?.right?.val).toBe(7);

      // 验证四语言行号合法性与 callTrace 快照契约
      steps.forEach((st, idx) => {
        assertCodeLineWithinBounds(st.codeLine, MERGE_TREES_STAGE1_CODES, `DFS step ${idx}`);
        expect(st.callTrace, `DFS step ${idx} 必须携带 callTrace 快照`).toBeDefined();
        expect(st.callTrace?.activeLineId, `DFS step ${idx} 必须具备 activeLineId`).toBeTruthy();
      });

      // 验证生命周期 5 段式关键行覆盖
      const javaLines = steps.map((s) => (s.codeLine as Record<string, number>)?.java);
      expect(javaLines).toContain(2); // entry
      expect(javaLines).toContain(3); // check1
      expect(javaLines).toContain(4); // check2
      expect(javaLines).toContain(5); // createMerged
      expect(javaLines).toContain(6); // recurseLeft
      expect(javaLines).toContain(7); // recurseRight
      expect(javaLines).toContain(8); // returnMerged
    });

    it('单侧空树：[1,2,3] + [] 直接继承树 1', () => {
      const steps = buildMergeTreesDfsSteps([1, 2, 3], []);
      const sLast = steps[steps.length - 1];
      expect(sLast.mergedTree?.val).toBe(1);
      expect(sLast.mergedTree?.left?.val).toBe(2);
      expect(sLast.mergedTree?.right?.val).toBe(3);
    });

    it('两树皆为空：[] + [] 合并结果为 null', () => {
      const steps = buildMergeTreesDfsSteps([], []);
      const sLast = steps[steps.length - 1];
      expect(sLast.mergedTree).toBeNull();
    });

    it('向后兼容别名函数 buildMergeTreesSteps 正常调用', () => {
      const steps = buildMergeTreesSteps([1], [2]);
      expect(steps[steps.length - 1].mergedTree?.val).toBe(3);
      expect(steps[steps.length - 1].tree?.val).toBe(3);
    });
  });

  describe('2. Stage 2: 迭代 BFS 队列同步合并', () => {
    it('标准案例合并产生与 DFS 一致的合并结果', () => {
      const t1 = [1, 3, 2, 5];
      const t2 = [2, 1, 3, null, 4, null, 7];
      const steps = buildMergeTreesBfsSteps(t1, t2);

      expect(steps.length).toBeGreaterThan(6);

      const s0 = steps[0];
      expect(s0.opType).toBe('init');

      const sLast = steps[steps.length - 1];
      expect(sLast.mergedTree?.val).toBe(3);
      expect(sLast.mergedTree?.left?.val).toBe(4);
      expect(sLast.mergedTree?.right?.val).toBe(5);
      expect(sLast.mergedTree?.left?.left?.val).toBe(5);
      expect(sLast.mergedTree?.left?.right?.val).toBe(4);
      expect(sLast.mergedTree?.right?.right?.val).toBe(7);

      // 验证四语言行号合法性
      steps.forEach((st, idx) => {
        assertCodeLineWithinBounds(st.codeLine, MERGE_TREES_STAGE2_CODES, `BFS step ${idx}`);
      });
    });

    it('一树为空时安全处理', () => {
      const steps1 = buildMergeTreesBfsSteps([], [5, 3]);
      expect(steps1[steps1.length - 1].mergedTree?.val).toBe(5);

      const steps2 = buildMergeTreesBfsSteps([8], []);
      expect(steps2[steps2.length - 1].mergedTree?.val).toBe(8);
    });
  });

  describe('3. parseTreeInput 鲁棒性', () => {
    it('能正确解析逗号、空格与 null 标记', () => {
      expect(parseTreeInput('1, 3, 2, null, 4', [])).toEqual([1, 3, 2, null, 4]);
      expect(parseTreeInput('[2, 1, #, 7]', [])).toEqual([2, 1, null, 7]);
      expect(parseTreeInput('', [1])).toEqual([]);
      expect(parseTreeInput(null, [1, 2])).toEqual([1, 2]);
    });
  });

  describe('4. 核心黄金不变量：最终收尾帧全树高亮常驻与三树全景契约 (Final Step Invariant)', () => {
    it('最终收尾步必须将树 1、树 2 和合并树的所有节点 100% 点亮高亮，严禁任何暗灰或白板退化', () => {
      const t1 = [1, 3, 2, 5];
      const t2 = [2, 1, 3, null, 4, null, 7];
      const dfsSteps = buildMergeTreesDfsSteps(t1, t2);
      const lastDfs = dfsSteps[dfsSteps.length - 1];

      expect(lastDfs.opType).toBe('complete');
      expect(lastDfs.highlightedMergedVals.size).toBeGreaterThanOrEqual(4);
      expect(lastDfs.tree1Visited.size).toBe(4); // [1, 3, 2, 5]
      expect(lastDfs.tree2Visited.size).toBe(5); // [2, 1, 3, 4, 7]

      // BFS 同样必须保持全树点亮
      const bfsSteps = buildMergeTreesBfsSteps(t1, t2);
      const lastBfs = bfsSteps[bfsSteps.length - 1];
      expect(lastBfs.opType).toBe('complete');
      expect(lastBfs.highlightedMergedVals.size).toBeGreaterThanOrEqual(4);
      expect(lastBfs.tree1Visited.size).toBe(4);
      expect(lastBfs.tree2Visited.size).toBe(5);
    });

    it('Card 1 真实 DOM 渲染必须包含强制横向排布 mainRow 并完整挂载 3 棵树的 SVG', async () => {
      const { renderMergeTreesCanvas } = await import('./merge-trees-renderer');
      const container = document.createElement('div');
      const steps = buildMergeTreesDfsSteps([1, 3, 2, 5], [2, 1, 3, null, 4, null, 7]);
      const lastStep = steps[steps.length - 1];

      renderMergeTreesCanvas(container, lastStep);

      // 1. 验证包含 flex-direction: row 独立包装层
      const rowWrapper = container.firstElementChild as HTMLElement;
      expect(rowWrapper).not.toBeNull();
      expect(rowWrapper.style.display).toContain('flex');
      expect(rowWrapper.style.flexDirection).toContain('row');

      // 2. 验证挂载了全部 3 棵树的 SVG
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBe(3);

      // 3. 验证三棵树标题均完整呈现
      expect(container.textContent).toContain('输入树 1');
      expect(container.textContent).toContain('输入树 2');
      expect(container.textContent).toContain('合并演进树');
      expect(container.textContent).toContain('100% 完成');

      // 4. 验证最后一步渲染出的节点圆圈必须包含翡翠绿高亮颜色，绝无全盘暗灰
      const circles = container.querySelectorAll('circle');
      expect(circles.length).toBeGreaterThanOrEqual(10);
      const hasGreenHighlightedCircle = Array.from(circles).some(
        (c) =>
          c.getAttribute('fill')?.includes('34, 197, 94') ||
          c.getAttribute('stroke') === '#16a34a'
      );
      expect(hasGreenHighlightedCircle, '最后一步必须存在翡翠绿全树完成高亮节点').toBe(true);
    });

    it('Card 2 真实 DOM 渲染挂载 RecursiveCallTraceAdapter 且主题为 light', async () => {
      const { renderMergeTreesCard2 } = await import('./merge-trees-renderer');
      const container = document.createElement('div');
      const steps = buildMergeTreesDfsSteps([1, 3, 2, 5], [2, 1, 3, null, 4, null, 7]);
      const s1 = steps[1];

      renderMergeTreesCard2(container, s1);

      const traceHost = container.querySelector('.merge-trees-trace-host');
      expect(traceHost).not.toBeNull();
      expect(container.textContent).toContain('递归 DFS 同步下潜调用推演栈');
      expect(container.textContent).toContain('节点合并算式推导');
    });
  });
});
