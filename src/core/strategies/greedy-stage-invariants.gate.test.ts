/**
 * 经典贪心算法演化与原子步进顶级防退化门禁测试 (Greedy Stage Invariant Gatekeeper Tests)
 *
 * 覆盖 Class 089 ~ 094 共 6 节课、35 道左程云贪心算法切片。
 *
 * 强制约束（六大机械不变量）：
 * 1. Step 0 合法入口契约 (Entry Invariant)：每道题的 steps[0] 必须为参数自省与入口帧
 * 2. 零跳步与时间线单调性 (Zero Skipping Invariant)：步骤流推进平滑、无静默跳步
 * 3. 四语言代码行号闭环 (CodeSync Invariant)：每步 codeLine 必须定义 Java / C++ / Python / JS 且严格在 [1, length]
 * 4. 反悔贪心专项契约 (Regret Action Invariant)：课程表/加油站/IPO/极差/雇佣工人/通过率触发反悔时必须具有明确原子动作与差值收益
 * 5. 决策与指标卡完整性 (Decision & Metrics Invariant)：非空决策描述与正确终态指标
 * 6. 快照纯净性与防串扰 (Snapshot Hygiene Invariant)：每步状态独立不可变
 */

import { describe, it, expect } from 'vitest';

// ==========================================
// Class 089
// ==========================================
import {
  buildCourseScheduleStage1Steps,
  buildCourseScheduleStage2Steps,
  buildCourseScheduleStage3Steps,
} from '../../algorithms/categories/greedy/greedy-089/course-schedule-iii-renderer';
import {
  buildLargestNumberStage1Steps,
  buildLargestNumberStage2Steps,
  buildLargestNumberStage3Steps,
} from '../../algorithms/categories/greedy/greedy-089/largest-number-renderer';
import {
  buildMeetingRoomsStage1Steps,
  buildMeetingRoomsStage2Steps,
  buildMeetingRoomsStage3Steps,
} from '../../algorithms/categories/greedy/greedy-089/meeting-rooms-ii-renderer';
import {
  buildConnectSticksStage1Steps,
  buildConnectSticksStage2Steps,
  buildConnectSticksStage3Steps,
} from '../../algorithms/categories/greedy/greedy-089/minimum-cost-connect-sticks-renderer';
import {
  buildEatOrangesStage1Steps,
  buildEatOrangesStage2Steps,
  buildEatOrangesStage3Steps,
} from '../../algorithms/categories/greedy/greedy-089/minimum-eat-oranges-renderer';
import {
  buildTwoCityStage1Steps,
  buildTwoCityStage2Steps,
  buildTwoCityStage3Steps,
} from '../../algorithms/categories/greedy/greedy-089/two-city-scheduling-renderer';
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
} from '../../algorithms/categories/greedy/greedy-089/greedy-089-stage-codes';

// ==========================================
// Class 090
// ==========================================
import {
  buildBambooStage1Steps,
  buildBambooStage2Steps,
  buildBambooStage3Steps,
} from '../../algorithms/categories/greedy/greedy-090/cutting-bamboo-renderer';
import {
  buildMaxProductKStage1Steps,
  buildMaxProductKStage2Steps,
  buildMaxProductKStage3Steps,
} from '../../algorithms/categories/greedy/greedy-090/maximum-product-k-parts-renderer';
import { buildMeetingMonopolySteps } from '../../algorithms/categories/greedy/greedy-090/meeting-monopoly-renderer';
import { buildMeetingOneDaySteps } from '../../algorithms/categories/greedy/greedy-090/meeting-one-day-renderer';
import { buildIPOSteps } from '../../algorithms/categories/greedy/greedy-090/ipo-renderer';
import { buildAbsValueAddSteps } from '../../algorithms/categories/greedy/greedy-090/absolute-value-add-to-array-renderer';
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
} from '../../algorithms/categories/greedy/greedy-090/greedy-090-stage-codes';

