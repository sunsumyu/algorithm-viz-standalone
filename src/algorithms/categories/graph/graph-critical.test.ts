import { describe, it, expect } from 'vitest';
import { buildTreePathIntersectSteps } from './tree-path-intersection-renderer';
import { TREE_PATH_INTERSECT_CODE_LANGUAGES } from './tree-path-intersection-problem-content';

import { buildMixedEulerSteps } from './mixed-eulerian-circuit-renderer';
import { MIXED_EULER_CODE_LANGUAGES } from './mixed-eulerian-circuit-problem-content';

import { buildTreeCentroidPathCountSteps } from './tree-centroid-path-count-renderer';
import { TREE_PATH_COUNT_CODE_LANGUAGES } from './tree-centroid-path-count-problem-content';

import { buildMinMeanCycleSteps } from './min-mean-cycle-renderer';
import { MIN_MEAN_CYCLE_CODE_LANGUAGES } from './min-mean-cycle-problem-content';

import { buildConvexHull3DSteps } from './convex-hull-3d-renderer';
import { CONVEX_HULL_3D_CODE_LANGUAGES } from './convex-hull-3d-problem-content';

/**
 * 通用四语言行号合规性校验辅助函数
 */
function verifyStepsLineBounds(steps: any[], codeLanguages: Record<string, string[]>) {
  expect(steps.length).toBeGreaterThan(0);
  // 必须有 Step 0 入口
  expect(steps[0].message || steps[0].decision || steps[0].log).toMatch(/(入口|solve|calc|初始化|给定)/i);

  const langs = ['java', 'cpp', 'python', 'javascript'];

  for (const [idx, step] of steps.entries()) {
    const lineTarget = step.codeLine;
    expect(lineTarget, `第 ${idx} 步缺少 codeLine 定义`).toBeDefined();

    if (typeof lineTarget === 'object' && lineTarget !== null && !Array.isArray(lineTarget) && !('from' in lineTarget)) {
      // 多语言字典
      for (const lang of langs) {
        const lineNum = (lineTarget as Record<string, number>)[lang];
        expect(lineNum, `第 ${idx} 步缺少语言 ${lang} 的行号定义`).toBeDefined();
        const maxLen = codeLanguages[lang]?.length || 0;
        expect(maxLen, `缺少语言 ${lang} 的代码数组`).toBeGreaterThan(0);
        expect(
          lineNum,
          `第 ${idx} 步在语言 ${lang} 下行号 ${lineNum} 超界 [1, ${maxLen}] (内容: ${step.message})`
        ).toBeGreaterThanOrEqual(1);
        expect(
          lineNum,
          `第 ${idx} 步在语言 ${lang} 下行号 ${lineNum} 超界 [1, ${maxLen}] (内容: ${step.message})`
        ).toBeLessThanOrEqual(maxLen);
      }
    }
  }
}

describe('Graph 专题 5 大关键进阶算法代码联动与生命周期规范核验', () => {
  // 1. 树上路径相交判定
  describe('1. 树上路径相交判定 (Tree Path Intersection)', () => {
    it('相交用例应生成全生命周期步骤且四语言行号均在合法区间内', () => {
      const steps = buildTreePathIntersectSteps(true);
      verifyStepsLineBounds(steps, TREE_PATH_INTERSECT_CODE_LANGUAGES);
      const last = steps[steps.length - 1];
      expect(last.isIntersect).toBe(true);
      expect(last.overlapNodes).toContain(2);
    });

    it('不相交用例应生成全生命周期步骤且四语言行号均在合法区间内', () => {
      const steps = buildTreePathIntersectSteps(false);
      verifyStepsLineBounds(steps, TREE_PATH_INTERSECT_CODE_LANGUAGES);
      const last = steps[steps.length - 1];
      expect(last.isIntersect).toBe(false);
    });
  });

  // 2. 混合图欧拉回路
  describe('2. 混合图欧拉回路 (Mixed Eulerian Circuit)', () => {
    it('可解回路用例应生成全生命周期步骤且四语言行号均在合法区间内', () => {
      const steps = buildMixedEulerSteps(true);
      verifyStepsLineBounds(steps, MIXED_EULER_CODE_LANGUAGES);
      const last = steps[steps.length - 1];
      expect(last.isEulerian).toBe(true);
      expect(last.flowVal).toBe(1);
    });

    it('奇偶无解用例应生成全生命周期步骤且四语言行号均在合法区间内', () => {
      const steps = buildMixedEulerSteps(false);
      verifyStepsLineBounds(steps, MIXED_EULER_CODE_LANGUAGES);
      const last = steps[steps.length - 1];
      expect(last.isEulerian).toBe(false);
    });
  });

  // 3. 点分治路径计数
  describe('3. 点分治路径计数 (Tree Centroid Path Count)', () => {
    it('阈值 K=5 用例应生成全生命周期步骤且四语言行号均在合法区间内', () => {
      const steps = buildTreeCentroidPathCountSteps(5);
      verifyStepsLineBounds(steps, TREE_PATH_COUNT_CODE_LANGUAGES);
      const last = steps[steps.length - 1];
      expect(last.validPairs).toBe(11);
    });

    it('阈值 K=3 用例应生成全生命周期步骤且四语言行号均在合法区间内', () => {
      const steps = buildTreeCentroidPathCountSteps(3);
      verifyStepsLineBounds(steps, TREE_PATH_COUNT_CODE_LANGUAGES);
      const last = steps[steps.length - 1];
      expect(last.validPairs).toBe(6);
    });
  });

  // 4. 最小均值回路
  describe('4. 最小均值回路 (Min Mean Cycle)', () => {
    it('标准测试图应正确二分收敛且四语言行号均在合法区间内', () => {
      const steps = buildMinMeanCycleSteps('standard');
      verifyStepsLineBounds(steps, MIN_MEAN_CYCLE_CODE_LANGUAGES);
      const last = steps[steps.length - 1];
      expect(last.status).toBe('converged');
      expect(last.lambda).toBeCloseTo(1.33, 1);
    });
  });

  // 5. 三维凸包增量法
  describe('5. 三维凸包增量法 (3D Convex Hull)', () => {
    it('5 空间点集应成功构建闭合凸包且四语言行号均在合法区间内', () => {
      const steps = buildConvexHull3DSteps();
      verifyStepsLineBounds(steps, CONVEX_HULL_3D_CODE_LANGUAGES);
      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.faces.length).toBeGreaterThan(0);
    });
  });
});
