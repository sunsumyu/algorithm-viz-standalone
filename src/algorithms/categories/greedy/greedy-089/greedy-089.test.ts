/**
 * 第 89 课：左神贪心算法专题 1 - 自动化防退化机械约束与行号合法性测试套件
 * 遵循《算法可视化项目全栈开发终极规范》(algo-viz-authoring) 约束：
 *   1. Step 0 入口帧合法性断言
 *   2. 四语言（Java / C++ / Python / JavaScript）1-based 相对行号超界断言
 *   3. 算法核心贪心结果正确性断言
 */

import { describe, it, expect } from 'vitest';
import {
  buildLargestNumberStage1Steps,
  buildLargestNumberStage2Steps,
  buildLargestNumberStage3Steps,
} from './largest-number-renderer';
import {
  buildTwoCityStage1Steps,
  buildTwoCityStage2Steps,
  buildTwoCityStage3Steps,
} from './two-city-scheduling-renderer';
import {
  buildEatOrangesStage1Steps,
  buildEatOrangesStage2Steps,
  buildEatOrangesStage3Steps,
} from './minimum-eat-oranges-renderer';
import {
  buildMeetingRoomsStage1Steps,
  buildMeetingRoomsStage2Steps,
  buildMeetingRoomsStage3Steps,
} from './meeting-rooms-ii-renderer';
import {
  buildCourseScheduleStage1Steps,
  buildCourseScheduleStage2Steps,
  buildCourseScheduleStage3Steps,
} from './course-schedule-iii-renderer';
import {
  buildConnectSticksStage1Steps,
  buildConnectSticksStage2Steps,
  buildConnectSticksStage3Steps,
} from './minimum-cost-connect-sticks-renderer';
import {
  LARGEST_NUMBER_STAGE1_CODES,
  LARGEST_NUMBER_STAGE2_CODES,
  LARGEST_NUMBER_STAGE3_CODES,
  TWO_CITY_STAGE1_CODES,
  TWO_CITY_STAGE2_CODES,
  TWO_CITY_STAGE3_CODES,
  EAT_ORANGES_STAGE1_CODES,
  EAT_ORANGES_STAGE2_CODES,
  EAT_ORANGES_STAGE3_CODES,
  MEETING_ROOMS_STAGE1_CODES,
  MEETING_ROOMS_STAGE2_CODES,
  MEETING_ROOMS_STAGE3_CODES,
  COURSE_SCHEDULE_STAGE1_CODES,
  COURSE_SCHEDULE_STAGE2_CODES,
  COURSE_SCHEDULE_STAGE3_CODES,
  CONNECT_STICKS_STAGE1_CODES,
  CONNECT_STICKS_STAGE2_CODES,
  CONNECT_STICKS_STAGE3_CODES,
} from './greedy-089-stage-codes';

function verifyStepInvariants(
  steps: Array<{ decision: string; codeLine?: Record<string, number> }>,
  codeLangs: Record<string, string[]>,
  algoName: string
) {
  expect(steps.length, `${algoName} 步数必须 > 0`).toBeGreaterThan(0);

  // 1. Step 0 入口帧验证
  expect(steps[0].decision, `${algoName} Step 0 必须为函数入口`).toMatch(/(入口|开始|初始化|阶段)/);

  // 2. 四语言行号合法性断言
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    expect(step.codeLine, `${algoName} Step #${i} 缺少 codeLine 映射字典`).toBeDefined();
    for (const [lang, line] of Object.entries(step.codeLine!)) {
      const codeArr = codeLangs[lang];
      expect(codeArr, `${algoName} 缺少语言 ${lang} 的代码定义`).toBeDefined();
      expect(
        line,
        `${algoName} Step #${i} 语言 ${lang} 行号 ${line} 超出合法区间 [1, ${codeArr.length}]`
      ).toBeGreaterThanOrEqual(1);
      expect(
        line,
        `${algoName} Step #${i} 语言 ${lang} 行号 ${line} 超出合法区间 [1, ${codeArr.length}]`
      ).toBeLessThanOrEqual(codeArr.length);
    }
  }
}