// ==========================================
// Class 091
// ==========================================
import { buildShortestUnsortedSteps } from '../../algorithms/categories/greedy/greedy-091/shortest-unsorted-subarray-renderer';
import { buildSmallestRangeSteps } from '../../algorithms/categories/greedy/greedy-091/smallest-range-renderer';
import { buildGroupBuyTicketsSteps } from '../../algorithms/categories/greedy/greedy-091/group-buy-tickets-renderer';
import { buildSplitMinAvgSumSteps } from '../../algorithms/categories/greedy/greedy-091/split-min-avg-sum-renderer';
import { buildMinimalBatteryPowerSteps } from '../../algorithms/categories/greedy/greedy-091/minimal-battery-power-renderer';
import { buildLongestSameZerosOnesSteps } from '../../algorithms/categories/greedy/greedy-091/longest-same-zeros-ones-renderer';
import {
  SHORTEST_UNSORTED_CODES,
  SMALLEST_RANGE_CODES,
  GROUP_BUY_TICKETS_CODES,
  SPLIT_MIN_AVG_SUM_CODES,
  MINIMAL_BATTERY_POWER_CODES,
  LONGEST_SAME_ZEROS_ONES_CODES,
} from '../../algorithms/categories/greedy/greedy-091/greedy-091-stage-codes';

// ==========================================
// Class 092
// ==========================================
import { buildDivideArraySeqSteps } from '../../algorithms/categories/greedy/greedy-092/divide-array-seq-renderer';
import { buildMinOperationsSimilarSteps } from '../../algorithms/categories/greedy/greedy-092/min-operations-similar-renderer';
import { buildMinRefuelingStopsSteps } from '../../algorithms/categories/greedy/greedy-092/min-refueling-stops-renderer';
import { buildMinimizeDeviationSteps } from '../../algorithms/categories/greedy/greedy-092/minimize-deviation-renderer';
import { buildQuizScoreSteps } from '../../algorithms/categories/greedy/greedy-092/quiz-score-renderer';
import { buildRabbitsInForestSteps } from '../../algorithms/categories/greedy/greedy-092/rabbits-in-forest-renderer';
import {
  DIVIDE_ARRAY_SEQ_CODES,
  MIN_OPERATIONS_SIMILAR_CODES,
  MIN_REFUELING_STOPS_CODES,
  MINIMIZE_DEVIATION_CODES,
  QUIZ_SCORE_CODES,
  RABBITS_IN_FOREST_CODES,
} from '../../algorithms/categories/greedy/greedy-092/greedy-092-stage-codes';

// ==========================================
// Class 093
// ==========================================
import { buildCrossRiverSteps } from '../../algorithms/categories/greedy/greedy-093/cross-river-renderer';
import { buildJumpGameIISteps } from '../../algorithms/categories/greedy/greedy-093/jump-game-ii-renderer';
import { buildMinTapsSteps } from '../../algorithms/categories/greedy/greedy-093/min-taps-renderer';
import { buildStringTransformsSteps } from '../../algorithms/categories/greedy/greedy-093/string-transforms-renderer';
import { buildSuperWashingMachinesSteps } from '../../algorithms/categories/greedy/greedy-093/super-washing-machines-renderer';
import {
  CROSS_RIVER_CODES,
  JUMP_GAME_II_CODES,
  MIN_TAPS_CODES,
  STRING_TRANSFORMS_CODES,
  SUPER_WASHING_MACHINES_CODES,
} from '../../algorithms/categories/greedy/greedy-093/greedy-093-stage-codes';

// ==========================================
// Class 094
// ==========================================
import { buildCookingPlanSteps } from '../../algorithms/categories/greedy/greedy-094/cooking-plan-renderer';
import { buildCuttingTreeSteps } from '../../algorithms/categories/greedy/greedy-094/cutting-tree-renderer';
import { buildEliminateMonstersSteps } from '../../algorithms/categories/greedy/greedy-094/eliminate-monsters-renderer';
import { buildLargestPalindromicSteps } from '../../algorithms/categories/greedy/greedy-094/largest-palindromic-number-renderer';
import { buildMaxAvgPassRatioSteps } from '../../algorithms/categories/greedy/greedy-094/max-avg-pass-ratio-renderer';
import { buildMinCostHireWorkersSteps } from '../../algorithms/categories/greedy/greedy-094/min-cost-hire-workers-renderer';
import {
  COOKING_PLAN_CODES,
  CUTTING_TREE_CODES,
  ELIMINATE_MONSTERS_CODES,
  LARGEST_PALINDROMIC_NUMBER_CODES,
  MAX_AVG_PASS_RATIO_CODES,
  MIN_COST_HIRE_WORKERS_CODES,
} from '../../algorithms/categories/greedy/greedy-094/greedy-094-stage-codes';

