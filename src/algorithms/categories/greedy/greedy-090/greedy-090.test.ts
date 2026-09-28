import { describe, it, expect } from 'vitest';
import {
  buildBambooStage1Steps,
  buildBambooStage2Steps,
  buildBambooStage3Steps,
} from './cutting-bamboo-renderer';
import {
  buildMaxProductKStage1Steps,
  buildMaxProductKStage2Steps,
  buildMaxProductKStage3Steps,
} from './maximum-product-k-parts-renderer';
import { buildMeetingMonopolySteps } from './meeting-monopoly-renderer';
import { buildMeetingOneDaySteps } from './meeting-one-day-renderer';
import { buildIPOSteps } from './ipo-renderer';
import { buildAbsValueAddSteps } from './absolute-value-add-to-array-renderer';
import {
  CUTTING_BAMBOO_STAGE1_CODES,
  CUTTING_BAMBOO_STAGE2_CODES,
  CUTTING_BAMBOO_STAGE3_CODES,
  MAX_PRODUCT_K_STAGE1_CODES,
  MAX_PRODUCT_K_STAGE2_CODES,
  MAX_PRODUCT_K_STAGE3_CODES,
  MEETING_MONOPOLY_STAGE1_CODES,
  MEETING_MONOPOLY_STAGE2_CODES,
  MEETING_MONOPOLY_STAGE3_CODES,
  MEETING_ONE_DAY_STAGE1_CODES,
  MEETING_ONE_DAY_STAGE2_CODES,
  MEETING_ONE_DAY_STAGE3_CODES,
  IPO_STAGE1_CODES,
  IPO_STAGE2_CODES,
  IPO_STAGE3_CODES,
  ABS_VALUE_ADD_STAGE1_CODES,
  ABS_VALUE_ADD_STAGE2_CODES,
  ABS_VALUE_ADD_STAGE3_CODES,
} from './greedy-090-stage-codes';

