/**
 * Hard 25: 寻找重复数 (Find the Duplicate Number)
 * LeetCode 287 (Medium-Hard / 顶级面试数学转化题)
 * 核心原语:
 *  给定包含 n + 1 个整数的数组 nums，其数字均在 [1, n] 范围内
 *  要求：不能修改数组、只能使用 O(1) 额外空间、必须在小于 O(N^2) 时间内完成
 *  本质转化：将数组视为单链表，下标 i 指向下一个节点 nums[i]
 *  由于鸽巢原理，必定存在多个入度指向同一个值，形成带环链表，且环的入口恰好就是重复数字！
 *  直接套用 Floyd 快慢指针判圈算法，时间 O(N)，空间严格 O(1)。
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';

export interface DuplicateNumberStep extends StepBase {
  nums: number[];
  slow: number;
  fast: number;
  phase: 'init' | 'phase1_chase' | 'met' | 'phase2_find_entry' | 'finish';
  duplicate: number | null;
  message: string;
  log: string;
  codeLine: number;
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
    codeLine: 4,
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
        codeLine: 8,
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
        codeLine: 6,
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
    codeLine: 12,
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
        codeLine: 18,
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
        codeLine: 15,
      });
    }
  }

  return steps;
}

export function renderFindDuplicateCanvas(container: HTMLElement, step: DuplicateNumberStep) {
  const arrayCardsHtml = step.nums
    .map((v, i) => {
      const isSlow = step.slow === i;
      const isFast = step.fast === i;
      const isDup = step.duplicate === v;

      let border = 'border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(30, 41, 59, 0.7);';
      if (isDup) {
        border = 'border: 2px solid #34d399; background: rgba(6, 78, 59, 0.5); box-shadow: 0 0 12px rgba(52, 211, 153, 0.4);';
      } else if (isSlow && isFast) {
        border = 'border: 2px solid #fbbf24; background: rgba(120, 53, 15, 0.5);';
      } else if (isSlow) {
        border = 'border: 2px solid #38bdf8; background: rgba(2, 132, 199, 0.3);';
      } else if (isFast) {
        border = 'border: 2px solid #f43f5e; background: rgba(190, 18, 60, 0.3);';
      }

      return `
      <div style="
        padding: 10px 14px;
        border-radius: 8px;
        ${border}
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 65px;
        transition: all 0.2s;
      ">
        <div style="font-size: 10px; color: #94a3b8; font-family: monospace;">idx: [${i}]</div>
        <div style="font-size: 20px; font-weight: bold; color: #f8fafc; margin: 4px 0;">${v}</div>
        <div style="font-size: 10px; color: #64748b;">➔ [${v}]</div>
      </div>
    `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 12px; padding: 16px; background: rgba(15, 23, 42, 0.6); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08);">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 14px; font-weight: bold; color: #e2e8f0;">数组下标有向图映射与快慢指针沙盘</span>
          <span style="padding: 2px 6px; font-size: 11px; border-radius: 4px; background: #1e293b; color: #94a3b8; font-family: monospace;">
            阶段: ${step.phase}
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; font-size: 12px;">
          <span style="color: #38bdf8;">slow / p1: ${step.slow}</span>
          <span style="color: #f43f5e;">fast / p2: ${step.fast}</span>
          ${
            step.duplicate !== null
              ? `<span style="padding: 2px 8px; border-radius: 4px; font-weight: bold; background: rgba(52, 211, 153, 0.2); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.3);">重复数字: ${step.duplicate}</span>`
              : ''
          }
        </div>
      </div>

      <!-- 数组卡片 -->
      <div style="display: flex; gap: 10px; flex-wrap: wrap; padding: 16px; background: rgba(2, 6, 23, 0.4); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05);">
        ${arrayCardsHtml}
      </div>

      <!-- 核心原理解析卡 -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: auto;">
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(56, 189, 248, 0.3); background: rgba(14, 165, 233, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #38bdf8;">下标链表化建图</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">由于元素在 1~n 且有 n+1 个数，每个 i 连向 nums[i]，0 作为永不在环内的虚拟头。</div>
        </div>
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.3); background: rgba(251, 191, 36, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #fde047;">多入度必聚环入口</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">重复数字意味着有多个下标的值相同，即有两个不同节点指向它，它必定是环入口！</div>
        </div>
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(52, 211, 153, 0.3); background: rgba(16, 185, 129, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #34d399;">O(1) 绝杀苛刻约束</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">不修改原数组、不占用额外数组空间、不用哈希表，Floyd 判圈以常数空间秒解。</div>
        </div>
      </div>
    </div>
  `;
}

export const findDuplicateNumber287Visualizer = registerDeclarativeAlgorithm<DuplicateNumberStep>({
  id: 'find-duplicate-number-287',
  name: 'Hard 25: 寻找重复数 (LeetCode 287)',
  category: 'array',
  icon: '🔍',
  difficulty: 3,
  levelOrder: 287,
  learningGoal: '掌握将静态数组转化为有向图链表的数学抽象技巧，深刻理解鸽巢原理与 Floyd 快慢指针在数组查重中的经典运用',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 287 - Medium / Hard 考核)</h3>
      <p>给定一个包含 <code>n + 1</code> 个整数的数组 <code>nums</code> ，其数字都在 <code>[1, n]</code> 范围内（包括 1 和 n），可知至少存在一个重复的整数。假设 <code>nums</code> 只有一个重复的整数，返回这个重复的数：</p>
      <ul>
        <li><strong>极其严格的约束</strong>：
          <br/>1. <strong>不能修改原数组</strong>（不能排序，不能打负号原地标记）；
          <br/>2. <strong>只能使用 $O(1)$ 的额外空间</strong>（不能用哈希表或计数数组）；
          <br/>3. 时间复杂度必须小于 $O(N^2)$。
        </li>
        <li><strong>核心解法</strong>：将数组抽象成单链表，每个下标 <code>i</code> 指向 <code>nums[i]</code>。根据鸽巢原理，存在两个以上下标指向同一个重复数字，这就构成了“入度 $\ge 2$”的入环节点。直接应用 <strong>Floyd 快慢指针判圈算法</strong>！</li>
      </ul>
    </div>
  `,
  codeLanguages: FIND_DUPLICATE_CODES,
  inputs: [
    {
      id: 'case',
      label: '预设数组用例',
      type: 'select',
      defaultValue: 'case1',
      options: [
        { label: '[1, 3, 4, 2, 2] (重复数字 2)', value: 'case1' },
        { label: '[3, 1, 3, 4, 2] (重复数字 3)', value: 'case2' },
      ],
    },
  ],
  generateSteps: (input) => {
    const c = input?.case || 'case1';
    const nums = c === 'case2' ? [3, 1, 3, 4, 2] : [1, 3, 4, 2, 2];
    return buildFindDuplicateSteps(nums);
  },
  renderCanvas: (container, step) => {
    renderFindDuplicateCanvas(container, step);
  },
});