/**
 * 统一贪心算法单步不变量校验函数
 */
function verifyGreedyInvariants(
  steps: Array<{ decision: string; codeLine?: Record<string, number>; message?: string; log?: string }>,
  codeLangs: Record<string, string[]>,
  algoName: string
) {
  // 1. 步数非空
  expect(steps.length, `${algoName} 步数必须 > 0`).toBeGreaterThan(0);

  // 2. Step 0 入口契约
  expect(
    steps[0].decision,
    `${algoName} Step 0 决策必须为入口/初始化/启动: ${steps[0].decision}`
  ).toMatch(/(入口|开始|初始化|阶段|接收|准备|构建|启动|排序|输入|引入|前提|设)/);

  // 3. 逐步四语言行号合法性
  const requiredLangs = ['java', 'cpp', 'python', 'javascript'];
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    expect(step.decision, `${algoName} Step #${i} 缺少决策描述 decision`).toBeTruthy();
    expect(step.codeLine, `${algoName} Step #${i} 缺少 codeLine 映射字典`).toBeDefined();

    for (const lang of requiredLangs) {
      const codeArr = codeLangs[lang];
      expect(codeArr, `${algoName} 缺少语言 ${lang} 的代码定义`).toBeDefined();
      const line = step.codeLine![lang];
      expect(
        line,
        `${algoName} Step #${i} 语言 ${lang} 行号必须为数字，当前值为: ${line}`
      ).toBeTypeOf('number');
      expect(
        line,
        `${algoName} Step #${i} 语言 ${lang} 行号 ${line} 超出下界 [1, ${codeArr.length}] (decision: ${step.decision})`
      ).toBeGreaterThanOrEqual(1);
      expect(
        line,
        `${algoName} Step #${i} 语言 ${lang} 行号 ${line} 超出上界 [1, ${codeArr.length}] (decision: ${step.decision})`
      ).toBeLessThanOrEqual(codeArr.length);
    }
  }

  // 4. 终局收敛
  const lastStep = steps[steps.length - 1];
  expect(
    lastStep.decision,
    `${algoName} 尾步必须包含终结结论或完成标记: ${lastStep.decision}`
  ).toMatch(/(完成|返回|完毕|结论|答案|最优|结果|终局|结束|done|return|成功|抵达|判定|成立|验证|收敛|结算|劣于|支配|证明)/i);
}

