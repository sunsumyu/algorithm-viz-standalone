import { describe, it, expect } from 'vitest';
import { buildJumpGameIISteps } from './jump-game-ii-renderer';
import { buildMinTapsSteps } from './min-taps-renderer';
import { buildStringTransformsSteps } from './string-transforms-renderer';
import { buildCrossRiverSteps } from './cross-river-renderer';
import { buildSuperWashingMachinesSteps } from './super-washing-machines-renderer';
import {
  JUMP_GAME_II_CODES,
  MIN_TAPS_CODES,
  STRING_TRANSFORMS_CODES,
  CROSS_RIVER_CODES,
  SUPER_WASHING_MACHINES_CODES,
} from './greedy-093-stage-codes';

function verifyLineMap(steps: any[], codes: Record<string, string[]>) {
  expect(steps.length).toBeGreaterThan(0);
  expect(steps[0].decision).toMatch(/(入口|接收)/);

  for (const step of steps) {
    const lineMap = step.codeLine as Record<string, number>;
    expect(lineMap, 'Step must have codeLine').toBeDefined();
    for (const [lang, line] of Object.entries(lineMap)) {
      const codeArray = codes[lang];
      expect(codeArray, `Code array for ${lang} must exist`).toBeDefined();
      expect(
        line,
        `Language ${lang} line ${line} out of bounds [1, ${codeArray.length}] for decision: ${step.decision}`
      ).toBeGreaterThanOrEqual(1);
      expect(
        line,
        `Language ${lang} line ${line} out of bounds [1, ${codeArray.length}] for decision: ${step.decision}`
      ).toBeLessThanOrEqual(codeArray.length);
    }
  }
}

describe('左神贪心专题 5 (greedy-093) 自动化测试套件', () => {
  it('1. 跳跃游戏 II (LeetCode 45)', () => {
    const nums = [2, 3, 1, 1, 4];
    const steps = buildJumpGameIISteps(nums);
    verifyLineMap(steps, JUMP_GAME_II_CODES);
    const last = steps[steps.length - 1];
    expect(last.stepsCount).toBe(2);
  });

  it('2. 灌溉花园的最少水龙头数目 (LeetCode 1326)', () => {
    const n = 5;
    const ranges = [3, 4, 1, 1, 0, 0];
    const steps = buildMinTapsSteps(n, ranges);
    verifyLineMap(steps, MIN_TAPS_CODES);
    const last = steps[steps.length - 1];
    expect(last.stepsCount).toBe(1); // 龙头 1 覆盖 [0, 5]
  });

  it('3. 转化字符串的最少操作次数 (LeetCode 1153)', () => {
    const str1 = 'aabcc';
    const str2 = 'ccdee';
    const steps = buildStringTransformsSteps(str1, str2);
    verifyLineMap(steps, STRING_TRANSFORMS_CODES);
    const last = steps[steps.length - 1];
    expect(last.canTransform).toBe(true);
  });

  it('4. 经典过河问题 (POJ 1700)', () => {
    const times = [1, 2, 5, 10];
    const steps = buildCrossRiverSteps(times);
    verifyLineMap(steps, CROSS_RIVER_CODES);
    const last = steps[steps.length - 1];
    expect(last.totalTime).toBe(17); // 经典题解 17
  });

  it('5. 超级洗衣机 (LeetCode 517)', () => {
    const machines = [1, 0, 5];
    const steps = buildSuperWashingMachinesSteps(machines);
    verifyLineMap(steps, SUPER_WASHING_MACHINES_CODES);
    const last = steps[steps.length - 1];
    expect(last.maxMoves).toBe(3);
  });

  it('6. Class 093 贪心算法专题 注册中心与别名统合门禁', async () => {
    const { algorithmRegistry } = await import('../../../../core/algorithm-registry');
    await import('../../../batch-5-index');

    const expectedMappings = [
      {
        id: 'jump-game-ii',
        aliases: ['class093-code01', 'jump-game-ii-45', 'leetcode-45', 'jump-game-2'],
      },
      {
        id: 'minimum-number-of-taps-to-water-a-garden',
        aliases: ['class093-code02', 'min-taps-1326', 'leetcode-1326', 'min-taps', 'water-garden'],
      },
      {
        id: 'string-transforms-into-another-string',
        aliases: ['class093-code03', 'string-transforms-1153', 'leetcode-1153', 'string-transforms'],
      },
      {
        id: 'cross-river-classic',
        aliases: ['class093-code04', 'cross-river', 'poj-1700', 'bridge-crossing'],
      },
      {
        id: 'super-washing-machines',
        aliases: ['class093-code05', 'super-washing-machines-517', 'leetcode-517', 'washing-machines'],
      },
    ];

    for (const item of expectedMappings) {
      const manifest = algorithmRegistry.getManifest(item.id);
      expect(manifest, `Algorithm with id ${item.id} must be registered`).toBeDefined();
      for (const alias of item.aliases) {
        expect(manifest?.aliases).toContain(alias);
        const resolvedByAlias = algorithmRegistry.getManifest(alias);
        expect(resolvedByAlias?.id, `Alias ${alias} should resolve to ${item.id}`).toBe(item.id);
      }
    }
  });
});

