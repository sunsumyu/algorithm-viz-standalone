// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { algorithmRegistry } from '../../../core/algorithm-registry';
import { DpStepEngine } from './engine/dp-step-engine';
import '../../batch-dynamic-programming-index';

describe('左程云算法通关课【必备篇】Class 080 & 081 状压动态规划专题门禁测试', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  const EXPECTED_BITMASK_ALGORITHMS = [
    // Class 080: 状压 DP（上）
    {
      id: 'tsp-bitmask-dp',
      aliases: ['class080-code01', 'tsp-bitmask', 'traveling-salesperson'],
      classCode: 'Class 080 Code01',
      name: '旅行商问题 TSP',
    },
    {
      id: 'partition-k-equal-subsets',
      aliases: ['class080-code02', 'partition-k-equal-subsets-698', 'leetcode-698'],
      classCode: 'Class 080 Code02',
      name: '划分为k个相等子集',
    },
    {
      id: 'matchsticks-to-square',
      aliases: ['class080-code02-ext', 'matchsticks-to-square-473', 'leetcode-473'],
      classCode: 'Class 080 Code02延伸',
      name: '火柴拼正方形',
    },
    {
      id: 'can-i-win',
      aliases: ['class080-code03', 'can-i-win-464', 'leetcode-464'],
      classCode: 'Class 080 Code03',
      name: '我能赢吗',
    },

    // Class 081: 状压 DP（下）
    {
      id: 'number-of-ways-wear-hats',
      aliases: ['class081-code01', 'number-of-ways-wear-hats-1434', 'leetcode-1434'],
      classCode: 'Class 081 Code01',
      name: '每个人戴不同帽子的方案数',
    },
    {
      id: 'optimal-account-balancing',
      aliases: ['class081-code02', 'optimal-account-balancing-465', 'leetcode-465'],
      classCode: 'Class 081 Code02',
      name: '最优账单平衡',
    },
    {
      id: 'good-subsets',
      aliases: ['class081-code03', 'good-subsets-1994', 'leetcode-1994'],
      classCode: 'Class 081 Code03',
      name: '好子集的数目',
    },
    {
      id: 'distribute-repeating-integers',
      aliases: ['class081-code04', 'distribute-repeating-integers-1655', 'leetcode-1655'],
      classCode: 'Class 081 Code04',
      name: '分配重复整数',
    },
  ];

  it('全量 8 大状压 DP 算法必须全部在注册中心成功登记且名称与元数据健全', () => {
    for (const item of EXPECTED_BITMASK_ALGORITHMS) {
      const manifest = algorithmRegistry.getManifest(item.id);
      expect(manifest, `算法 [${item.id}] 必须成功注册`).toBeDefined();
      expect(manifest?.name, `算法 [${item.id}] 名称必须正确`).toContain(item.name);
    }
  });

  it('全量 8 大状压 DP 算法必须具备完整的课号与 LeetCode 别名统合 (Bi-Version Aliases)', () => {
    for (const item of EXPECTED_BITMASK_ALGORITHMS) {
      const manifest = algorithmRegistry.getManifest(item.id);
      expect(manifest?.aliases, `算法 [${item.id}] 必须包含 aliases 属性`).toBeDefined();
      for (const expectedAlias of item.aliases) {
        expect(
          manifest?.aliases,
          `算法 [${item.id}] 必须包含别名 [${expectedAlias}]`
        ).toContain(expectedAlias);

        const aliasedManifest = algorithmRegistry.getManifest(expectedAlias);
        expect(
          aliasedManifest?.id,
          `通过别名 [${expectedAlias}] 查询必须解析至主 ID [${item.id}]`
        ).toBe(item.id);
      }
    }
  });

  it('全量 8 大状压 DP 算法的 DpStepEngine 与 Builder 执行沙盘正常且产生合法步骤', () => {
    for (const item of EXPECTED_BITMASK_ALGORITHMS) {
      const steps = DpStepEngine.generateSteps(item.id, {});
      expect(steps.length, `算法 [${item.id}] 必须生成至少 1 个真实推导步骤`).toBeGreaterThan(0);

      const firstStep = steps[0];
      expect(firstStep, `算法 [${item.id}] 首步必须有效`).toBeDefined();
      expect(
        firstStep.description || firstStep.message,
        `算法 [${item.id}] 步骤必须包含有效描述或说明`
      ).toBeTruthy();

      const lastStep = steps[steps.length - 1];
      expect(lastStep, `算法 [${item.id}] 末步必须有效`).toBeDefined();
    }
  });
});