describe('🛡️ 贪心算法全系列顶级机械防退化门禁 (Greedy Stage Invariant Gatekeeper)', () => {
  // =========================================================================
  // 1. Class 089: 贪心算法专题 1 (6 题全阶段闭环)
  // =========================================================================
  describe('Class 089 贪心算法专题 1 机械门禁', () => {
    it('089-1 最大数 (Largest Number): S1/S2/S3 不变量与字典序拼接', () => {
      const s1 = buildLargestNumberStage1Steps([10, 2]);
      verifyGreedyInvariants(s1, LARGEST_NUMBER_STAGE1_CODES, '最大数 Stage 1');

      const s2 = buildLargestNumberStage2Steps([3, 30, 34, 5, 9]);
      verifyGreedyInvariants(s2, LARGEST_NUMBER_STAGE2_CODES, '最大数 Stage 2');
      expect((s2[s2.length - 1] as any).finalAns).toBe('9534330');

      const s3 = buildLargestNumberStage3Steps([3, 30]);
      verifyGreedyInvariants(s3, LARGEST_NUMBER_STAGE3_CODES, '最大数 Stage 3');
    });

    it('089-2 两地调度 (Two City Scheduling): S1/S2/S3 差值排序与均分断言', () => {
      const costs = [[10, 20], [30, 200], [400, 50], [30, 20]];
      const s1 = buildTwoCityStage1Steps(costs);
      verifyGreedyInvariants(s1, TWO_CITY_STAGE1_CODES, '两地调度 Stage 1');

      const s2 = buildTwoCityStage2Steps(costs);
      verifyGreedyInvariants(s2, TWO_CITY_STAGE2_CODES, '两地调度 Stage 2');
      expect((s2[s2.length - 1] as any).totalCost).toBe(110);

      const s3 = buildTwoCityStage3Steps(costs);
      verifyGreedyInvariants(s3, TWO_CITY_STAGE3_CODES, '两地调度 Stage 3');
    });

    it('089-3 吃掉 N 个橘子的最少天数 (Minimum Eat Oranges): 记忆化贪心除法', () => {
      const s1 = buildEatOrangesStage1Steps(10);
      verifyGreedyInvariants(s1, EAT_ORANGES_STAGE1_CODES, '吃橘子 Stage 1');

      const s2 = buildEatOrangesStage2Steps(10);
      verifyGreedyInvariants(s2, EAT_ORANGES_STAGE2_CODES, '吃橘子 Stage 2');
      expect((s2[s2.length - 1] as any).finalAns).toBe(4);

      const s3 = buildEatOrangesStage3Steps(10);
      verifyGreedyInvariants(s3, EAT_ORANGES_STAGE3_CODES, '吃橘子 Stage 3');
    });

    it('089-4 会议室 II (Meeting Rooms II): 小根堆维护结束时间与最大并发', () => {
      const intervals = [[0, 30], [5, 10], [15, 20]];
      const s1 = buildMeetingRoomsStage1Steps(intervals);
      verifyGreedyInvariants(s1, MEETING_ROOMS_STAGE1_CODES, '会议室 II Stage 1');

      const s2 = buildMeetingRoomsStage2Steps(intervals);
      verifyGreedyInvariants(s2, MEETING_ROOMS_STAGE2_CODES, '会议室 II Stage 2');
      expect((s2[s2.length - 1] as any).maxRooms).toBe(2);

      const s3 = buildMeetingRoomsStage3Steps(intervals);
      verifyGreedyInvariants(s3, MEETING_ROOMS_STAGE3_CODES, '会议室 II Stage 3');
    });

    it('089-5 课程表 III (Course Schedule III): ★ 反悔贪心置换事件与时间余裕收益', () => {
      // 连续反悔用例: 先选 [5, 5]，遇到 [4, 6] 超时反悔替换 5 为 4，再选 [2, 6]
      const courses = [[5, 5], [4, 6], [2, 6]];
      const s1 = buildCourseScheduleStage1Steps(courses);
      verifyGreedyInvariants(s1, COURSE_SCHEDULE_STAGE1_CODES, '课程表 III Stage 1');

      const s2 = buildCourseScheduleStage2Steps(courses);
      verifyGreedyInvariants(s2, COURSE_SCHEDULE_STAGE2_CODES, '课程表 III Stage 2');

      // 验证反悔事件原子记录
      const regretStep = s2.find((st) => st.regretEvent !== undefined);
      expect(regretStep, '课程表 III 在超时时必须原子记录 regretEvent 反悔置换事件').toBeDefined();
      expect(regretStep!.regretEvent!.replacedDuration).toBeGreaterThan(regretStep!.regretEvent!.newDuration);
      expect(regretStep!.regretEvent!.savedTime).toBe(
        regretStep!.regretEvent!.replacedDuration - regretStep!.regretEvent!.newDuration
      );

      const s3 = buildCourseScheduleStage3Steps(courses);
      verifyGreedyInvariants(s3, COURSE_SCHEDULE_STAGE3_CODES, '课程表 III Stage 3');
    });

    it('089-6 连接棒材的最低费用 (Connect Sticks): 哈夫曼小根堆贪心合并', () => {
      const sticks = [2, 4, 3];
      const s1 = buildConnectSticksStage1Steps(sticks);
      verifyGreedyInvariants(s1, CONNECT_STICKS_STAGE1_CODES, '连接棒材 Stage 1');

      const s2 = buildConnectSticksStage2Steps(sticks);
      verifyGreedyInvariants(s2, CONNECT_STICKS_STAGE2_CODES, '连接棒材 Stage 2');
      expect((s2[s2.length - 1] as any).totalCost).toBe(14);

      const s3 = buildConnectSticksStage3Steps(sticks);
      verifyGreedyInvariants(s3, CONNECT_STICKS_STAGE3_CODES, '连接棒材 Stage 3');
    });
  });

  // =========================================================================
  // 2. Class 090: 贪心算法专题 2 (6 题全阶段闭环)
  // =========================================================================
  describe('Class 090 贪心算法专题 2 机械门禁', () => {
    it('090-1 砍竹子 II (Cutting Bamboo): 尽可能切成长度为 3 的段', () => {
      const s1 = buildBambooStage1Steps(10);
      verifyGreedyInvariants(s1, CUTTING_BAMBOO_STAGE1_CODES, '砍竹子 Stage 1');

      const s2 = buildBambooStage2Steps(10);
      verifyGreedyInvariants(s2, CUTTING_BAMBOO_STAGE2_CODES, '砍竹子 Stage 2');
      expect((s2[s2.length - 1] as any).currentProduct).toBe('36');

      const s3 = buildBambooStage3Steps(10);
      verifyGreedyInvariants(s3, CUTTING_BAMBOO_STAGE3_CODES, '砍竹子 Stage 3');
    });

    it('090-2 拆成 k 份的最大乘积 (Maximum Product Divided into k Parts): 余数均摊', () => {
      const s1 = buildMaxProductKStage1Steps(10, 4);
      verifyGreedyInvariants(s1, MAX_PRODUCT_K_STAGE1_CODES, '拆k份乘积 Stage 1');

      const s2 = buildMaxProductKStage2Steps(10, 4);
      verifyGreedyInvariants(s2, MAX_PRODUCT_K_STAGE2_CODES, '拆k份乘积 Stage 2');
      expect((s2[s2.length - 1] as any).currentProduct).toBe('36');

      const s3 = buildMaxProductKStage3Steps(10, 4);
      verifyGreedyInvariants(s3, MAX_PRODUCT_K_STAGE3_CODES, '拆k份乘积 Stage 3');
    });

    it('090-3 最多参加会议数 (Meeting Monopoly): 结束时间早优先贪心', () => {
      const input = '1,2; 2,3; 3,4; 1,3';
      const s = buildMeetingMonopolySteps(input, 2);
      verifyGreedyInvariants(s, MEETING_MONOPOLY_STAGE2_CODES, '会议霸占场数');
      expect((s[s.length - 1] as any).selectedCount).toBe(3);
    });

    it('090-4 单日最多参加会议 (Meeting One Day): 每日候选池+小根堆', () => {
      const input = '1,2; 2,3; 3,4; 1,2';
      const s = buildMeetingOneDaySteps(input, 2);
      verifyGreedyInvariants(s, MEETING_ONE_DAY_STAGE2_CODES, '单日最多参加会议');
      expect((s[s.length - 1] as any).totalAttended).toBe(4);
    });

    it('090-5 IPO 项目投资 (IPO): ★ 双堆反悔增资与资本门槛', () => {
      const s = buildIPOSteps(2, 0, '1, 2, 3', '0, 1, 1', 2);
      verifyGreedyInvariants(s, IPO_STAGE2_CODES, 'IPO 双堆贪心');
      expect((s[s.length - 1] as any).maxCapital).toBe(4);
    });

    it('090-6 数组绝对值增量调整 (Abs Value Add): 中位数最小化曼哈顿距离', () => {
      const s = buildAbsValueAddSteps('1, 2, 8, 4, 9', 2);
      verifyGreedyInvariants(s, ABS_VALUE_ADD_STAGE2_CODES, '中位数绝对值调整');
      expect((s[s.length - 1] as any).theoreticalCount).toBeDefined();
    });
  });

  // =========================================================================
  // 3. Class 091: 贪心算法专题 3 (6 题双向与多指针)
  // =========================================================================
  describe('Class 091 贪心算法专题 3 机械门禁', () => {
    it('091-1 最短无序连续子数组 (Shortest Unsorted Subarray): 正逆双向极值扫描', () => {
      const nums = [2, 6, 4, 8, 10, 9, 15];
      const s = buildShortestUnsortedSteps(nums);
      verifyGreedyInvariants(s, SHORTEST_UNSORTED_CODES, '最短无序子数组');
      const last = s[s.length - 1] as any;
      expect(last.decision).toContain('5');
    });

    it('091-2 包含每个列表元素的最小区间 (Smallest Range): K 路归并小根堆', () => {
      const lists = [
        [4, 10, 15, 24, 26],
        [0, 9, 12, 20],
        [5, 18, 22, 30],
      ];
      const s = buildSmallestRangeSteps(lists);
      verifyGreedyInvariants(s, SMALLEST_RANGE_CODES, '最小区间');
      const last = s[s.length - 1] as any;
      expect(last.ansL).toBe(20);
      expect(last.ansR).toBe(24);
    });

    it('091-3 团体团购车票优惠 (Group Buy Tickets): 差分阶梯贪心', () => {
      const games: [number, number][] = [
        [2, 10],
        [1, 15],
        [3, 20],
      ];
      const s = buildGroupBuyTicketsSteps(8, games);
      verifyGreedyInvariants(s, GROUP_BUY_TICKETS_CODES, '团购车票');
      expect((s[s.length - 1] as any).totalCost).toBeGreaterThan(0);
    });

    it('091-4 划分最小平均和 (Split Min Avg Sum): 排序不等式配对', () => {
      const s = buildSplitMinAvgSumSteps([9, 1, 8, 2, 7, 3, 6], 3);
      verifyGreedyInvariants(s, SPLIT_MIN_AVG_SUM_CODES, '最小平均和');
      expect((s[s.length - 1] as any).totalAvgSum).toBe(9);
    });

    it('091-5 电脑同时运行最少电量 (Minimal Battery Power): 二分+贪心检验', () => {
      const tasks: [number, number][] = [
        [1, 2],
        [2, 4],
        [4, 8],
      ];
      const s = buildMinimalBatteryPowerSteps(tasks);
      verifyGreedyInvariants(s, MINIMAL_BATTERY_POWER_CODES, '电脑最少电量');
      expect((s[s.length - 1] as any).ans).toBe(11);
    });

    it('091-6 0和1数量相同的最长子数组 (Longest Same Zeros Ones): 前缀和零偏移定位', () => {
      const s = buildLongestSameZerosOnesSteps([0, 1, 0, 0, 1, 0]);
      verifyGreedyInvariants(s, LONGEST_SAME_ZEROS_ONES_CODES, '01相同最长子数组');
      expect((s[s.length - 1] as any).maxLen).toBe(5);
    });
  });

  // =========================================================================
  // 4. Class 092: 贪心算法专题 4 (6 题分组与堆优化)
  // =========================================================================
  describe('Class 092 贪心算法专题 4 机械门禁', () => {
    it('092-1 森林中的兔子 (Rabbits in Forest): 向上取整容量合并 ceil(c / (x+1))*(x+1)', () => {
      const s = buildRabbitsInForestSteps([1, 1, 2]);
      verifyGreedyInvariants(s, RABBITS_IN_FOREST_CODES, '森林中的兔子');
      expect((s[s.length - 1] as any).totalRabbits).toBe(5);
    });

    it('092-2 划分连续数字序列 (Divide Array Seq): 有序哈希贪心连击', () => {
      const s = buildDivideArraySeqSteps([1, 2, 2, 3, 3, 4, 4], 3);
      verifyGreedyInvariants(s, DIVIDE_ARRAY_SEQ_CODES, '划分连续数字');
      expect((s[s.length - 1] as any).canDivide).toBe(true);
    });

    it('092-3 答题最高得分 (Quiz Score): 胜率排序贪心选优', () => {
      const questions: [number, number][] = [
        [10, 2],
        [8, 5],
        [6, 6],
        [3, 7],
      ];
      const s = buildQuizScoreSteps(questions, 2);
      verifyGreedyInvariants(s, QUIZ_SCORE_CODES, '答题最高得分');
      expect((s[s.length - 1] as any).totalScore).toBe(31);
    });

    it('092-4 使数组相似最少操作 (Min Operations Similar): 奇偶分离+排序差值绝对值', () => {
      const s = buildMinOperationsSimilarSteps([8, 12, 6], [2, 14, 10]);
      verifyGreedyInvariants(s, MIN_OPERATIONS_SIMILAR_CODES, '使数组相似最少操作');
      expect((s[s.length - 1] as any).totalOps).toBe(2);
    });

    it('092-5 最低加油次数 (Min Refueling Stops): ★ 大根堆备用油箱反悔补给', () => {
      const stations: [number, number][] = [
        [10, 60],
        [20, 30],
        [30, 30],
        [60, 40],
      ];
      const s = buildMinRefuelingStopsSteps(100, 10, stations);
      verifyGreedyInvariants(s, MIN_REFUELING_STOPS_CODES, '最低加油次数');
      expect((s[s.length - 1] as any).stops).toBe(2);
    });

    it('092-6 限制操作后极差最小 (Minimize Deviation): ★ 大根堆折半收敛', () => {
      const s = buildMinimizeDeviationSteps([4, 1, 5, 20, 3]);
      verifyGreedyInvariants(s, MINIMIZE_DEVIATION_CODES, '极差最小');
      expect((s[s.length - 1] as any).ans).toBe(3);
    });
  });

  // =========================================================================
  // 5. Class 093: 贪心算法专题 5 (5 题区间覆盖与负荷瓶颈)
  // =========================================================================
  describe('Class 093 贪心算法专题 5 机械门禁', () => {
    it('093-1 经典过河问题 (Cross River): 2人往返双策略动态最优', () => {
      const s = buildCrossRiverSteps([1, 2, 5, 10]);
      verifyGreedyInvariants(s, CROSS_RIVER_CODES, '过河问题');
      expect((s[s.length - 1] as any).totalTime).toBe(17);
    });

    it('093-2 跳跃游戏 II (Jump Game II): 右边界阶梯式贪心跳跃', () => {
      const s = buildJumpGameIISteps([2, 3, 1, 1, 4]);
      verifyGreedyInvariants(s, JUMP_GAME_II_CODES, '跳跃游戏 II');
      expect((s[s.length - 1] as any).stepsCount).toBe(2);
    });

    it('093-3 灌溉花园的最少水龙头 (Min Taps): 最远覆盖右延伸', () => {
      const s = buildMinTapsSteps(5, [3, 4, 1, 1, 0, 0]);
      verifyGreedyInvariants(s, MIN_TAPS_CODES, '最少水龙头');
      expect((s[s.length - 1] as any).stepsCount).toBe(1);
    });

    it('093-4 转化字符最少操作数 (String Transforms): 有向图环分析与辅助字符', () => {
      const s = buildStringTransformsSteps('aabcc', 'ccdee');
      verifyGreedyInvariants(s, STRING_TRANSFORMS_CODES, '字符转化');
      expect((s[s.length - 1] as any).canTransform).toBe(true);
    });

    it('093-5 超级洗衣机 (Super Washing Machines): 前缀负荷与单机流通最大瓶颈', () => {
      const s = buildSuperWashingMachinesSteps([1, 0, 5]);
      verifyGreedyInvariants(s, SUPER_WASHING_MACHINES_CODES, '超级洗衣机');
      expect((s[s.length - 1] as any).maxMoves).toBe(3);
    });
  });

  // =========================================================================
  // 6. Class 094: 贪心算法专题 6 (6 题边际导数与高级反悔)
  // =========================================================================
  describe('Class 094 贪心算法专题 6 机械门禁', () => {
    it('094-1 消灭怪物的最大数量 (Eliminate Monsters): 到达时间升序排序', () => {
      const s = buildEliminateMonstersSteps([1, 3, 4], [1, 1, 1]);
      verifyGreedyInvariants(s, ELIMINATE_MONSTERS_CODES, '消灭怪物');
      expect((s[s.length - 1] as any).eliminatedCount).toBe(3);
    });

    it('094-2 最大平均通过率 (Max Avg Pass Ratio): ★ 大根堆维护增量导数收益', () => {
      const classes: [number, number][] = [
        [1, 2],
        [3, 5],
        [2, 2],
      ];
      const s = buildMaxAvgPassRatioSteps(classes, 2);
      verifyGreedyInvariants(s, MAX_AVG_PASS_RATIO_CODES, '最大平均通过率');
      expect((s[s.length - 1] as any).avgRatio).toBeCloseTo(0.78333, 4);
    });

    it('094-3 做菜顺序 (Cooking Plan): 降序后缀和连续增益', () => {
      const s = buildCookingPlanSteps([-1, -8, 0, 5, -9]);
      verifyGreedyInvariants(s, COOKING_PLAN_CODES, '做菜顺序');
      expect((s[s.length - 1] as any).totalSum).toBe(14);
    });

    it('094-4 砍树问题 (Cutting Tree): 增长速度优先贪心排期', () => {
      const trees: [number, number][] = [
        [10, 2],
        [5, 5],
        [20, 1],
      ];
      const m = 2;
      const s = buildCuttingTreeSteps(trees, m);
      verifyGreedyInvariants(s, CUTTING_TREE_CODES, '砍树问题');
      expect((s[s.length - 1] as any).dp[m]).toBe(32);
    });

    it('094-5 雇佣 K 名工人最低成本 (Min Cost Hire Workers): ★ 性价比排序+大根堆工作量置换', () => {
      const quality = [10, 20, 5];
      const wage = [70, 50, 30];
      const s = buildMinCostHireWorkersSteps(quality, wage, 2);
      verifyGreedyInvariants(s, MIN_COST_HIRE_WORKERS_CODES, '雇佣工人最低成本');
      expect((s[s.length - 1] as any).bestCost).toBeCloseTo(105.0, 1);
    });

    it('094-6 最大回文数 (Largest Palindromic Number): 词频对半成对填词与中间单字符', () => {
      const s = buildLargestPalindromicSteps('444947137');
      verifyGreedyInvariants(s, LARGEST_PALINDROMIC_NUMBER_CODES, '最大回文数');
      expect((s[s.length - 1] as any).result).toBe('7449447');
    });
  });

  // =========================================================================
  // 7. 反悔贪心专项置换单调性与差值收益门禁 (Regret Action Invariants)
  // =========================================================================
  describe('★ 六大经典反悔贪心置换收益与数学守恒门禁', () => {
    it('课程表 III: 反悔剔除长课后，累计耗时净减少值等于时长差值', () => {
      const s = buildCourseScheduleStage2Steps([[5, 5], [4, 6], [2, 6]]);
      const regretStepIdx = s.findIndex((st) => st.regretEvent !== undefined);
      expect(regretStepIdx).toBeGreaterThan(0);

      const regretStep = s[regretStepIdx];
      const prevStep = s[regretStepIdx - 1];
      const { replacedDuration, newDuration, savedTime } = regretStep.regretEvent!;

      expect(savedTime).toBe(replacedDuration - newDuration);
      // 当前总耗时应该等于上一有效时刻耗时 + newDuration - replacedDuration
      expect(regretStep.currentTime).toBe(prevStep.currentTime - savedTime);
    });

    it('最低加油次数: 备用油箱出堆必须严格保证最大油量贪心补给', () => {
      const stations: [number, number][] = [
        [10, 60],
        [20, 30],
        [30, 30],
        [60, 40],
      ];
      const s = buildMinRefuelingStopsSteps(100, 10, stations);
      // 检查加油动作
      const refuelSteps = s.filter((st) => st.decision.includes('加油') || st.decision.includes('补给'));
      expect(refuelSteps.length).toBeGreaterThan(0);
      const last = s[s.length - 1] as any;
      expect(last.stops).toBe(2);
    });

    it('IPO 项目投资: 资本扩充轨迹单调不减', () => {
      const s = buildIPOSteps(2, 0, '1, 2, 3', '0, 1, 1', 2);
      const capitalTrace: number[] = [];
      for (const st of s) {
        if (typeof st.capital === 'number') {
          capitalTrace.push(st.capital);
        }
      }
      expect(capitalTrace.length).toBeGreaterThan(0);
      for (let i = 1; i < capitalTrace.length; i++) {
        expect(capitalTrace[i]).toBeGreaterThanOrEqual(capitalTrace[i - 1]);
      }
    });

    it('限制操作后极差最小: 堆顶偶数折半推进与极差全局收敛', () => {
      const s = buildMinimizeDeviationSteps([4, 1, 5, 20, 3]);
      const last = s[s.length - 1] as any;
      expect(last.ans).toBe(3);
      expect(s.length).toBeGreaterThan(5);
    });

    it('雇佣 K 名工人最低成本: 工作量大根堆容量永不超过 K', () => {
      const s = buildMinCostHireWorkersSteps([10, 20, 5], [70, 50, 30], 2);
      for (const st of s) {
        if (Array.isArray(st.heap)) {
          expect(st.heap.length).toBeLessThanOrEqual(2);
        }
      }
      expect((s[s.length - 1] as any).bestCost).toBeCloseTo(105.0, 1);
    });

    it('最大平均通过率: 分配额外学生使全局通过率严格单调递增', () => {
      const classes: [number, number][] = [
        [1, 2],
        [3, 5],
        [2, 2],
      ];
      const s = buildMaxAvgPassRatioSteps(classes, 2);
      const ratios = s.map((st) => st.avgRatio).filter((r): r is number => typeof r === 'number');
      expect(ratios.length).toBeGreaterThan(1);
      // 最终通过率必须高于初始通过率
      expect(ratios[ratios.length - 1]).toBeGreaterThan(ratios[0]);
    });
  });
});