describe('左神贪心算法专题 2 (Class 090) 综合测试套件', () => {
  // 1. 砍竹子 II (LeetCode 343 / 剑指 Offer 14-II)
  describe('Code01: 砍竹子 II (Cutting Bamboo)', () => {
    it('S1 暴力、S2 贪心、S3 证明均生成合法的 Step 0 入口帧', () => {
      const s1 = buildBambooStage1Steps(10);
      const s2 = buildBambooStage2Steps(10);
      const s3 = buildBambooStage3Steps(10);

      expect(s1.length).toBeGreaterThan(0);
      expect(s1[0].stepIndex).toBe(0);
      expect(s2.length).toBeGreaterThan(0);
      expect(s2[0].stepIndex).toBe(0);
      expect(s3.length).toBeGreaterThan(0);
      expect(s3[0].stepIndex).toBe(0);
    });

    it('S2 贪心计算乘积结果准确性 (n=10 -> 36, n=2 -> 1, n=3 -> 2)', () => {
      const s10 = buildBambooStage2Steps(10);
      expect(s10[s10.length - 1].currentProduct).toBe('36');

      const s2 = buildBambooStage2Steps(2);
      expect(s2[s2.length - 1].currentProduct).toBe('1');

      const s3 = buildBambooStage2Steps(3);
      expect(s3[s3.length - 1].currentProduct).toBe('2');
    });

    it('四语言代码行号在合法区间内', () => {
      const s2 = buildBambooStage2Steps(10);
      for (const step of s2) {
        expect(step.codeLine.java).toBeGreaterThanOrEqual(1);
        expect(step.codeLine.java).toBeLessThanOrEqual(CUTTING_BAMBOO_STAGE2_CODES.java.length);
        expect(step.codeLine.cpp).toBeGreaterThanOrEqual(1);
        expect(step.codeLine.cpp).toBeLessThanOrEqual(CUTTING_BAMBOO_STAGE2_CODES.cpp.length);
        expect(step.codeLine.python).toBeGreaterThanOrEqual(1);
        expect(step.codeLine.python).toBeLessThanOrEqual(CUTTING_BAMBOO_STAGE2_CODES.python.length);
        expect(step.codeLine.javascript).toBeGreaterThanOrEqual(1);
        expect(step.codeLine.javascript).toBeLessThanOrEqual(CUTTING_BAMBOO_STAGE2_CODES.javascript.length);
      }
    });
  });

  // 2. 分成 k 份的最大乘积
  describe('Code02: 分成 k 份的最大乘积 (Maximum Product Divided into k Parts)', () => {
    it('S1 暴力、S2 均分贪心、S3 极差反证生成合法入口帧', () => {
      const s1 = buildMaxProductKStage1Steps(14, 4);
      const s2 = buildMaxProductKStage2Steps(14, 4);
      const s3 = buildMaxProductKStage3Steps(14, 4);

      expect(s1[0].stepIndex).toBe(0);
      expect(s2[0].stepIndex).toBe(0);
      expect(s3[0].stepIndex).toBe(0);
    });

    it('S2 均分计算准确性 (14 拆 4 份 -> 3,3,4,4 -> 乘积 144)', () => {
      const s2 = buildMaxProductKStage2Steps(14, 4);
      expect(s2[s2.length - 1].currentProduct).toBe('144');
    });

    it('四语言行号映射在有效代码行内', () => {
      const s2 = buildMaxProductKStage2Steps(14, 4);
      for (const step of s2) {
        expect(step.codeLine.java).toBeLessThanOrEqual(MAX_PRODUCT_K_STAGE2_CODES.java.length);
        expect(step.codeLine.cpp).toBeLessThanOrEqual(MAX_PRODUCT_K_STAGE2_CODES.cpp.length);
        expect(step.codeLine.python).toBeLessThanOrEqual(MAX_PRODUCT_K_STAGE2_CODES.python.length);
        expect(step.codeLine.javascript).toBeLessThanOrEqual(MAX_PRODUCT_K_STAGE2_CODES.javascript.length);
      }
    });
  });

  // 3. 会议独占时间段的最大会议数量
  describe('Code03: 会议独占时间段的最大会议数量 (Meeting Monopoly)', () => {
    it('S1, S2, S3 生成有效步骤与甘特区间', () => {
      const input = '1,2; 2,3; 3,4; 1,3';
      const s1 = buildMeetingMonopolySteps(input, 1);
      const s2 = buildMeetingMonopolySteps(input, 2);
      const s3 = buildMeetingMonopolySteps(input, 3);

      expect(s1[0].stepIndex).toBe(0);
      expect(s2[0].stepIndex).toBe(0);
      expect(s3[0].stepIndex).toBe(0);
    });

    it('S2 贪心正确求出无重叠最大会议数为 3', () => {
      const input = '1,2; 2,3; 3,4; 1,3';
      const s2 = buildMeetingMonopolySteps(input, 2);
      const last = s2[s2.length - 1];
      expect(last.selectedCount).toBe(3);
    });
  });

  // 4. 会议只占一天的最大会议数量
  describe('Code04: 会议只占一天的最大会议数量 (Meeting One Day)', () => {
    it('S1, S2, S3 正确生成带日历推进的步进序列', () => {
      const input = '1,2; 2,3; 3,4; 1,2';
      const s1 = buildMeetingOneDaySteps(input, 1);
      const s2 = buildMeetingOneDaySteps(input, 2);
      const s3 = buildMeetingOneDaySteps(input, 3);

      expect(s1[0].stepIndex).toBe(0);
      expect(s2[0].stepIndex).toBe(0);
      expect(s3[0].stepIndex).toBe(0);
    });

    it('S2 小根堆早截止贪心正确参会 (例如 1,2; 2,3; 3,4; 1,2 -> 4 场)', () => {
      const input = '1,2; 2,3; 3,4; 1,2';
      const s2 = buildMeetingOneDaySteps(input, 2);
      const last = s2[s2.length - 1];
      expect(last.totalAttended).toBe(4);
    });
  });

  // 5. IPO 最大化资本
  describe('Code05: IPO 最大化资本 (IPO)', () => {
    it('S1, S2, S3 生成双堆协同步进', () => {
      const s1 = buildIPOSteps(2, 0, '1, 2, 3', '0, 1, 1', 1);
      const s2 = buildIPOSteps(2, 0, '1, 2, 3', '0, 1, 1', 2);
      const s3 = buildIPOSteps(2, 0, '1, 2, 3', '0, 1, 1', 3);

      expect(s1[0].stepIndex).toBe(0);
      expect(s2[0].stepIndex).toBe(0);
      expect(s3[0].stepIndex).toBe(0);
    });

    it('S2 双堆贪心正确滚雪球最终资本 (w=0, k=2 -> 选P1(利1,资0) -> w=1 -> 选P3(利3,资1) -> w=4)', () => {
      const s2 = buildIPOSteps(2, 0, '1, 2, 3', '0, 1, 1', 2);
      const last = s2[s2.length - 1];
      expect(last.capital).toBe(4);
    });
  });

  // 6. 加入差值绝对值直到长度固定
  describe('Code06: 加入差值绝对值直到长度固定 (Absolute Value Add to Array)', () => {
    it('S1, S2, S3 步进序列与数论推演合法', () => {
      const s1 = buildAbsValueAddSteps('3, 9', 1);
      const s2 = buildAbsValueAddSteps('3, 9', 2);
      const s3 = buildAbsValueAddSteps('3, 9', 3);

      expect(s1[0].stepIndex).toBe(0);
      expect(s2[0].stepIndex).toBe(0);
      expect(s3[0].stepIndex).toBe(0);
    });

    it('S2 GCD 数论贪心正确计算终态长度 ([3, 9] -> 生成 6 -> 总长 3)', () => {
      const s2 = buildAbsValueAddSteps('3, 9', 2);
      const last = s2[s2.length - 1];
      expect(last.theoreticalCount).toBe(3);
    });

    it('含相同数产生 0 的情况 ([2, 6, 2] -> GCD=2, max=6, 包含0 -> 4个元素: 0,2,4,6)', () => {
      const s2 = buildAbsValueAddSteps('2, 6, 2', 2);
      const last = s2[s2.length - 1];
      expect(last.theoreticalCount).toBe(4);
    });
  });

  describe('Class 090 贪心算法专题 注册中心与别名统合门禁', () => {
    const expectedGreedy090 = [
      { id: 'cutting-bamboo', aliases: ['class090-code01', 'cutting-bamboo-343', 'leetcode-343', 'integer-break-ii'] },
      { id: 'maximum-product-k-parts', aliases: ['class090-code02', 'max-product-k-parts', 'divide-k-parts'] },
      { id: 'meeting-monopoly', aliases: ['class090-code03', 'meeting-monopoly-435', 'leetcode-435', 'luogu-p1803'] },
      { id: 'meeting-one-day', aliases: ['class090-code04', 'meeting-one-day-1353', 'leetcode-1353'] },
      { id: 'ipo-max-capital', aliases: ['class090-code05', 'ipo', 'ipo-502', 'leetcode-502'] },
      { id: 'absolute-value-add-to-array', aliases: ['class090-code06', 'absolute-value-add', 'gcd-closure-array'] },
    ];

    it('Class 090 全量 6 大贪心算法必须成功注册且别名可正反向查询', async () => {
      const { algorithmRegistry } = await import('../../../../core/algorithm-registry');
      await import('../../../batch-5-index');

      for (const item of expectedGreedy090) {
        const manifest = algorithmRegistry.getManifest(item.id);
        expect(manifest, `算法 [${item.id}] 必须成功注册`).toBeDefined();
        for (const alias of item.aliases) {
          expect(manifest?.aliases, `算法 [${item.id}] 必须包含别名 [${alias}]`).toContain(alias);
          const byAlias = algorithmRegistry.getManifest(alias);
          expect(byAlias?.id, `别名 [${alias}] 必须解析至主 ID [${item.id}]`).toBe(item.id);
        }
      }
    });
  });
});
