import { describe, it, expect } from 'vitest';
import { AlgorithmModelRepository } from '../model-repository';
import { AlgorithmStrategyRegistry } from './algorithm-strategy-registry';
import './index';

describe('🔴 动态规划与状态机初始网格纯净度门禁 (Initial Grid Purity Gate)', () => {
  it('1. coins-from-piles (LC 2218 从栈中取出K个硬币) Stage 3 顺推与逆推首帧网格必须全为 null，严防首帧全绿假通过', () => {
    const model = AlgorithmModelRepository.getModel('coins-from-piles');
    expect(model).toBeDefined();

    for (const dir of ['forward', 'reverse'] as const) {
      const steps = AlgorithmStrategyRegistry.tryGenerate(model!, {
        stage: 3,
        direction: dir,
      });
      expect(steps && steps.length > 0).toBe(true);

      const firstGridStep = steps!.find(s => s.grid !== undefined);
      expect(firstGridStep, `coins-from-piles Stage 3 (${dir}) 必须有包含网格的步骤`).toBeDefined();

      const nonNulls = firstGridStep!.grid!.flatMap(r => Array.isArray(r) ? r : [r]).filter(c => c !== null);
      expect(
        nonNulls.length,
        `【红灯门禁拦截】coins-from-piles Stage 3 (${dir}) 首帧网格必须全为 null，实际有 ${nonNulls.length} 个非空单元格已变绿！`
      ).toBe(0);
    }
  });

  it('2. regex-matching (LC 10 正则表达式匹配) Stage 4 空间压缩首帧网格必须全为 null', () => {
    const model = AlgorithmModelRepository.getModel('regex-matching');
    expect(model).toBeDefined();

    for (const dir of ['forward', 'reverse'] as const) {
      const steps = AlgorithmStrategyRegistry.tryGenerate(model!, {
        stage: 4,
        direction: dir,
      });
      expect(steps && steps.length > 0).toBe(true);

      const initStep = steps!.find(s => s.type === 'init' || s.type === 'entry') || steps![0];
      const nonNulls = initStep.grid!.flatMap(r => Array.isArray(r) ? r : [r]).filter(c => c !== null);
      expect(
        nonNulls.length,
        `【红灯门禁拦截】regex-matching Stage 4 (${dir}) 首帧网格必须全为 null，实际有 ${nonNulls.length} 个非空单元格！`
      ).toBe(0);
    }
  });

  it('3. wildcard-matching (LC 44 通配符匹配) Stage 4 空间压缩首帧网格必须全为 null', () => {
    const model = AlgorithmModelRepository.getModel('wildcard-matching');
    expect(model).toBeDefined();

    for (const dir of ['forward', 'reverse'] as const) {
      const steps = AlgorithmStrategyRegistry.tryGenerate(model!, {
        stage: 4,
        direction: dir,
      });
      expect(steps && steps.length > 0).toBe(true);

      const initStep = steps!.find(s => s.type === 'init' || s.type === 'entry') || steps![0];
      const nonNulls = initStep.grid!.flatMap(r => Array.isArray(r) ? r : [r]).filter(c => c !== null);
      expect(
        nonNulls.length,
        `【红灯门禁拦截】wildcard-matching Stage 4 (${dir}) 首帧网格必须全为 null，实际有 ${nonNulls.length} 个非空单元格！`
      ).toBe(0);
    }
  });

  it('4. buying-hay-min-cost (购买足量干草) Stage 4 首帧网格必须全为 null', () => {
    const model = AlgorithmModelRepository.getModel('buying-hay-min-cost');
    expect(model).toBeDefined();

    for (const dir of ['forward', 'reverse'] as const) {
      const steps = AlgorithmStrategyRegistry.tryGenerate(model!, {
        stage: 4,
        direction: dir,
      });
      expect(steps && steps.length > 0).toBe(true);

      const initStep = steps!.find(s => s.type === 'init' || s.type === 'entry') || steps![0];
      const nonNulls = initStep.grid!.flatMap(r => Array.isArray(r) ? r : [r]).filter(c => c !== null);
      expect(
        nonNulls.length,
        `【红灯门禁拦截】buying-hay-min-cost Stage 4 (${dir}) 首帧网格必须全为 null，实际有 ${nonNulls.length} 个非空单元格！`
      ).toBe(0);
    }
  });

  it('5. burst-balloons (LC 312 戳气球) Stage 3 & 4 首帧网格必须纯净为 null', () => {
    const model = AlgorithmModelRepository.getModel('burst-balloons');
    expect(model).toBeDefined();

    for (const stage of [3, 4]) {
      for (const dir of ['forward', 'reverse'] as const) {
        const steps = AlgorithmStrategyRegistry.tryGenerate(model!, {
          stage,
          direction: dir,
        });
        expect(steps && steps.length > 0).toBe(true);

        const entryStep = steps!.find(s => s.type === 'entry' || s.type === 'init') || steps![0];
        const nonNulls = entryStep.grid!.flatMap(r => Array.isArray(r) ? r : [r]).filter(c => c !== null);
        expect(
          nonNulls.length,
          `【红灯门禁拦截】burst-balloons Stage ${stage} (${dir}) 首帧网格必须全为 null，实际有 ${nonNulls.length} 个非空单元格！`
        ).toBe(0);
      }
    }
  });

  it('6. min-score-triangulation (LC 1039 多边形三角剖分) Stage 3 & 4 首帧网格必须纯净为 null', () => {
    const model = AlgorithmModelRepository.getModel('min-score-triangulation');
    expect(model).toBeDefined();

    for (const stage of [3, 4]) {
      for (const dir of ['forward', 'reverse'] as const) {
        const steps = AlgorithmStrategyRegistry.tryGenerate(model!, {
          stage,
          direction: dir,
        });
        expect(steps && steps.length > 0).toBe(true);

        const entryStep = steps!.find(s => s.type === 'entry' || s.type === 'init') || steps![0];
        const nonNulls = entryStep.grid!.flatMap(r => Array.isArray(r) ? r : [r]).filter(c => c !== null);
        expect(
          nonNulls.length,
          `【红灯门禁拦截】min-score-triangulation Stage ${stage} (${dir}) 首帧网格必须全为 null，实际有 ${nonNulls.length} 个非空单元格！`
        ).toBe(0);
      }
    }
  });

  it('7. is-subsequence (LC 392 判断子序列) Stage 3 首帧网格必须纯净为 null', () => {
    const model = AlgorithmModelRepository.getModel('is-subsequence');
    expect(model).toBeDefined();

    const steps = AlgorithmStrategyRegistry.tryGenerate(model!, { stage: 3, direction: 'forward' });
    expect(steps && steps.length > 0).toBe(true);

    const initStep = steps!.find(s => s.type === 'init' || s.type === 'entry') || steps![0];
    const nonNulls = initStep.grid!.flatMap(r => Array.isArray(r) ? r : [r]).filter(c => c !== null);
    expect(
      nonNulls.length,
      `【红灯门禁拦截】is-subsequence Stage 3 首帧网格必须全为 null，实际有 ${nonNulls.length} 个非空单元格！`
    ).toBe(0);
  });

  it('8. target-sum-standard (LC 494 目标和) Stage 3 首帧网格必须纯净为 null', () => {
    const model = AlgorithmModelRepository.getModel('target-sum-standard');
    expect(model).toBeDefined();

    const steps = AlgorithmStrategyRegistry.tryGenerate(model!, { stage: 3, direction: 'forward' });
    expect(steps && steps.length > 0).toBe(true);

    const initStep = steps!.find(s => s.type === 'init' || s.type === 'entry' || s.tag === '初始化') || steps![0];
    const nonNulls = initStep.grid!.flatMap(r => Array.isArray(r) ? r : [r]).filter(c => c !== null);
    expect(
      nonNulls.length,
      `【红灯门禁拦截】target-sum-standard Stage 3 首帧网格必须全为 null，实际有 ${nonNulls.length} 个非空单元格！`
    ).toBe(0);
  });

  it('9. super-washing-machines (LC 517 超级洗衣机) Stage 3 首帧网格必须纯净为 null', () => {
    const model = AlgorithmModelRepository.getModel('super-washing-machines');
    expect(model).toBeDefined();

    const steps = AlgorithmStrategyRegistry.tryGenerate(model!, { stage: 3, direction: 'forward' });
    expect(steps && steps.length > 0).toBe(true);

    const initStep = steps![0];
    const nonNulls = initStep.grid!.flatMap(r => Array.isArray(r) ? r : [r]).filter(c => c !== null);
    expect(
      nonNulls.length,
      `【红灯门禁拦截】super-washing-machines Stage 3 首帧网格必须全为 null，实际有 ${nonNulls.length} 个非空单元格！`
    ).toBe(0);
  });
});
