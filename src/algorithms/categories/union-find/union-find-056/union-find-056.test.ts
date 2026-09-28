import { describe, it, expect } from 'vitest';
import { buildUnionFindTemplateSteps } from './union-find-luogu-056-renderer';
import { buildCouplesHandsSteps } from './couples-holding-hands-056-renderer';
import { buildSimilarStringsSteps } from './similar-string-groups-056-renderer';
import { buildNumberOfIslandsSteps } from './number-of-islands-056-renderer';
import {
  CODE01_UNION_FIND_CODES,
  CODE03_COUPLES_CODES,
  CODE04_SIMILAR_STRINGS_CODES,
  CODE05_ISLANDS_UF_CODES,
} from './union-find-056-stage-codes';
import {
  renderUnionFindTemplateBoard,
  renderCouplesHandsBoard,
  renderSimilarStringsBoard,
  renderIslandsUnionFindBoard,
} from './union-find-056-shared';

function verifyLineBounds(steps: any[], codes: Record<string, string[]>, desc: string) {
  for (const step of steps) {
    if (!step.codeLine) continue;
    for (const [lang, line] of Object.entries(step.codeLine)) {
      if (typeof line !== 'number') continue;
      const codeList = codes[lang];
      expect(codeList, `${desc} 缺少语言 ${lang}`).toBeDefined();
      expect(line, `${desc} ${lang} 行号 ${line} 必须 >= 1`).toBeGreaterThanOrEqual(1);
      expect(line, `${desc} ${lang} 行号 ${line} 超出源码总行数 ${codeList.length}`).toBeLessThanOrEqual(codeList.length);
    }
  }
}

describe('Class 056: 并查集·上 核心算法单测套件', () => {
  describe('Code01/02: 并查集模版与路径压缩 (Union-Find Template)', () => {
    it('标准用例生成步骤且每步行号在源码有效范围内', () => {
      const steps = buildUnionFindTemplateSteps(5, [
        { type: 1, x: 1, y: 2 },
        { type: 1, x: 2, y: 3 },
        { type: 2, x: 1, y: 3 },
      ]);
      expect(steps.length).toBeGreaterThan(0);
      verifyLineBounds(steps, CODE01_UNION_FIND_CODES, 'Code01/02');

      const lastStep = steps[steps.length - 1];
      expect(lastStep.setsCount).toBe(3); // 5 - 2 = 3
    });

    it('沙盘渲染符合纯净契约 (零 h1~h6, 零 [object Object])', () => {
      const steps = buildUnionFindTemplateSteps(4);
      for (const step of steps) {
        const html = renderUnionFindTemplateBoard(step);
        expect(html).not.toMatch(/<h[1-6]/i);
        expect(html).not.toContain('[object Object]');
      }
    });
  });

  describe('Code03: 情侣牵手与置换环定理 (Couples Holding Hands)', () => {
    it('正确计算典型错位用例的交换次数', () => {
      // 0 与 2 (对0和对1), 1 与 3 (对0和对1) -> 2 对情侣在一个错位环中，需 1 次交换
      const steps1 = buildCouplesHandsSteps([0, 2, 1, 3]);
      expect(steps1.length).toBeGreaterThan(0);
      expect(steps1[steps1.length - 1].curSwaps).toBe(1);
      verifyLineBounds(steps1, CODE03_COUPLES_CODES, 'Code03');

      // 3 与 2 (对1), 0 与 1 (对0) -> 已经各自牵手，0 次交换
      const steps2 = buildCouplesHandsSteps([3, 2, 0, 1]);
      expect(steps2[steps2.length - 1].curSwaps).toBe(0);

      // 4对情侣置换环用例
      const steps3 = buildCouplesHandsSteps([5, 4, 2, 6, 3, 1, 0, 7]);
      expect(steps3[steps3.length - 1].curSwaps).toBe(2);
    });

    it('沙盘渲染符合纯净契约', () => {
      const steps = buildCouplesHandsSteps([0, 2, 1, 3]);
      for (const step of steps) {
        const html = renderCouplesHandsBoard(step);
        expect(html).not.toMatch(/<h[1-6]/i);
        expect(html).not.toContain('[object Object]');
      }
    });
  });

  describe('Code04: 相似字符串组 (Similar String Groups)', () => {
    it('正确计算经典案例相似组总数', () => {
      // "tars", "rats", "arts", "star" -> 2 组 ({"tars", "rats", "arts"}, {"star"})
      const steps = buildSimilarStringsSteps(['tars', 'rats', 'arts', 'star']);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[steps.length - 1].similarSets).toBe(2);
      verifyLineBounds(steps, CODE04_SIMILAR_STRINGS_CODES, 'Code04');

      // 全部互不相同
      const stepsDiff = buildSimilarStringsSteps(['abc', 'def', 'ghi']);
      expect(stepsDiff[stepsDiff.length - 1].similarSets).toBe(3);

      // 全部同组
      const stepsAllSame = buildSimilarStringsSteps(['blw', 'bwl', 'wlb']);
      expect(stepsAllSame[stepsAllSame.length - 1].similarSets).toBe(1);
    });

    it('沙盘渲染符合纯净契约', () => {
      const steps = buildSimilarStringsSteps(['tars', 'rats', 'arts', 'star']);
      for (const step of steps) {
        const html = renderSimilarStringsBoard(step);
        expect(html).not.toMatch(/<h[1-6]/i);
        expect(html).not.toContain('[object Object]');
      }
    });
  });

  describe('Code05: 岛屿数量并查集二维合并 (Number of Islands)', () => {
    it('正确计算各种网格的岛屿数量', () => {
      // 1 巨大连通岛
      const grid1 = [
        ['1', '1', '1', '1', '0'],
        ['1', '1', '0', '1', '0'],
        ['1', '1', '0', '0', '0'],
        ['0', '0', '0', '0', '0'],
      ];
      const steps1 = buildNumberOfIslandsSteps(grid1);
      expect(steps1.length).toBeGreaterThan(0);
      expect(steps1[steps1.length - 1].islandCount).toBe(1);
      verifyLineBounds(steps1, CODE05_ISLANDS_UF_CODES, 'Code05');

      // 3 座岛屿
      const grid3 = [
        ['1', '1', '0', '0', '0'],
        ['1', '1', '0', '0', '0'],
        ['0', '0', '1', '0', '0'],
        ['0', '0', '0', '1', '1'],
      ];
      const steps3 = buildNumberOfIslandsSteps(grid3);
      expect(steps3[steps3.length - 1].islandCount).toBe(3);

      // 全0水域
      const grid0 = [
        ['0', '0'],
        ['0', '0'],
      ];
      const steps0 = buildNumberOfIslandsSteps(grid0);
      expect(steps0[steps0.length - 1].islandCount).toBe(0);
    });

    it('沙盘渲染符合纯净契约 (包含 table 标签)', () => {
      const steps = buildNumberOfIslandsSteps();
      for (const step of steps) {
        const html = renderIslandsUnionFindBoard(step);
        expect(html).not.toMatch(/<h[1-6]/i);
        expect(html).not.toContain('[object Object]');
        expect(html).toContain('<table');
      }
    });
  });
});
