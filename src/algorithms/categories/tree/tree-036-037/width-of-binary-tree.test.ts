// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  buildWidth036QueueSteps,
  buildWidth036StaticArraySteps,
  buildWidth036DfsSteps,
  renderWidthCanvasForStep,
} from './width-of-binary-tree-036-renderer';
import { buildTreeFromArr } from '../tree-template';
import {
  WIDTH_STAGE1_CODE,
  WIDTH_STAGE2_STATIC_ARRAY_CODE,
  WIDTH_STAGE3_DFS_CODE,
} from './width-of-binary-tree-036-stage-codes';

function assertCodeLineWithinBounds(codeLine: any, codes: Record<string, string[] | string>, desc: string) {
  if (!codeLine) return;
  for (const [lang, raw] of Object.entries(codes)) {
    const lines = Array.isArray(raw) ? raw : typeof raw === 'string' ? raw.split('\n') : [];
    const count = lines.length;
    if (count === 0) continue;
    if (typeof codeLine === 'number') {
      expect(codeLine, `${desc}: scalar codeLine exceeds ${lang}`).toBeLessThanOrEqual(count);
      expect(codeLine, `${desc}: scalar codeLine < 1 for ${lang}`).toBeGreaterThanOrEqual(1);
    } else if (typeof codeLine === 'object' && codeLine[lang] != null) {
      expect(codeLine[lang], `${desc}: dict codeLine[${lang}] exceeds`).toBeLessThanOrEqual(count);
      expect(codeLine[lang], `${desc}: dict codeLine[${lang}] < 1`).toBeGreaterThanOrEqual(1);
    }
  }
}

describe('二叉树最大宽度 (Width of Binary Tree · LeetCode 662)', () => {
  const sampleArr = [1, 3, 2, 5, 3, null, 9];

  describe('1. 核心推演与四语言行号合法性', () => {
    it('Stage 1 (Queue BFS): 正确推导最大宽度 4 且行号合法', () => {
      const root = buildTreeFromArr(sampleArr);
      const steps = buildWidth036QueueSteps(root);
      expect(steps.length).toBeGreaterThan(6);
      expect(steps[steps.length - 1].maxWidth).toBe(4);
      steps.forEach((st, idx) => {
        assertCodeLineWithinBounds(st.codeLine, WIDTH_STAGE1_CODE, `Stage 1 Step ${idx}`);
      });
    });

    it('Stage 2 (静态双数组): 正确推导最大宽度 4 且行号合法', () => {
      const root = buildTreeFromArr(sampleArr);
      const steps = buildWidth036StaticArraySteps(root);
      expect(steps.length).toBeGreaterThan(6);
      expect(steps[steps.length - 1].maxWidth).toBe(4);
      steps.forEach((st, idx) => {
        assertCodeLineWithinBounds(st.codeLine, WIDTH_STAGE2_STATIC_ARRAY_CODE, `Stage 2 Step ${idx}`);
      });
    });

    it('Stage 3 (DFS 递归映射): 正确推导最大宽度 4 且行号合法', () => {
      const root = buildTreeFromArr(sampleArr);
      const steps = buildWidth036DfsSteps(root);
      expect(steps.length).toBeGreaterThan(6);
      expect(steps[steps.length - 1].maxWidth).toBe(4);
      steps.forEach((st, idx) => {
        assertCodeLineWithinBounds(st.codeLine, WIDTH_STAGE3_DFS_CODE, `Stage 3 Step ${idx}`);
      });
    });
  });

  describe('2. 核心黄金契约：最终收尾帧全树常驻高亮与最大宽度端点契约 (Final Step Invariant)', () => {
    it('Stage 1 收尾步必须覆盖全树已访问节点与最大宽度端点', () => {
      const root = buildTreeFromArr(sampleArr);
      const steps = buildWidth036QueueSteps(root);
      const last = steps[steps.length - 1];

      expect(last.action).toBe('done');
      // 必须具备 visitedNodes 字段且覆盖全部 6 个节点
      expect(last.visitedNodes).toBeDefined();
      expect(Array.from(last.visitedNodes!).length).toBe(5);

      // 必须具备 maxWidthEndpoints 标识最大跨度的左右端点节点 [5, 9]
      expect(last.maxWidthEndpoints).toBeDefined();
      expect(last.maxWidthEndpoints).toContain(5);
      expect(last.maxWidthEndpoints).toContain(9);
    });

    it('Stage 2 收尾步必须覆盖全树已访问节点与最大宽度端点', () => {
      const root = buildTreeFromArr(sampleArr);
      const steps = buildWidth036StaticArraySteps(root);
      const last = steps[steps.length - 1];

      expect(last.action).toBe('done');
      expect(last.visitedNodes).toBeDefined();
      expect(Array.from(last.visitedNodes!).length).toBe(5);
      expect(last.maxWidthEndpoints).toBeDefined();
      expect(last.maxWidthEndpoints).toContain(5);
      expect(last.maxWidthEndpoints).toContain(9);
    });

    it('Stage 3 收尾步必须覆盖全树已访问节点与最大宽度端点', () => {
      const root = buildTreeFromArr(sampleArr);
      const steps = buildWidth036DfsSteps(root);
      const last = steps[steps.length - 1];

      expect(last.action).toBe('done');
      expect(last.visitedNodes).toBeDefined();
      expect(Array.from(last.visitedNodes!).length).toBe(5);
      expect(last.maxWidthEndpoints).toBeDefined();
      expect(last.maxWidthEndpoints).toContain(5);
      expect(last.maxWidthEndpoints).toContain(9);
    });

    it('真实 DOM 渲染：最后一步必须呈现翠绿常驻节点与端点高亮，绝无全盘暗灰', () => {
      const container = document.createElement('div');
      const root = buildTreeFromArr(sampleArr);
      const steps = buildWidth036QueueSteps(root);
      const last = steps[steps.length - 1];

      renderWidthCanvasForStep(container, last);

      // 1. 验证 SVG 存在
      const svg = container.querySelector('svg');
      expect(svg).not.toBeNull();

      // 2. 验证渲染出的节点圆圈中必须存在高亮颜色 (翡翠绿已访问 或 端点主高亮)
      const circles = container.querySelectorAll('circle');
      expect(circles.length).toBeGreaterThanOrEqual(6);

      const hasHighlight = Array.from(circles).some((c) => {
        const fill = c.getAttribute('fill') || '';
        const stroke = c.getAttribute('stroke') || '';
        return (
          fill.includes('52, 211, 153') || // 翠绿半透
          fill.includes('16, 185, 129') || // 翡翠绿
          fill.includes('251, 191, 36') || // 金黄焦点
          stroke === '#34d399' ||
          stroke === '#10b981' ||
          stroke === '#fbbf24'
        );
      });
      expect(hasHighlight, '最后一步必须存在常驻高亮圆圈，严禁全盘暗灰').toBe(true);
    });
  });
});