describe('第 89 课贪心专题 1：全算法防退化与四语言联动核验', () => {
  describe('Code01 最大数 (Largest Number)', () => {
    it('Stage 1 暴力全排列步进合法', () => {
      const steps = buildLargestNumberStage1Steps([10, 2]);
      verifyStepInvariants(steps, LARGEST_NUMBER_STAGE1_CODES, '最大数 Stage 1');
      const last = steps[steps.length - 1];
      expect(last.finalAns).toBe('210');
    });

    it('Stage 2 贪心排序推演合法', () => {
      const steps = buildLargestNumberStage2Steps([3, 30, 34, 5, 9]);
      verifyStepInvariants(steps, LARGEST_NUMBER_STAGE2_CODES, '最大数 Stage 2');
      const last = steps[steps.length - 1];
      expect(last.finalAns).toBe('9534330');
    });

    it('Stage 2 全 0 特判处理正确', () => {
      const steps = buildLargestNumberStage2Steps([0, 0]);
      verifyStepInvariants(steps, LARGEST_NUMBER_STAGE2_CODES, '最大数 Stage 2 (全0)');
      const last = steps[steps.length - 1];
      expect(last.finalAns).toBe('0');
    });

    it('Stage 3 邻项交换证明步进合法', () => {
      const steps = buildLargestNumberStage3Steps([10, 2]);
      verifyStepInvariants(steps, LARGEST_NUMBER_STAGE3_CODES, '最大数 Stage 3');
    });
  });

  describe('Code02 两地调度 (Two City Scheduling)', () => {
    const costs = [
      [10, 20],
      [30, 200],
      [400, 50],
      [30, 20],
    ];

    it('Stage 1 暴力回溯步进合法', () => {
      const steps = buildTwoCityStage1Steps(costs);
      verifyStepInvariants(steps, TWO_CITY_STAGE1_CODES, '两地调度 Stage 1');
      const last = steps[steps.length - 1];
      expect(last.totalCost).toBe(110);
    });

    it('Stage 2 差额排序贪心步进合法且结果一致', () => {
      const steps = buildTwoCityStage2Steps(costs);
      verifyStepInvariants(steps, TWO_CITY_STAGE2_CODES, '两地调度 Stage 2');
      const last = steps[steps.length - 1];
      expect(last.totalCost).toBe(110);
    });

    it('Stage 3 费用置换反证步进合法', () => {
      const steps = buildTwoCityStage3Steps(costs);
      verifyStepInvariants(steps, TWO_CITY_STAGE3_CODES, '两地调度 Stage 3');
    });
  });

  describe('Code03 吃橘子的最少天数 (Minimum Eat Oranges)', () => {
    it('Stage 1 暴力 -1 递归树合法', () => {
      const steps = buildEatOrangesStage1Steps(6);
      verifyStepInvariants(steps, EAT_ORANGES_STAGE1_CODES, '吃橘子 Stage 1');
      const last = steps[steps.length - 1];
      expect(last.finalAns).toBe(3);
    });

    it('Stage 2 贪心跨步除法 + 记忆化合法且结果正确', () => {
      const steps = buildEatOrangesStage2Steps(10);
      verifyStepInvariants(steps, EAT_ORANGES_STAGE2_CODES, '吃橘子 Stage 2');
      const last = steps[steps.length - 1];
      expect(last.finalAns).toBe(4);
    });

    it('Stage 3 贪心跳跃证明步进合法', () => {
      const steps = buildEatOrangesStage3Steps(10);
      verifyStepInvariants(steps, EAT_ORANGES_STAGE3_CODES, '吃橘子 Stage 3');
    });
  });

  describe('Code04 会议室 II (Meeting Rooms II)', () => {
    const intervals = [
      [0, 30],
      [5, 10],
      [15, 20],
    ];

    it('Stage 1 暴力并发重叠扫描合法', () => {
      const steps = buildMeetingRoomsStage1Steps(intervals);
      verifyStepInvariants(steps, MEETING_ROOMS_STAGE1_CODES, '会议室 II Stage 1');
      const last = steps[steps.length - 1];
      expect(last.maxRooms).toBe(2);
    });

    it('Stage 2 小根堆贪心推演合法且结果一致', () => {
      const steps = buildMeetingRoomsStage2Steps(intervals);
      verifyStepInvariants(steps, MEETING_ROOMS_STAGE2_CODES, '会议室 II Stage 2');
      const last = steps[steps.length - 1];
      expect(last.maxRooms).toBe(2);
    });

    it('Stage 3 峰值重叠证明合法', () => {
      const steps = buildMeetingRoomsStage3Steps(intervals);
      verifyStepInvariants(steps, MEETING_ROOMS_STAGE3_CODES, '会议室 II Stage 3');
    });
  });

  describe('Code05 课程表 III (Course Schedule III)', () => {
    const courses = [
      [100, 200],
      [200, 1300],
      [1000, 1250],
      [2000, 3200],
    ];

    it('Stage 1 暴力子集回溯合法', () => {
      const steps = buildCourseScheduleStage1Steps(courses);
      verifyStepInvariants(steps, COURSE_SCHEDULE_STAGE1_CODES, '课程表 III Stage 1');
      const last = steps[steps.length - 1];
      expect(last.selectedCount).toBe(3);
    });

    it('Stage 2 大根堆反悔贪心合法且成功反悔置换', () => {
      const steps = buildCourseScheduleStage2Steps(courses);
      verifyStepInvariants(steps, COURSE_SCHEDULE_STAGE2_CODES, '课程表 III Stage 2');
      const last = steps[steps.length - 1];
      expect(last.selectedCount).toBe(3);
    });

    it('Stage 3 反悔替换不劣性证明合法', () => {
      const steps = buildCourseScheduleStage3Steps(courses);
      verifyStepInvariants(steps, COURSE_SCHEDULE_STAGE3_CODES, '课程表 III Stage 3');
    });
  });

  describe('Code06 连接棒材的最低费用 (Connect Sticks)', () => {
    const sticks = [2, 4, 3];

    it('Stage 1 暴力合并对比合法', () => {
      const steps = buildConnectSticksStage1Steps(sticks);
      verifyStepInvariants(steps, CONNECT_STICKS_STAGE1_CODES, '连接棒材 Stage 1');
      const last = steps[steps.length - 1];
      expect(last.totalCost).toBe(14);
    });

    it('Stage 2 小根堆哈夫曼合并合法且总费用最低', () => {
      const steps = buildConnectSticksStage2Steps(sticks);
      verifyStepInvariants(steps, CONNECT_STICKS_STAGE2_CODES, '连接棒材 Stage 2');
      const last = steps[steps.length - 1];
      expect(last.totalCost).toBe(14);
    });

    it('Stage 3 哈夫曼深度加权证明合法', () => {
      const steps = buildConnectSticksStage3Steps(sticks);
      verifyStepInvariants(steps, CONNECT_STICKS_STAGE3_CODES, '连接棒材 Stage 3');
    });
  });
});
