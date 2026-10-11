/**
 * Hard 25: 寻找重复数 — 步进推演编译器
 * LeetCode 287: 数组链表化与 Floyd 快慢指针判圈
 */

import { StepBase } from '../../../core/step-visualizer';

export interface DuplicateNumberStep extends StepBase {
  nums: number[];
  slow: number;
  fast: number;
  phase: 'init' | 'phase1_chase' | 'met' | 'phase2_find_entry' | 'finish';
  duplicate: number | null;
  message: string;
  log: string;
  codeLine?: number | Record<string, number>;
}

export const FIND_DUPLICATE_CODES = {
  java: `public class Solution {
    public int findDuplicate(int[] nums) {
        // 阶段一：快慢指针在有向图环中相遇
        int slow = nums[0];
        int fast = nums[nums[0]];
        while (slow != fast) {
            slow = nums[slow];
            fast = nums[nums[fast]];
        }
        // 阶段二：寻找环的入口（即重复数字）
        int p1 = 0;
        int p2 = slow;
        while (p1 != p2) {
            p1 = nums[p1];
            p2 = nums[p2];
        }
        return p1;
    }
}`,
  cpp: `class Solution {
public:
    int findDuplicate(vector<int>& nums) {
        int slow = nums[0], fast = nums[nums[0]];
        while (slow != fast) {
            slow = nums[slow];
            fast = nums[nums[fast]];
        }
        int p1 = 0, p2 = slow;
        while (p1 != p2) {
            p1 = nums[p1];
            p2 = nums[p2];
        }
        return p1;
    }
};`,
  python: `class Solution:
    def findDuplicate(self, nums: list[int]) -> int:
        slow = nums[0]
        fast = nums[nums[0]]
        while slow != fast:
            slow = nums[slow]
            fast = nums[nums[fast]]
        p1 = 0
        p2 = slow
        while p1 != p2:
            p1 = nums[p1]
            p2 = nums[p2]
        return p1`,
};

export const FIND_DUPLICATE_CODE_LINES: Record<string, Record<string, number>> = {
  init: { java: 4, cpp: 3, python: 2 },
  chase: { java: 6, cpp: 6, python: 5 },
  met: { java: 8, cpp: 7, python: 6 },
  phase2Init: { java: 11, cpp: 10, python: 8 },
  phase2Step: { java: 14, cpp: 13, python: 11 },
  finish: { java: 18, cpp: 16, python: 13 },
};

export function buildFindDuplicateSteps(nums: number[] = [1, 3, 4, 2, 2]): DuplicateNumberStep[] {
  const steps: DuplicateNumberStep[] = [];

  let slow = nums[0];
  let fast = nums[nums[0]];

  // Step 0: Init
  steps.push({
    nums: [...nums],
    slow,
    fast,
    phase: 'init',
    duplicate: null,
    message: `算法启动：将 nums 看作图结构 i ➔ nums[i]。初始 slow = nums[0] = ${slow}, fast = nums[nums[0]] = ${fast}。准备进行阶段一快慢指针相遇判定。`,
    log: `初始化双指针: slow = ${slow}, fast = ${fast}`,
    codeLine: FIND_DUPLICATE_CODE_LINES.init,
  });

  // Phase 1
  let iter = 0;
  while (slow !== fast) {
    iter++;
    slow = nums[slow];
    fast = nums[nums[fast]];

    if (slow === fast) {
      steps.push({
        nums: [...nums],
        slow,
        fast,
        phase: 'met',
        duplicate: null,
        message: `⚡ 快慢指针在节点值 [${slow}] 处相遇！证明下标拓扑图中必定存在环结构。准备进入阶段二。`,
        log: `阶段一相遇: slow = fast = ${slow}`,
        codeLine: FIND_DUPLICATE_CODE_LINES.met,
      });
      break;
    } else {
      steps.push({
        nums: [...nums],
        slow,
        fast,
        phase: 'phase1_chase',
        duplicate: null,
        message: `阶段一追赶：slow 走一步至 [${slow}]，fast 走两步至 [${fast}]。`,
        log: `追赶中: slow=${slow}, fast=${fast}`,
        codeLine: FIND_DUPLICATE_CODE_LINES.chase,
      });
    }
  }

  // Phase 2
  let p1 = 0;
  let p2 = slow;

  steps.push({
    nums: [...nums],
    slow: p1,
    fast: p2,
    phase: 'phase2_find_entry',
    duplicate: null,
    message: `阶段二重置：令 p1 = 0（起点），p2 = ${p2}（相遇点）。两者每次均单步推进 (p = nums[p])，直至相撞。`,
    log: `阶段二初始化: p1 = 0, p2 = ${p2}`,
    codeLine: FIND_DUPLICATE_CODE_LINES.phase2Init,
  });

  while (p1 !== p2) {
    p1 = nums[p1];
    p2 = nums[p2];

    if (p1 === p2) {
      steps.push({
        nums: [...nums],
        slow: p1,
        fast: p2,
        phase: 'finish',
        duplicate: p1,
        message: `🎯 指针 p1 与 p2 在节点 [${p1}] 再次相碰！该节点为环的入口，即整个数组中唯一重复的数字为 【${p1}】！`,
        log: `成功定位重复数字: ${p1}`,
        codeLine: FIND_DUPLICATE_CODE_LINES.finish,
      });
      break;
    } else {
      steps.push({
        nums: [...nums],
        slow: p1,
        fast: p2,
        phase: 'phase2_find_entry',
        duplicate: null,
        message: `阶段二推进：p1 走至 [${p1}]，p2 走至 [${p2}]。`,
        log: `推进: p1=${p1}, p2=${p2}`,
        codeLine: FIND_DUPLICATE_CODE_LINES.phase2Step,
      });
    }
  }

  return steps;
}
